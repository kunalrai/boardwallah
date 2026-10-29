import { afterEach, describe, expect, it } from "bun:test";
import {
  bookingFlow,
  firstOpenSlot,
  getJson,
  holdSlot,
  json,
  key,
  postJson,
  requestConsent,
  setup,
  verifyConsent,
  type TestContext,
} from "./helpers";
import { toIstIso } from "../src/time";

let ctx: TestContext;
afterEach(() => ctx?.close());

describe("trial booking", () => {
  it("confirms a booking with a valid hold and consent", async () => {
    ctx = setup();
    const { response, slot } = await bookingFlow(ctx);
    expect(response.status).toBe(201);
    const data = await json<{
      booking: { id: string; status: string; payment_status: string; consent_id: string; student: { display_name: string } };
      booking_access_token: string;
    }>(response);
    expect(data.booking.id).toMatch(/^B-[0-9a-f]{12}$/);
    expect(data.booking.status).toBe("confirmed");
    expect(data.booking.payment_status).toBe("not_required");
    expect(data.booking.student.display_name).toBe("Riya");
    expect(data.booking_access_token.length).toBeGreaterThan(20);
    expect(ctx.store.getSlot(slot.id)?.status).toBe("booked");
    expect(ctx.notifier.whatsapp.some((message) => message.message.includes(data.booking.id))).toBe(true);
  });

  it("rejects a booking without consent", async () => {
    ctx = setup();
    const { response } = await bookingFlow(ctx, { consent: false });
    expect(response.status).toBe(403);
    expect((await json<{ code: string }>(response)).code).toBe("consent_required");
  });

  it("rejects an expired hold", async () => {
    ctx = setup();
    const slot = await firstOpenSlot(ctx);
    const hold = await holdSlot(ctx, slot.id);
    const consentRequest = await requestConsent(ctx);
    const consent = await verifyConsent(ctx, consentRequest.request_id, ctx.notifier.lastOtp());
    ctx.clock.now += 11 * 60 * 1000;
    const response = await postJson(ctx, "/api/v1/trial-bookings", {
      hold_id: hold.id,
      consent_token: consent.consent_token,
      student: { display_name: "Riya" },
      subjects: ["maths"],
      locality_code: "DL-NOIDA-07",
    });
    expect(response.status).toBe(410);
    expect((await json<{ code: string }>(response)).code).toBe("hold_expired");
  });

  it("replays a booking for the same idempotency key without returning the token again", async () => {
    ctx = setup();
    const idempotency = key("BOOK");
    const flow = await bookingFlow(ctx, { bookingKey: idempotency });
    expect(flow.response.status).toBe(201);
    const first = await json<{ booking: { id: string } }>(flow.response);
    const replay = await postJson(ctx, "/api/v1/trial-bookings", flow.body, { key: idempotency });
    expect(replay.status).toBe(200);
    const body = await replay.text();
    expect(body).not.toContain("booking_access_token");
    const second = JSON.parse(body) as { booking: { id: string } };
    expect(second.booking.id).toBe(first.booking.id);
  });

  it("rejects a reused idempotency key with a different body", async () => {
    ctx = setup();
    const idempotency = key("CONFLICT");
    const flow = await bookingFlow(ctx, { bookingKey: idempotency });
    expect(flow.response.status).toBe(201);
    const changed = { ...flow.body, student: { display_name: "Asha" } };
    const response = await postJson(ctx, "/api/v1/trial-bookings", changed, { key: idempotency });
    expect(response.status).toBe(409);
    expect((await json<{ code: string }>(response)).code).toBe("idempotency_conflict");
  });

  it("rejects a locality outside the service area", async () => {
    ctx = setup();
    const slot = await firstOpenSlot(ctx);
    const hold = await holdSlot(ctx, slot.id);
    const consentRequest = await requestConsent(ctx);
    const consent = await verifyConsent(ctx, consentRequest.request_id, ctx.notifier.lastOtp());
    const response = await postJson(ctx, "/api/v1/trial-bookings", {
      hold_id: hold.id,
      consent_token: consent.consent_token,
      student: { display_name: "Riya" },
      subjects: ["maths"],
      locality_code: "MH-PUNE-01",
    });
    expect(response.status).toBe(422);
    expect((await json<{ code: string }>(response)).code).toBe("outside_service_area");
  });

  it("protects booking reads with the access token", async () => {
    ctx = setup();
    const flow = await bookingFlow(ctx);
    const data = await json<{ booking: { id: string }; booking_access_token: string }>(flow.response);
    const without = await getJson(ctx, `/api/v1/bookings/${data.booking.id}`);
    expect(without.status).toBe(401);
    const withToken = await getJson(ctx, `/api/v1/bookings/${data.booking.id}`, {
      authorization: `Bearer ${data.booking_access_token}`,
    });
    expect(withToken.status).toBe(200);
    const booking = await json<{ id: string }>(withToken);
    expect(booking.id).toBe(data.booking.id);
  });

  it("cancels a booking more than four hours before the slot", async () => {
    ctx = setup();
    const flow = await bookingFlow(ctx);
    const data = await json<{ booking: { id: string }; booking_access_token: string }>(flow.response);
    const response = await postJson(
      ctx,
      `/api/v1/bookings/${data.booking.id}/cancel`,
      {},
      { headers: { authorization: `Bearer ${data.booking_access_token}` } },
    );
    expect(response.status).toBe(200);
    expect((await json<{ status: string }>(response)).status).toBe("cancelled");
    expect(ctx.store.getSlot(flow.slot.id)?.status).toBe("open");

    const from = toIstIso(ctx.clock.now);
    const to = toIstIso(ctx.clock.now + 7 * 24 * 60 * 60 * 1000);
    const list = await getJson(
      ctx,
      `/api/v1/slots?locality_code=DL-NOIDA-07&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
    const slots = await json<{ slots: { id: string }[] }>(list);
    expect(slots.slots.some((slot) => slot.id === flow.slot.id)).toBe(true);
  });

  it("refuses cancellation within four hours of the start", async () => {
    ctx = setup();
    const flow = await bookingFlow(ctx);
    const data = await json<{ booking: { id: string }; booking_access_token: string }>(flow.response);
    const start = Date.parse(flow.slot.starts_at);
    ctx.clock.now = start - 2 * 60 * 60 * 1000;
    const response = await postJson(
      ctx,
      `/api/v1/bookings/${data.booking.id}/cancel`,
      {},
      { headers: { authorization: `Bearer ${data.booking_access_token}` } },
    );
    expect(response.status).toBe(409);
    expect((await json<{ code: string }>(response)).code).toBe("booking_not_cancellable");
  });

  it("refuses a student full name", async () => {
    ctx = setup();
    const consentResponse = await postJson(ctx, "/api/v1/consent/requests", {
      parent_phone: "+919800000001",
      student_display_name: "Riya Sharma",
      purpose: "trial_booking",
      policy_version: "1.0",
    });
    expect(consentResponse.status).toBe(422);
    expect((await json<{ code: string }>(consentResponse)).code).toBe("validation_failed");
  });
});

describe("enquiries", () => {
  it("accepts an enquiry without contact details", async () => {
    ctx = setup();
    const response = await postJson(ctx, "/api/v1/enquiries", {
      locality_code: "DL-NOIDA-07",
      board: "CBSE",
      class: 10,
      subjects: ["maths", "science"],
      preferred_windows: ["weekday evenings"],
      message: "We would like details about the trial.",
      channel_hint: "web_form",
    });
    expect(response.status).toBe(201);
    const enquiry = await json<{ id: string; status: string; channel: string; subjects: string[] }>(response);
    expect(enquiry.id).toMatch(/^E-[0-9a-f]{12}$/);
    expect(enquiry.status).toBe("new");
    expect(enquiry.channel).toBe("web_form");
    expect(enquiry.subjects).toEqual(["maths", "science"]);
    expect(JSON.stringify(enquiry)).not.toContain("+91");
  });

  it("refuses an enquiry outside the service area", async () => {
    ctx = setup();
    const response = await postJson(ctx, "/api/v1/enquiries", {
      locality_code: "MH-PUNE-01",
      board: "CBSE",
      class: 10,
      subjects: ["maths"],
    });
    expect(response.status).toBe(422);
    expect((await json<{ code: string }>(response)).code).toBe("outside_service_area");
  });

  it("limits the message to 500 characters", async () => {
    ctx = setup();
    const response = await postJson(ctx, "/api/v1/enquiries", {
      locality_code: "DL-NOIDA-07",
      board: "CBSE",
      class: 10,
      subjects: ["maths"],
      message: "a".repeat(600),
    });
    expect(response.status).toBe(422);
    expect((await json<{ code: string }>(response)).code).toBe("validation_failed");
  });

  it("replays an enquiry for the same key and rejects a changed body", async () => {
    ctx = setup();
    const idempotency = key("ENQ");
    const body = {
      locality_code: "DL-NOIDA-07",
      board: "CBSE",
      class: 10,
      subjects: ["maths"],
    };
    const first = await postJson(ctx, "/api/v1/enquiries", body, { key: idempotency });
    const second = await postJson(ctx, "/api/v1/enquiries", body, { key: idempotency });
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    const firstEnquiry = await json<{ id: string }>(first);
    const secondEnquiry = await json<{ id: string }>(second);
    expect(secondEnquiry.id).toBe(firstEnquiry.id);

    const changed = await postJson(ctx, "/api/v1/enquiries", { ...body, message: "Changed" }, { key: idempotency });
    expect(changed.status).toBe(409);
  });
});
