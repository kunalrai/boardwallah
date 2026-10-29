import type { Config } from "./config";
import type { Content, Plan, Provider, SubjectId } from "./content";
import { constantTimeEqual, decryptText, encryptText } from "./crypto";
import { ApiError } from "./errors";
import { hashOtp, hashToken, randomHex, randomOtp, randomToken, studentRef } from "./ids";
import type {
  BookingRow,
  ConsentRequestRow,
  ConsentRow,
  EnquiryRow,
  HoldRow,
  SlotRow,
  Store,
} from "./store";
import { parseInstant, toIstIso } from "./time";

export type Clock = () => number;

export interface Notifier {
  sendWhatsApp(to: string, message: string): Promise<boolean>;
  sendSms(to: string, message: string): Promise<boolean>;
}

export interface ServicesOptions {
  config: Config;
  content: Content;
  store: Store;
  clock?: Clock;
  notifier: Notifier;
}

export interface SlotView {
  id: string;
  provider_id: string;
  locality_code: string;
  starts_at: string;
  ends_at: string;
  status: SlotRow["status"];
  version: string;
  last_updated: string;
}

export interface HoldView {
  id: string;
  slot_id: string;
  expires_at: string;
  status: HoldRow["status"];
}

export interface BookingView {
  id: string;
  type: "trial";
  slot_id: string;
  student: { display_name: string; class: 10; board: "CBSE" };
  subjects: SubjectId[];
  locality_code: string;
  status: BookingRow["status"];
  payment_status: BookingRow["payment_status"];
  consent_id: string;
  created_at: string;
  version: string;
  last_updated: string;
}

export interface EnquiryView {
  id: string;
  channel: EnquiryRow["channel"];
  locality_code: string;
  board: "CBSE";
  class: 10;
  subjects: SubjectId[];
  preferred_windows?: string[];
  message?: string;
  status: EnquiryRow["status"];
  created_at: string;
}

export interface BookingResult {
  booking: BookingView;
  booking_access_token: string;
}

export class Services {
  readonly config: Config;
  readonly content: Content;
  readonly store: Store;
  readonly clock: Clock;
  readonly notifier: Notifier;

  constructor(options: ServicesOptions) {
    this.config = options.config;
    this.content = options.content;
    this.store = options.store;
    this.clock = options.clock ?? (() => Date.now());
    this.notifier = options.notifier;
  }

  private now() {
    return this.clock();
  }

  provider(): Provider {
    return this.content.provider;
  }

  plans(subject?: string): Plan[] {
    return subject
      ? this.content.plans.plans.filter((plan) => !plan.subjects || plan.subjects.includes(subject as SubjectId))
      : this.content.plans.plans;
  }

  isServiceLocality(locality: string): boolean {
    return this.content.provider.service_localities.includes(locality);
  }

  ensureSlots(): void {
    this.store.expireHolds(this.now());
    this.store.ensureSlots(this.content.provider, this.now(), this.config.slotHorizonDays, this.config.specVersion);
  }

  listSlots(locality: string, from: number, to: number): SlotView[] {
    this.ensureSlots();
    return this.store.listOpenSlots(locality, from, to).map((slot) => this.slotView(slot));
  }

  holdSlot(slotId: string): HoldView {
    this.store.expireHolds(this.now());
    const { slot, hold } = this.store.holdSlot(slotId, this.now(), this.config.holdTtlMs, this.config.specVersion);
    if (!slot) throw new ApiError(404, "not_found", `No trial slot with id ${slotId}.`);
    if (!hold) throw new ApiError(409, "slot_unavailable", "This slot is held or booked. Choose another open slot.");
    return this.holdView(hold);
  }

