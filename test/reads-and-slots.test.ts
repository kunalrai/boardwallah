import { afterEach, describe, expect, it } from "bun:test";
import { firstOpenSlot, getJson, holdSlot, json, key, postJson, setup, type TestContext } from "./helpers";
import { toIstIso } from "../src/time";

let ctx: TestContext;
afterEach(() => ctx?.close());

describe("public reads", () => {
  it("returns the provider with version and timestamp matching content", async () => {
    ctx = setup();
    const response = await getJson(ctx, "/api/v1/provider");
    expect(response.status).toBe(200);
    const data = await json<{ tutor_name: string; version: string; last_updated: string }>(response);
    expect(data.version).toBe(ctx.bundle.content.provider.version);
    expect(data.last_updated).toBe(ctx.bundle.content.provider.last_updated);
    expect(data.tutor_name).toBe(ctx.bundle.content.provider.tutor_name);
  });

  it("returns plans with integer paise prices and INR currency", async () => {
    ctx = setup();
    const response = await getJson(ctx, "/api/v1/plans");
    expect(response.status).toBe(200);
    const data = await json<{ plans: { price_paise: number; currency: string }[] }>(response);
    expect(data.plans.length).toBeGreaterThan(0);
    for (const plan of data.plans) {
      expect(Number.isInteger(plan.price_paise)).toBe(true);
      expect(plan.currency).toBe("INR");
    }
  });

  it("returns subjects for CBSE class 10", async () => {
    ctx = setup();
    const response = await getJson(ctx, "/api/v1/subjects");
    expect(response.status).toBe(200);
    const data = await json<{ subjects: { id: string; board: string; class: number }[] }>(response);
    expect(data.subjects.map((subject) => subject.id)).toContain("maths");
    expect(data.subjects.every((subject) => subject.board === "CBSE" && subject.class === 10)).toBe(true);
  });

  it("enforces the anonymous read rate limit with Retry-After", async () => {
    ctx = setup();
    for (let index = 0; index < 20; index += 1) {
      const response = await getJson(ctx, "/api/v1/provider");
      expect(response.status).toBe(200);
    }
    const limited = await getJson(ctx, "/api/v1/provider");
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).toBeTruthy();
    const problem = await json<{ code: string }>(limited);
    expect(problem.code).toBe("rate_limited");
  });
});

describe("trial slots and holds", () => {
  it("lists open slots for a locality and window", async () => {
    ctx = setup();
    const slot = await firstOpenSlot(ctx);
    expect(slot.id).toMatch(/^S-[0-9]+$/);
    expect(slot.locality_code).toBe("DL-NOIDA-07");
    expect(new Date(slot.starts_at).getTime()).toBeGreaterThan(ctx.clock.now);
  });

  it("hides held slots and refuses a second hold", async () => {
    ctx = setup();
    const slot = await firstOpenSlot(ctx);
    const hold = await holdSlot(ctx, slot.id);
    expect(hold.id).toMatch(/^H-[0-9a-f]{12}$/);

    const from = toIstIso(ctx.clock.now);
    const to = toIstIso(ctx.clock.now + 7 * 24 * 60 * 60 * 1000);
    const list = await getJson(
      ctx,
      `/api/v1/slots?locality_code=DL-NOIDA-07&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
    const data = await json<{ slots: { id: string }[] }>(list);
    expect(data.slots.some((item) => item.id === slot.id)).toBe(false);

    const second = await postJson(ctx, `/api/v1/slots/${slot.id}/hold`, {});
    expect(second.status).toBe(409);
    expect((await json<{ code: string }>(second)).code).toBe("slot_unavailable");
  });

  it("replays a hold for the same idempotency key without creating another", async () => {
    ctx = setup();
    const slot = await firstOpenSlot(ctx);
    const idempotency = key("HOLD");
    const first = await postJson(ctx, `/api/v1/slots/${slot.id}/hold`, {}, { key: idempotency });
    const second = await postJson(ctx, `/api/v1/slots/${slot.id}/hold`, {}, { key: idempotency });
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    const firstHold = await json<{ id: string }>(first);
    const secondHold = await json<{ id: string }>(second);
    expect(secondHold.id).toBe(firstHold.id);
  });

  it("expires a hold after ten minutes and reopens the slot", async () => {
    ctx = setup();
    const slot = await firstOpenSlot(ctx);
    const hold = await holdSlot(ctx, slot.id);
    ctx.clock.now += 11 * 60 * 1000;
    await firstOpenSlot(ctx);
    expect(ctx.store.getHold(hold.id)?.status).toBe("expired");
    expect(ctx.store.getSlot(slot.id)?.status).toBe("open");
  });

  it("refuses a locality outside the service area", async () => {
    ctx = setup();
    const from = toIstIso(ctx.clock.now);
    const to = toIstIso(ctx.clock.now + 24 * 60 * 60 * 1000);
    const response = await getJson(
      ctx,
      `/api/v1/slots?locality_code=MH-PUNE-01&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
    expect(response.status).toBe(422);
    expect((await json<{ code: string }>(response)).code).toBe("outside_service_area");
  });
});
