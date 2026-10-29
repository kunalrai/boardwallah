import { createApp, type AppBundle } from "../src/app";
import type { Notifier } from "../src/services";
import { Store } from "../src/store";
import { toIstIso } from "../src/time";

export const TEST_NOW = Date.parse("2026-10-29T10:00:00+05:30");

let keyCounter = 0;
export const key = (prefix = "K") => `${prefix}-${++keyCounter}`;

export class CaptureNotifier implements Notifier {
  whatsapp: { to: string; message: string }[] = [];
  sms: { to: string; message: string }[] = [];
  failWhatsApp = false;
  failSms = false;

  async sendWhatsApp(to: string, message: string): Promise<boolean> {
    if (this.failWhatsApp) return false;
    this.whatsapp.push({ to, message });
    return true;
  }

  async sendSms(to: string, message: string): Promise<boolean> {
    if (this.failSms) return false;
    this.sms.push({ to, message });
    return true;
  }

  lastMessage(): string {
    const message = this.whatsapp.at(-1) ?? this.sms.at(-1);
    if (!message) throw new Error("No message was sent.");
    return message.message;
  }

  lastOtp(): string {
    const match = /([0-9]{6})/.exec(this.lastMessage());
    if (!match?.[1]) throw new Error("No OTP found in the last message.");
    return match[1];
  }
}

export interface TestContext {
  bundle: AppBundle;
  store: Store;
  notifier: CaptureNotifier;
  clock: { now: number };
  close: () => void;
}

export function setup(overrides: { rateLimit?: Partial<AppBundle["config"]["rateLimit"]> } = {}): TestContext {
  const clock = { now: TEST_NOW };
  const notifier = new CaptureNotifier();
  const store = new Store(":memory:");
  const bundle = createApp({
    store,
    notifier,
    clock: () => clock.now,
    config: {
      dbPath: ":memory:",
      rateLimit: {
        windowMs: 60_000,
        readAnonymous: 20,
        readKeyed: 60,
        writeAnonymous: 10,
        writeKeyed: 10,
        ...overrides.rateLimit,
      },
    },
  });
  return {
    bundle,
    store,
    notifier,
    clock,
    close: () => store.close(),
  };
}

export async function postJson(
  ctx: TestContext,
  path: string,
  body: unknown,
  options: { key?: string; headers?: Record<string, string> } = {},
) {
  return ctx.bundle.app.request(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": options.key ?? key(),
      ...options.headers,
    },
    body: JSON.stringify(body),
  });
}

export async function getJson(ctx: TestContext, path: string, headers: Record<string, string> = {}) {
  return ctx.bundle.app.request(path, { headers });
}

export async function json<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function firstOpenSlot(ctx: TestContext, locality = "DL-NOIDA-07") {
  const from = toIstIso(ctx.clock.now);
  const to = toIstIso(ctx.clock.now + 7 * 24 * 60 * 60 * 1000);
  const response = await getJson(ctx, `/api/v1/slots?locality_code=${locality}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  if (response.status !== 200) throw new Error(`Slots failed: ${response.status} ${await response.text()}`);
  const data = await json<{ slots: { id: string; starts_at: string; locality_code: string }[] }>(response);
  const slot = data.slots[0];
  if (!slot) throw new Error("No open slots found.");
  return slot;
}

export async function holdSlot(ctx: TestContext, slotId: string) {
  const response = await postJson(ctx, `/api/v1/slots/${slotId}/hold`, {});
  if (response.status !== 201) throw new Error(`Hold failed: ${response.status} ${await response.text()}`);
  return json<{ id: string; expires_at: string }>(response);
}

export async function requestConsent(
  ctx: TestContext,
  input: { phone?: string; name?: string; policyVersion?: string } = {},
) {
  const response = await postJson(ctx, "/api/v1/consent/requests", {
    parent_phone: input.phone ?? "+919800000001",
    student_display_name: input.name ?? "Riya",
    purpose: "trial_booking",
    policy_version: input.policyVersion ?? "1.0",
  });
  if (response.status !== 202) throw new Error(`Consent request failed: ${response.status} ${await response.text()}`);
  return json<{ request_id: string; channel: "whatsapp" | "sms"; expires_at: string }>(response);
}

export async function verifyConsent(ctx: TestContext, requestId: string, otp: string) {
  const response = await postJson(ctx, `/api/v1/consent/requests/${requestId}/verify`, { otp });
  if (response.status !== 200) throw new Error(`Verify failed: ${response.status} ${await response.text()}`);
  return json<{ consent_id: string; consent_token: string; expires_at: string }>(response);
}

export interface BookingFlowOptions {
  name?: string;
  locality?: string;
  subjects?: string[];
  phone?: string;
  consent?: boolean;
  bookingKey?: string;
}

export async function bookingFlow(ctx: TestContext, options: BookingFlowOptions = {}) {
  const locality = options.locality ?? "DL-NOIDA-07";
  const slot = await firstOpenSlot(ctx, locality);
  const hold = await holdSlot(ctx, slot.id);
  const consentResponse = await requestConsent(ctx, { name: options.name ?? "Riya", phone: options.phone });
  const consent = await verifyConsent(ctx, consentResponse.request_id, ctx.notifier.lastOtp());
  const body = {
    hold_id: hold.id,
    ...(options.consent === false ? {} : { consent_token: consent.consent_token }),
    student: { display_name: options.name ?? "Riya" },
    subjects: options.subjects ?? ["maths"],
    locality_code: locality,
  };
  const response = await postJson(ctx, "/api/v1/trial-bookings", body, { key: options.bookingKey });
  return { slot, hold, consent, body, response };
}
