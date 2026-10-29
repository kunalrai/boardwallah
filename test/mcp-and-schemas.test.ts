import { afterEach, describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../src/mcp";
import { bookingFlow, getJson, json, key, postJson, setup, type TestContext } from "./helpers";
import { toIstIso } from "../src/time";

const root = join(import.meta.dir, "..");

function schema(name: string) {
  const model = JSON.parse(readFileSync(join(root, "spec", "models", `${name}.schema.json`), "utf8")) as Record<
    string,
    unknown
  >;
  delete model.$id;
  return model;
}

function validator(name: string) {
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  return ajv.compile(schema(name));
}

function content(name: string) {
  return JSON.parse(readFileSync(join(root, "spec", "content", name), "utf8")) as Record<string, unknown>;
}

let ctx: TestContext;
afterEach(() => ctx?.close());

describe("spec models validate content", () => {
  it("validates provider content", () => {
    const validate = validator("provider");
    expect(validate(content("provider.json"))).toBe(true);
  });

  it("validates every subject and plan", () => {
    const subject = validator("subject");
    const subjects = content("subjects.json") as { subjects: unknown[] };
    for (const item of subjects.subjects) expect(subject(item)).toBe(true);

    const plan = validator("plan");
    const plans = content("plans.json") as { plans: unknown[] };
    for (const item of plans.plans) expect(plan(item)).toBe(true);
  });

  it("validates API slot, hold, booking, enquiry and problem responses", async () => {
    ctx = setup();
    const validateSlot = validator("slot");
    const validateHold = validator("hold");
    const validateBooking = validator("booking");
    const validateEnquiry = validator("enquiry");
    const validateProblem = validator("problem");

    const from = toIstIso(ctx.clock.now);
    const to = toIstIso(ctx.clock.now + 7 * 24 * 60 * 60 * 1000);
    const list = await getJson(
      ctx,
      `/api/v1/slots?locality_code=DL-NOIDA-07&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
    const slots = await json<{ slots: { id: string }[] }>(list);
    expect(validateSlot(slots.slots[0])).toBe(true);

    const bad = await getJson(ctx, "/api/v1/slots");
    expect(validateProblem(await json(bad))).toBe(true);

    const holdPost = await postJson(ctx, `/api/v1/slots/${slots.slots[0]?.id}/hold`, {});
    expect(validateHold(await json(holdPost))).toBe(true);

    const flow = await bookingFlow(ctx);
    const booking = await json<{ booking: unknown }>(flow.response);
    expect(validateBooking(booking.booking)).toBe(true);

    const enquiry = await postJson(ctx, "/api/v1/enquiries", {
      locality_code: "DL-NOIDA-07",
      board: "CBSE",
      class: 10,
      subjects: ["maths"],
      channel_hint: "web_form",
    });
    expect(validateEnquiry(await json(enquiry))).toBe(true);
  });
});

describe("MCP server", () => {
  it("lists tools and completes the full consent and booking flow", async () => {
    ctx = setup();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createMcpServer(ctx.bundle.services);
    await server.connect(serverTransport);
    const client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(clientTransport);

    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name).sort()).toEqual(
      [
        "book_trial",
        "check_trial_slots",
        "create_enquiry",
        "get_plans",
        "get_provider",
        "hold_trial_slot",
        "request_parent_consent",
        "verify_parent_consent",
      ].sort(),
    );

    const provider = await client.callTool({ name: "get_provider", arguments: {} });
    const providerData = provider.structuredContent as { tutor_name: string };
    expect(providerData.tutor_name).toBe(ctx.bundle.content.provider.tutor_name);

    const from = toIstIso(ctx.clock.now);
    const to = toIstIso(ctx.clock.now + 7 * 24 * 60 * 60 * 1000);
    const slotResult = await client.callTool({
      name: "check_trial_slots",
      arguments: { locality_code: "DL-NOIDA-07", from, to },
    });
    const slotData = slotResult.structuredContent as { slots: { id: string }[] };
    const slotId = slotData.slots[0]?.id;
    expect(slotId).toBeDefined();

    const holdResult = await client.callTool({
      name: "hold_trial_slot",
      arguments: { slot_id: slotId, idempotency_key: key("MCP-HOLD") },
    });
    const hold = holdResult.structuredContent as { id: string };
    expect(hold.id).toMatch(/^H-/);

    const consentResult = await client.callTool({
      name: "request_parent_consent",
      arguments: {
        parent_phone: "+919800000002",
        student_display_name: "Riya",
        policy_version: "1.0",
        idempotency_key: key("MCP-CONSENT"),
      },
    });
    const consentRequest = consentResult.structuredContent as { request_id: string };
    const verifyResult = await client.callTool({
      name: "verify_parent_consent",
      arguments: { request_id: consentRequest.request_id, otp: ctx.notifier.lastOtp() },
    });
    const consent = verifyResult.structuredContent as { consent_token: string };

    const bookResult = await client.callTool({
      name: "book_trial",
      arguments: {
        hold_id: hold.id,
        consent_token: consent.consent_token,
        student: { display_name: "Riya" },
        subjects: ["maths"],
        locality_code: "DL-NOIDA-07",
        idempotency_key: key("MCP-BOOK"),
      },
    });
    const booking = bookResult.structuredContent as { id: string; status: string };
    expect(booking.id).toMatch(/^B-/);
    expect(booking.status).toBe("confirmed");
    expect(JSON.stringify(bookResult)).not.toContain("9800000002");

    await client.close();
    await server.close();
  });

  it("returns machine-readable tool errors", async () => {
    ctx = setup();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createMcpServer(ctx.bundle.services);
    await server.connect(serverTransport);
    const client = new Client({ name: "test-client", version: "1.0.0" });
    await client.connect(clientTransport);

    const result = await client.callTool({
      name: "check_trial_slots",
      arguments: {
        locality_code: "MH-PUNE-01",
        from: toIstIso(ctx.clock.now),
        to: toIstIso(ctx.clock.now + 86_400_000),
      },
    });
    expect(result.isError).toBe(true);
    const content = result.content as { text: string }[];
    const problem = JSON.parse(content[0]?.text ?? "{}") as { code: string };
    expect(problem.code).toBe("outside_service_area");

    await client.close();
    await server.close();
  });
});