  async requestConsent(input: {
    parent_phone: string;
    student_display_name: string;
    policy_version: string;
  }): Promise<{ request_id: string; channel: "whatsapp" | "sms"; expires_at: string }> {
    this.ensureSlots();
    const now = this.now();
    const requestId = `R-${randomHex(6)}`;
    const otp = randomOtp();
    const message =
      `${this.content.provider.name}: your one-time consent code for a Class 10 trial booking is ${otp}. ` +
      `It expires in 10 minutes. Do not share it with the tutor or an agent.`;

    let channel: "whatsapp" | "sms" = "whatsapp";
    let delivered = false;
    try {
      delivered = await this.notifier.sendWhatsApp(input.parent_phone, message);
    } catch {
      delivered = false;
    }
    if (!delivered) {
      channel = "sms";
      try {
        delivered = await this.notifier.sendSms(input.parent_phone, message);
      } catch {
        delivered = false;
      }
    }
    if (!delivered) {
      console.error(`Consent OTP delivery failed for request ${requestId}.`);
    }

    const expiresMs = now + this.config.otpTtlMs;
    this.store.createConsentRequest({
      id: requestId,
      parent_phone: encryptText(input.parent_phone),
      student_display_name: encryptText(input.student_display_name.trim()),
      purpose: "trial_booking",
      policy_version: input.policy_version,
      otp_hash: hashOtp(requestId, otp),
      channel,
      status: "pending",
      attempts: 0,
      expires_ms: expiresMs,
      expires_at: toIstIso(expiresMs),
      created_at: toIstIso(now),
      created_ms: now,
    });

    return { request_id: requestId, channel, expires_at: toIstIso(expiresMs) };
  }

  verifyConsent(requestId: string, otp: string): { consent_id: string; consent_token: string; expires_at: string } {
    const request = this.store.getConsentRequest(requestId);
    if (!request) throw new ApiError(404, "not_found", `No consent request with id ${requestId}.`);
    if (request.status === "locked" || request.attempts >= this.config.otpMaxAttempts) {
      throw new ApiError(429, "rate_limited", "Too many incorrect codes. Request a new consent code.");
    }
    if (request.status === "granted") {
      throw new ApiError(401, "consent_invalid", "This code was already used. Request a new consent code.");
    }
    const now = this.now();
    if (request.status === "expired" || now > request.expires_ms) {
      this.store.setConsentRequestStatus(requestId, "expired");
      throw new ApiError(410, "consent_expired", "The one-time code has expired. Request a new consent code.");
    }
    if (!constantTimeEqual(hashOtp(requestId, otp), request.otp_hash)) {
      const attempts = this.store.incrementConsentAttempts(requestId);
      if (attempts >= this.config.otpMaxAttempts) this.store.setConsentRequestStatus(requestId, "locked");
      throw new ApiError(401, "unauthorized", "The one-time code is incorrect.");
    }

    const consentId = `C-${randomHex(6)}`;
    const token = randomToken();
    const expiresMs = now + this.config.consentTtlMs;
    this.store.transaction(() => {
      this.store.setConsentRequestStatus(requestId, "granted");
      this.store.createConsent({
        id: consentId,
        request_id: requestId,
        purpose: "trial_booking",
        student_ref: studentRef(),
        channel: request.channel,
        status: "granted",
        token_hash: hashToken(token),
        granted_at: toIstIso(now),
        expires_ms: expiresMs,
        expires_at: toIstIso(expiresMs),
        policy_version: request.policy_version,
      });
    });

    return { consent_id: consentId, consent_token: token, expires_at: toIstIso(expiresMs) };
  }

