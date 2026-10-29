import { afterEach, describe, expect, it } from "bun:test";
import {
  bookingFlow,
  firstOpenSlot,
  holdSlot,
  json,
  key,
  postJson,
  requestConsent,
  setup,
  verifyConsent,
  type TestContext,
} from "./helpers";

let ctx: TestContext;
afterEach(() => ctx?.close());

describe("parent consent", () => {
  it("sends an OTP to WhatsApp without returning it", async () => {
    ctx = setup();
    const response = await postJson(ctx, "/api/v1/consent/requests", {
      parent_phone: "+919800000001",
      student_display_name: "Riya",
      purpose: "trial_booking",
      policy_version: "1.0",
    });
    expect(response.status).toBe(202);
    const body = await response.text();
    const data = JSON.parse(body) as { request_id: string; channel: string; expires_at: string };
    expect(data.channel).toBe("whatsapp");
    expect(data.request_id).toMatch(/^R-[0-9a-f]{12}$/);
    expect(body).not.toMatch(/[0-9]{6}/);
    expect(ctx.notifier.lastOtp()).toMatch(/^[0-9]{6}$/);
  });

  it("falls back to SMS when WhatsApp fails", async () => {
    ctx = setup();
    ctx.notifier.failWhatsApp = true;
    const result = await requestConsent(ctx);
    expect(result.channel).toBe("sms");
    expect(ctx.notifier.sms.length).toBe(1);
  });

  it("grants a single-use consent token for the correct OTP", async () => {
    ctx = setup();
    const slot = await firstOpenSlot(ctx);
    const hold = await holdSlot(ctx, slot.id);
    const consentRequest = await requestConsent(ctx);
    const consent = await verifyConsent(ctx, consentRequest.request_id, ctx.notifier.lastOtp());
    expect(consent.consent_id).toMatch(/^C-[0-9a-f]{12}$/);
    expect(consent.consent_token.length).toBeGreaterThan(20);

    const first = await postJson(ctx, "/api/v1/trial-bookings", {
      hold_id: hold.id,
      consent_token: consent.consent_token,
      student: { display_name: "Riya" },
      subjects: ["maths"],
      locality_code: "DL-NOIDA-07",
    });
    expect(first.status).toBe(201);

    const secondSlot = await firstOpenSlot(ctx, "DL-NOIDA-12");
    const secondHold = await holdSlot(ctx, secondSlot.id);
    const second = await postJson(ctx, "/api/v1/trial-bookings", {
      hold_id: secondHold.id,
      consent_token: consent.consent_token,
      student: { display_name: "Riya" },
      subjects: ["maths"],
      locality_code: "DL-NOIDA-12",
    });
    expect(second.status).toBe(401);
    expect((await json<{ code: string }>(second)).code).toBe("consent_invalid");
  });

  it("rejects a wrong OTP", async () => {
    ctx = setup();
    const consentRequest = await requestConsent(ctx);
    const otp = ctx.notifier.lastOtp();
    const wrong = otp === "000000" ? "111111" : "000000";
    const response = await postJson(ctx, `/api/v1/consent/requests/${consentRequest.request_id}/verify`, { otp: wrong });
    expect(response.status).toBe(401);
    expect((await json<{ code: string }>(response)).code).toBe("unauthorized");
  });

  it("locks a request after five wrong attempts", async () => {
    ctx = setup();
    const consentRequest = await requestConsent(ctx);
    const otp = ctx.notifier.lastOtp();
    const wrong = otp === "000000" ? "111111" : "000000";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await postJson(
        ctx,
        `/api/v1/consent/requests/${consentRequest.request_id}/verify`,
        { otp: wrong },
        { key: key("WRONG") },
      );
      expect(response.status).toBe(401);
    }
    const locked = await postJson(
      ctx,
      `/api/v1/consent/requests/${consentRequest.request_id}/verify`,
      { otp },
      { key: key("LOCKED") },
    );
    expect(locked.status).toBe(429);
    expect((await json<{ code: string }>(locked)).code).toBe("rate_limited");
  });

  it("rejects an expired OTP", async () => {
    ctx = setup();
    const consentRequest = await requestConsent(ctx);
    const otp = ctx.notifier.lastOtp();
    ctx.clock.now += 11 * 60 * 1000;
    const response = await postJson(ctx, `/api/v1/consent/requests/${consentRequest.request_id}/verify`, { otp });
    expect(response.status).toBe(410);
    expect((await json<{ code: string }>(response)).code).toBe("consent_expired");
  });

  it("rejects an expired consent token", async () => {
    ctx = setup();
    const slot = await firstOpenSlot(ctx);
    const hold = await holdSlot(ctx, slot.id);
    const consentRequest = await requestConsent(ctx);
    const consent = await verifyConsent(ctx, consentRequest.request_id, ctx.notifier.lastOtp());
    ctx.clock.now += 31 * 60 * 1000;
    const response = await postJson(ctx, "/api/v1/trial-bookings", {
      hold_id: hold.id,
      consent_token: consent.consent_token,
      student: { display_name: "Riya" },
      subjects: ["maths"],
      locality_code: "DL-NOIDA-07",
    });
    expect(response.status).toBe(410);
    expect((await json<{ code: string }>(response)).code).toBe("consent_expired");
  });

  it("does not include the parent phone in any booking response", async () => {
    ctx = setup();
    const flow = await bookingFlow(ctx, { phone: "+919800000009" });
    const body = await flow.response.text();
    expect(flow.response.status).toBe(201);
    expect(body).not.toContain("9800000009");
    expect(body).not.toContain("@");
  });
});
