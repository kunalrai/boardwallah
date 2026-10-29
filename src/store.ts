import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { randomHex } from "./ids";
import { addDays, istParts, parseWindow, startOfIstDay, toIstIso } from "./time";
import type { Provider, SubjectId } from "./content";

export type SlotStatus = "open" | "held" | "booked" | "closed";
export type HoldStatus = "active" | "released" | "converted" | "expired";
export type BookingStatus = "confirmed" | "cancelled" | "completed" | "no_show";
export type PaymentStatus = "not_required" | "pending" | "paid";
export type ConsentStatus = "pending" | "granted" | "used" | "expired" | "revoked";
export type EnquiryStatus = "new" | "contacted" | "converted" | "closed";

export interface SlotRow {
  id: string;
  provider_id: string;
  locality_code: string;
  starts_at: string;
  ends_at: string;
  starts_ms: number;
  status: SlotStatus;
  version: string;
  last_updated: string;
}

export interface HoldRow {
  id: string;
  slot_id: string;
  expires_ms: number;
  expires_at: string;
  status: HoldStatus;
  created_at: string;
}

export interface BookingRow {
  id: string;
  type: "trial";
  slot_id: string;
  student_display_name: string;
  subjects: string;
  locality_code: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  consent_id: string;
  access_token_hash: string;
  created_at: string;
  created_ms: number;
  version: string;
  last_updated: string;
}

export interface ConsentRequestRow {
  id: string;
  parent_phone: string;
  student_display_name: string;
  purpose: "trial_booking";
  policy_version: string;
  otp_hash: string;
  channel: "whatsapp" | "sms";
  status: "pending" | "locked" | "granted" | "expired";
  attempts: number;
  expires_ms: number;
  expires_at: string;
  created_at: string;
  created_ms: number;
}

export interface ConsentRow {
  id: string;
  request_id: string;
  purpose: "trial_booking";
  student_ref: string;
  channel: "whatsapp" | "sms";
  status: ConsentStatus;
  token_hash: string;
  granted_at: string;
  expires_ms: number;
  expires_at: string;
  policy_version: string;
}

export interface EnquiryRow {
  id: string;
  channel: "api" | "web_form" | "whatsapp" | "gbp" | "mcp";
  locality_code: string;
  board: "CBSE";
  class: 10;
  subjects: string;
  preferred_windows: string;
  message: string | null;
  status: EnquiryStatus;
  created_at: string;
}

export interface IdempotencyRow {
  scope: string;
  method: string;
  path: string;
  key: string;
  body_hash: string;
  status: number;
  response: string;
  created_ms: number;
}

