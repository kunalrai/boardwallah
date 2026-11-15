import { Database } from "bun:sqlite";
import { describe, expect, it } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { GoogleAuthError, type GoogleIdentity } from "../src/auth";
import { Store } from "../src/store";
import { bookingFlow, getJson, json, postJson, setup, type TestContext } from "./helpers";

const LOCALITY = "Gaur City 2";
const RIYA_CREDENTIAL = "google-id-token-for-riya-000000000000";
const ARJUN_CREDENTIAL = "google-id-token-for-arjun-0000000000000";

const riya: GoogleIdentity = {
  sub: "google-sub-riya",
  email: "riya.parent@example.com",
  emailVerified: true,
  name: "Riya's parent",
  picture: null,
};

const arjun: GoogleIdentity = {
  sub: "google-sub-arjun",
  email: "arjun.parent@example.com",
  emailVerified: true,
  name: "Arjun's parent",
  picture: null,
};

const identities: Record<string, GoogleIdentity> = {
  [RIYA_CREDENTIAL]: riya,
  [ARJUN_CREDENTIAL]: arjun,
};

function accountContext() {
  return setup({
    rateLimit: { writeAnonymous: 100, writeKeyed: 100, readAnonymous: 100, readKeyed: 100 },
    googleVerifier: async (credential) => {
      const identity = identities[credential];
      if (!identity) throw new GoogleAuthError();
      return identity;
    },
  });
}

async function signIn(ctx: TestContext, credential = RIYA_CREDENTIAL): Promise<string> {
  const response = await postJson(ctx, "/api/v1/auth/google", { credential });
  if (response.status !== 200) throw new Error(`Sign-in failed: ${response.status} ${await response.text()}`);
  const body = await json<{ session_token: string }>(response);
  return body.session_token;
}

async function listBookings(ctx: TestContext, token: string) {
  const response = await getJson(ctx, "/api/v1/auth/me/bookings", { authorization: `Bearer ${token}` });
  if (response.status !== 200) throw new Error(`Listing failed: ${response.status} ${await response.text()}`);
  return json<{
    bookings: { id: string; status: string; slot_starts_at: string | null; student: { display_name: string } }[];
  }>(response);
}

describe("account bookings", () => {
  it("lists a booking that was created while signed in", async () => {
    const ctx = accountContext();
    try {
      const token = await signIn(ctx);
      const flow = await bookingFlow(ctx, { locality: LOCALITY, headers: { authorization: `Bearer ${token}` } });
      expect(flow.response.status).toBe(201);
      const created = await json<{ booking: { id: string } }>(flow.response);

      const { bookings } = await listBookings(ctx, token);
      expect(bookings).toHaveLength(1);
      expect(bookings[0]?.id).toBe(created.booking.id);
      expect(bookings[0]?.status).toBe("confirmed");
      expect(bookings[0]?.student.display_name).toBe("Riya");
      expect(bookings[0]?.slot_starts_at).toBe(flow.slot.starts_at);
    } finally {
      ctx.close();
    }
  });

  it("does not list bookings created without a session", async () => {
    const ctx = accountContext();
    try {
      const token = await signIn(ctx);
      const flow = await bookingFlow(ctx, { locality: LOCALITY });
      expect(flow.response.status).toBe(201);

      const { bookings } = await listBookings(ctx, token);
      expect(bookings).toHaveLength(0);
    } finally {
      ctx.close();
    }
  });

  it("keeps each account's bookings separate", async () => {
    const ctx = accountContext();
    try {
      const riyaToken = await signIn(ctx, RIYA_CREDENTIAL);
      const arjunToken = await signIn(ctx, ARJUN_CREDENTIAL);

      const riyaFlow = await bookingFlow(ctx, {
        locality: LOCALITY,
        name: "Riya",
        headers: { authorization: `Bearer ${riyaToken}` },
      });
      const arjunFlow = await bookingFlow(ctx, {
        locality: LOCALITY,
        name: "Arjun",
        headers: { authorization: `Bearer ${arjunToken}` },
      });
      expect(riyaFlow.response.status).toBe(201);
      expect(arjunFlow.response.status).toBe(201);
      const riyaBooking = await json<{ booking: { id: string } }>(riyaFlow.response);
      const arjunBooking = await json<{ booking: { id: string } }>(arjunFlow.response);

      const riyaList = await listBookings(ctx, riyaToken);
      const arjunList = await listBookings(ctx, arjunToken);
      expect(riyaList.bookings.map((booking) => booking.id)).toEqual([riyaBooking.booking.id]);
      expect(arjunList.bookings.map((booking) => booking.id)).toEqual([arjunBooking.booking.id]);
    } finally {
      ctx.close();
    }
  });

  it("ignores an invalid session token when creating a booking", async () => {
    const ctx = accountContext();
    try {
      const flow = await bookingFlow(ctx, {
        locality: LOCALITY,
        headers: { authorization: "Bearer not-a-real-session-token" },
      });
      expect(flow.response.status).toBe(201);

      const token = await signIn(ctx);
      const { bookings } = await listBookings(ctx, token);
      expect(bookings).toHaveLength(0);
    } finally {
      ctx.close();
    }
  });

  it("requires a session to list account bookings", async () => {
    const ctx = accountContext();
    try {
      const response = await getJson(ctx, "/api/v1/auth/me/bookings");
      expect(response.status).toBe(401);
      const problem = await json<{ code: string }>(response);
      expect(problem.code).toBe("unauthorized");
    } finally {
      ctx.close();
    }
  });

  it("adds the user_id column to an existing database", () => {
    const dir = mkdtempSync(join(tmpdir(), "boardwallah-migration-"));
    const path = join(dir, "app.db");
    try {
      const legacy = new Database(path, { create: true });
      legacy.exec(`
        CREATE TABLE bookings (
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
      `);
      legacy.close();

      const store = new Store(path);
      try {
        const columns = store.db.query("PRAGMA table_info(bookings)").all() as { name: string }[];
        expect(columns.map((column) => column.name)).toContain("user_id");
      } finally {
        store.close();
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