  async createBooking(input: {
    hold_id?: string;
    consent_token?: string;
    student: { display_name: string };
    subjects: SubjectId[];
    locality_code: string;
  }): Promise<BookingResult> {
    const now = this.now();
    this.store.expireHolds(now);

    if (!input.consent_token) {
      throw new ApiError(403, "consent_required", "Call POST /consent/requests, then POST /consent/requests/{id}/verify.");
    }
    if (!input.hold_id) throw new ApiError(422, "validation_failed", "hold_id is required.");

    const consent = this.store.getConsentByTokenHash(hashToken(input.consent_token));
    if (!consent) throw new ApiError(401, "consent_invalid", "The consent token is not valid.");
    if (consent.status !== "granted") {
      throw new ApiError(401, "consent_invalid", "The consent token was already used.");
    }
    if (now > consent.expires_ms) throw new ApiError(410, "consent_expired", "The consent token has expired.");

    const hold = this.store.getHold(input.hold_id);
    if (!hold) throw new ApiError(410, "hold_invalid", "The slot hold does not exist.");
    if (hold.status !== "active" || now > hold.expires_ms) {
      throw new ApiError(410, "hold_expired", "The slot hold has expired. Hold the slot again.");
    }

    const slot = this.store.getSlot(hold.slot_id);
    if (!slot) throw new ApiError(410, "hold_invalid", "The held slot no longer exists.");
    if (!this.isServiceLocality(input.locality_code)) {
      throw new ApiError(422, "outside_service_area", "Choose a locality from the provider's service area.");
    }
    if (slot.locality_code !== input.locality_code) {
      throw new ApiError(422, "validation_failed", "The booking locality does not match the held slot.");
    }

    const nameError = displayNameError(input.student.display_name);
    if (nameError) throw new ApiError(422, "validation_failed", nameError);
    if (input.subjects.length === 0) throw new ApiError(422, "validation_failed", "Choose at least one subject.");
    for (const subject of input.subjects) {
      if (!this.content.provider.subjects.includes(subject)) {
        throw new ApiError(422, "validation_failed", `Unknown subject: ${subject}.`);
      }
    }

    const accessToken = randomToken();
    const bookingId = `B-${randomHex(6)}`;
    const createdAt = toIstIso(now);

    this.store.transaction(() => {
      const consentUpdate = this.store.db
        .query("UPDATE consents SET status = 'used' WHERE id = ? AND status = 'granted'")
        .run(consent.id);
      if (consentUpdate.changes === 0) throw new ApiError(401, "consent_invalid", "The consent token was already used.");

      const holdUpdate = this.store.db
        .query("UPDATE holds SET status = 'converted' WHERE id = ? AND status = 'active'")
        .run(hold.id);
      if (holdUpdate.changes === 0) throw new ApiError(410, "hold_expired", "The slot hold has expired.");

      const slotUpdate = this.store.db
        .query("UPDATE slots SET status = 'booked', last_updated = ? WHERE id = ? AND status = 'held'")
        .run(createdAt, slot.id);
      if (slotUpdate.changes === 0) throw new ApiError(409, "slot_unavailable", "This slot was taken.");

      this.store.createBooking({
        id: bookingId,
        type: "trial",
        slot_id: slot.id,
        student_display_name: encryptText(input.student.display_name.trim()),
        subjects: JSON.stringify(input.subjects),
        locality_code: input.locality_code,
        status: "confirmed",
        payment_status: "not_required",
        consent_id: consent.id,
        access_token_hash: hashToken(accessToken),
        created_at: createdAt,
        created_ms: now,
        version: this.config.specVersion,
        last_updated: createdAt,
      });
    });

    const booking = this.store.getBooking(bookingId);
    if (!booking) throw new Error("Booking insert did not persist.");
    const view = this.bookingView(booking);
    void this.sendBookingConfirmation(consent, slot, view, accessToken);
    return { booking: view, booking_access_token: accessToken };
  }

  getBooking(bookingId: string, accessToken: string | null): BookingView {
    if (!accessToken) throw new ApiError(401, "unauthorized", "A booking access token is required.");
    const booking = this.store.getBooking(bookingId);
    if (!booking) throw new ApiError(404, "not_found", `No booking with id ${bookingId}.`);
    if (!constantTimeEqual(hashToken(accessToken), booking.access_token_hash)) {
      throw new ApiError(401, "unauthorized", "The booking access token is incorrect.");
    }
    return this.bookingView(booking);
  }

  cancelBooking(bookingId: string, accessToken: string | null): BookingView {
    const view = this.getBooking(bookingId, accessToken);
    const booking = this.store.getBooking(bookingId);
    if (!booking) throw new ApiError(404, "not_found");
    if (booking.status !== "confirmed") {
      throw new ApiError(409, "booking_not_cancellable", "Only confirmed bookings can be cancelled.");
    }
    const slot = this.store.getSlot(booking.slot_id);
    if (!slot) throw new ApiError(409, "booking_not_cancellable", "The slot for this booking no longer exists.");
    const now = this.now();
    if (slot.starts_ms - now <= this.config.cancelCutoffMs) {
      throw new ApiError(409, "booking_not_cancellable", "Trials can only be cancelled more than 4 hours before the start.");
    }

    this.store.transaction(() => {
      this.store.setBookingStatus(booking.id, "cancelled", now);
      this.store.setSlotStatus(slot.id, "open", now);
    });
    const updated = this.store.getBooking(booking.id);
    if (!updated) throw new Error("Booking cancellation did not persist.");
    return this.bookingView(updated);
  }