const schema = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS slots (
  id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL,
  locality_code TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  starts_ms INTEGER NOT NULL,
  status TEXT NOT NULL,
  version TEXT NOT NULL,
  last_updated TEXT NOT NULL,
  UNIQUE (locality_code, starts_at)
);
CREATE INDEX IF NOT EXISTS slots_open ON slots (locality_code, status, starts_ms);
CREATE TABLE IF NOT EXISTS holds (
  id TEXT PRIMARY KEY,
  slot_id TEXT NOT NULL,
  expires_ms INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS holds_active ON holds (status, expires_ms);
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  slot_id TEXT NOT NULL,
  student_display_name TEXT NOT NULL,
  subjects TEXT NOT NULL,
  locality_code TEXT NOT NULL,
  status TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  consent_id TEXT NOT NULL,
  access_token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  created_ms INTEGER NOT NULL,
  version TEXT NOT NULL,
  last_updated TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS consent_requests (
  id TEXT PRIMARY KEY,
  parent_phone TEXT NOT NULL,
  student_display_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_ms INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_ms INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS consents (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  purpose TEXT NOT NULL,
  student_ref TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  granted_at TEXT NOT NULL,
  expires_ms INTEGER NOT NULL,
  expires_at TEXT NOT NULL,
  policy_version TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS enquiries (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  locality_code TEXT NOT NULL,
  board TEXT NOT NULL,
  class INTEGER NOT NULL,
  subjects TEXT NOT NULL,
  preferred_windows TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS idempotency (
  scope TEXT NOT NULL,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  key TEXT NOT NULL,
  body_hash TEXT NOT NULL,
  status INTEGER NOT NULL,
  response TEXT NOT NULL,
  created_ms INTEGER NOT NULL,
  PRIMARY KEY (scope, method, path, key)
);
CREATE INDEX IF NOT EXISTS idempotency_created ON idempotency (created_ms);
`;

export class Store {
  readonly db: Database;

  constructor(path: string) {
    if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });
    this.db = new Database(path, { create: true });
    this.db.exec("PRAGMA journal_mode = WAL;");
    this.db.exec("PRAGMA foreign_keys = ON;");
    this.db.exec("PRAGMA busy_timeout = 5000;");
    this.db.exec(schema);
  }

  close() {
    this.db.close();
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  getMeta(key: string): string | null {
    const row = this.db.query("SELECT value FROM meta WHERE key = ?").get(key) as { value: string } | null;
    return row?.value ?? null;
  }

  setMeta(key: string, value: string) {
    this.db
      .query("INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
      .run(key, value);
  }

  ensureSlots(provider: Provider, now: number, horizonDays: number, version: string): number {
    const window = parseWindow(provider.availability.window);
    if (!window) return 0;
    const duration = provider.trial.duration_minutes;
    if (duration <= 0) return 0;

    return this.transaction(() => {
      const sequence = Number(this.getMeta("slot_sequence") ?? "0");
      let nextSequence = sequence;
      let created = 0;
      const dayStart = startOfIstDay(now);

      for (let day = 0; day < horizonDays; day += 1) {
        const dayMs = addDays(dayStart, day);
        const weekday = istParts(dayMs).weekday;
        if (!provider.availability.days.includes(weekday)) continue;

        const dayWindowStart = dayMs + (window.startHour * 60 + window.startMinute) * 60_000;
        const dayWindowEnd = dayMs + (window.endHour * 60 + window.endMinute) * 60_000;

        for (let start = dayWindowStart; start + duration * 60_000 <= dayWindowEnd; start += duration * 60_000) {
          if (start <= now) continue;
          const end = start + duration * 60_000;
          for (const locality of provider.service_localities) {
            const existing = this.db
              .query("SELECT id FROM slots WHERE locality_code = ? AND starts_at = ?")
              .get(locality, toIstIso(start));
            if (existing) continue;
            nextSequence += 1;
            this.db
              .query(
                `INSERT INTO slots (id, provider_id, locality_code, starts_at, ends_at, starts_ms, status, version, last_updated)
                 VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
              )
              .run(
                `S-${nextSequence}`,
                provider.id,
                locality,
                toIstIso(start),
                toIstIso(end),
                start,
                version,
                toIstIso(now),
              );
            created += 1;
          }
        }
      }

      if (nextSequence !== sequence) this.setMeta("slot_sequence", String(nextSequence));
      return created;
    });
  }

  getSlot(id: string): SlotRow | null {
    return this.db.query("SELECT * FROM slots WHERE id = ?").get(id) as SlotRow | null;
  }

  listOpenSlots(locality: string, fromMs: number, toMs: number): SlotRow[] {
    return this.db
      .query(
        `SELECT * FROM slots
         WHERE locality_code = ? AND status = 'open' AND starts_ms >= ? AND starts_ms <= ?
         ORDER BY starts_ms ASC`,
      )
      .all(locality, fromMs, toMs) as SlotRow[];
  }

  expireHolds(now: number): number {
    return this.transaction(() => this.expireHoldsNow(now));
  }

  private expireHoldsNow(now: number): number {
    const expired = this.db
      .query("SELECT slot_id FROM holds WHERE status = 'active' AND expires_ms <= ?")
      .all(now) as { slot_id: string }[];
    if (expired.length === 0) return 0;
    const placeholders = expired.map(() => "?").join(",");
    this.db
      .query(`UPDATE slots SET status = 'open', last_updated = ? WHERE status = 'held' AND id IN (${placeholders})`)
      .run(toIstIso(now), ...expired.map((row) => row.slot_id));
    this.db.query("UPDATE holds SET status = 'expired' WHERE status = 'active' AND expires_ms <= ?").run(now);
    return expired.length;
  }

  holdSlot(slotId: string, now: number, ttlMs: number, version: string): { slot: SlotRow | null; hold: HoldRow | null } {
    return this.transaction(() => {
      this.expireHoldsNow(now);
      const slot = this.getSlot(slotId);
      if (!slot) return { slot: null, hold: null };
      const changed = this.db
        .query("UPDATE slots SET status = 'held', last_updated = ? WHERE id = ? AND status = 'open'")
        .run(toIstIso(now), slotId);
      if (changed.changes === 0) return { slot, hold: null };
      const hold: HoldRow = {
        id: `H-${randomHex(6)}`,
        slot_id: slotId,
        expires_ms: now + ttlMs,
        expires_at: toIstIso(now + ttlMs),
        status: "active",
        created_at: toIstIso(now),
      };
      this.db
        .query("INSERT INTO holds (id, slot_id, expires_ms, expires_at, status, created_at) VALUES (?, ?, ?, ?, ?, ?)")
        .run(hold.id, hold.slot_id, hold.expires_ms, hold.expires_at, hold.status, hold.created_at);
      return { slot, hold };
    });
  }

  getHold(id: string): HoldRow | null {
    return this.db.query("SELECT * FROM holds WHERE id = ?").get(id) as HoldRow | null;
  }

  setHoldStatus(id: string, status: HoldStatus) {
    this.db.query("UPDATE holds SET status = ? WHERE id = ?").run(status, id);
  }

  setSlotStatus(id: string, status: SlotStatus, now: number) {
    this.db.query("UPDATE slots SET status = ?, last_updated = ? WHERE id = ?").run(status, toIstIso(now), id);
  }

  createConsentRequest(row: ConsentRequestRow) {
    this.db
      .query(
        `INSERT INTO consent_requests
         (id, parent_phone, student_display_name, purpose, policy_version, otp_hash, channel, status, attempts, expires_ms, expires_at, created_at, created_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        row.id,
        row.parent_phone,
        row.student_display_name,
        row.purpose,
        row.policy_version,
        row.otp_hash,
        row.channel,
        row.status,
        row.attempts,
        row.expires_ms,
        row.expires_at,
        row.created_at,
        row.created_ms,
      );
  }

  getConsentRequest(id: string): ConsentRequestRow | null {
    return this.db.query("SELECT * FROM consent_requests WHERE id = ?").get(id) as ConsentRequestRow | null;
  }

  incrementConsentAttempts(id: string): number {
    this.db.query("UPDATE consent_requests SET attempts = attempts + 1 WHERE id = ?").run(id);
    const row = this.getConsentRequest(id);
    return row?.attempts ?? 0;
  }

  setConsentRequestStatus(id: string, status: ConsentRequestRow["status"]) {
    this.db.query("UPDATE consent_requests SET status = ? WHERE id = ?").run(status, id);
  }

  createConsent(row: ConsentRow) {
    this.db
      .query(
        `INSERT INTO consents
         (id, request_id, purpose, student_ref, channel, status, token_hash, granted_at, expires_ms, expires_at, policy_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        row.id,
        row.request_id,
        row.purpose,
        row.student_ref,
        row.channel,
        row.status,
        row.token_hash,
        row.granted_at,
        row.expires_ms,
        row.expires_at,
        row.policy_version,
      );
  }

  getConsentByTokenHash(hash: string): ConsentRow | null {
    return this.db.query("SELECT * FROM consents WHERE token_hash = ?").get(hash) as ConsentRow | null;
  }

  setConsentStatus(id: string, status: ConsentStatus) {
    this.db.query("UPDATE consents SET status = ? WHERE id = ?").run(status, id);
  }

  createBooking(row: BookingRow) {
    this.db
      .query(
        `INSERT INTO bookings
         (id, type, slot_id, student_display_name, subjects, locality_code, status, payment_status, consent_id, access_token_hash, created_at, created_ms, version, last_updated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        row.id,
        row.type,
        row.slot_id,
        row.student_display_name,
        row.subjects,
        row.locality_code,
        row.status,
        row.payment_status,
        row.consent_id,
        row.access_token_hash,
        row.created_at,
        row.created_ms,
        row.version,
        row.last_updated,
      );
  }

  getBooking(id: string): BookingRow | null {
    return this.db.query("SELECT * FROM bookings WHERE id = ?").get(id) as BookingRow | null;
  }

  getBookingByAccessTokenHash(hash: string): BookingRow | null {
    return this.db.query("SELECT * FROM bookings WHERE access_token_hash = ?").get(hash) as BookingRow | null;
  }

  setBookingStatus(id: string, status: BookingStatus, now: number) {
    this.db
      .query("UPDATE bookings SET status = ?, last_updated = ? WHERE id = ?")
      .run(status, toIstIso(now), id);
  }

  createEnquiry(row: EnquiryRow) {
    this.db
      .query(
        `INSERT INTO enquiries
         (id, channel, locality_code, board, class, subjects, preferred_windows, message, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        row.id,
        row.channel,
        row.locality_code,
        row.board,
        row.class,
        row.subjects,
        row.preferred_windows,
        row.message,
        row.status,
        row.created_at,
      );
  }

  getEnquiry(id: string): EnquiryRow | null {
    return this.db.query("SELECT * FROM enquiries WHERE id = ?").get(id) as EnquiryRow | null;
  }

  getIdempotency(scope: string, method: string, path: string, key: string): IdempotencyRow | null {
    return this.db
      .query("SELECT * FROM idempotency WHERE scope = ? AND method = ? AND path = ? AND key = ?")
      .get(scope, method, path, key) as IdempotencyRow | null;
  }

  saveIdempotency(row: IdempotencyRow) {
    this.db
      .query(
        `INSERT INTO idempotency (scope, method, path, key, body_hash, status, response, created_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(scope, method, path, key) DO NOTHING`,
      )
      .run(row.scope, row.method, row.path, row.key, row.body_hash, row.status, row.response, row.created_ms);
  }

  deleteExpiredIdempotency(cutoffMs: number) {
    this.db.query("DELETE FROM idempotency WHERE created_ms < ?").run(cutoffMs);
  }
}