  createEnquiry(input: {
    locality_code: string;
    board: "CBSE";
    class: 10;
    subjects: SubjectId[];
    preferred_windows?: string[];
    message?: string;
    channel_hint?: EnquiryRow["channel"];
  }): EnquiryView {
    const now = this.now();
    const row: EnquiryRow = {
      id: `E-${randomHex(6)}`,
      channel: input.channel_hint ?? "api",
      locality_code: input.locality_code,
      board: input.board,
      class: input.class,
      subjects: JSON.stringify(input.subjects),
      preferred_windows: JSON.stringify(input.preferred_windows ?? []),
      message: input.message ? encryptText(input.message) : null,
      status: "new",
      created_at: toIstIso(now),
    };
    this.store.createEnquiry(row);
    return this.enquiryView(row);
  }

  slotStart(slotId: string): number | null {
    const slot = this.store.getSlot(slotId);
    if (!slot) return null;
    return parseInstant(slot.starts_at);
  }

  private slotView(slot: SlotRow): SlotView {
    return {
      id: slot.id,
      provider_id: slot.provider_id,
      locality_code: slot.locality_code,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      status: slot.status,
      version: slot.version,
      last_updated: slot.last_updated,
    };
  }

  private holdView(hold: HoldRow): HoldView {
    return { id: hold.id, slot_id: hold.slot_id, expires_at: hold.expires_at, status: hold.status };
  }

  bookingView(booking: BookingRow): BookingView {
    return {
      id: booking.id,
      type: "trial",
      slot_id: booking.slot_id,
      student: { display_name: decryptText(booking.student_display_name), class: 10, board: "CBSE" },
      subjects: JSON.parse(booking.subjects) as SubjectId[],
      locality_code: booking.locality_code,
      status: booking.status,
      payment_status: booking.payment_status,
      consent_id: booking.consent_id,
      created_at: booking.created_at,
      version: booking.version,
      last_updated: booking.last_updated,
    };
  }

  enquiryView(enquiry: EnquiryRow): EnquiryView {
    return {
      id: enquiry.id,
      channel: enquiry.channel,
      locality_code: enquiry.locality_code,
      board: enquiry.board,
      class: enquiry.class,
      subjects: JSON.parse(enquiry.subjects) as SubjectId[],
      preferred_windows: JSON.parse(enquiry.preferred_windows) as string[],
      ...(enquiry.message ? { message: decryptText(enquiry.message) } : {}),
      status: enquiry.status,
      created_at: enquiry.created_at,
    };
  }

  private async sendBookingConfirmation(consent: ConsentRow, slot: SlotRow, booking: BookingView, accessToken: string) {
    const request = this.store.getConsentRequest(consent.request_id);
    if (!request) return;
    const phone = decryptText(request.parent_phone);
    const link = `${this.config.siteOrigin.replace(/\/$/, "")}/booking/#id=${encodeURIComponent(booking.id)}&token=${encodeURIComponent(accessToken)}`;
    const message =
      `${this.content.provider.name}: trial booking ${booking.id} is confirmed for ${slot.starts_at}. ` +
      `View or cancel: ${link}. The tutor will contact you on WhatsApp.`;
    try {
      const sent = await this.notifier.sendWhatsApp(phone, message);
      if (!sent) await this.notifier.sendSms(phone, message);
    } catch {
      console.error(`Booking confirmation delivery failed for ${booking.id}.`);
    }
  }
}

export function displayNameError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "A student display name is required.";
  if (trimmed.length > 20) return "Use 20 characters or fewer for the student's display name.";
  const parts = trimmed.split(/\s+/);
  const [first, ...rest] = parts;
  if (!first || !/^[A-Za-z][A-Za-z.'-]*$/.test(first)) {
    return "Use the student's first name or initials only.";
  }
  for (const part of rest) {
    if (!/^[A-Za-z]\.?$/.test(part)) {
      return "Use the student's first name or initials only, not a full name.";
    }
  }
  return null;
}
