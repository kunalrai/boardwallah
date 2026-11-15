import { describe, expect, it } from "bun:test";
import { createApp } from "../src/app";
import { GoogleAuthError, type GoogleIdentity } from "../src/auth";
import { Store } from "../src/store";
import { json, postJson, setup, TEST_NOW, type TestContext } from "./helpers";

const VALID_CREDENTIAL = "valid-google-id-token-000000000000";

const riya: GoogleIdentity = {
  sub: "google-sub-riya",
  email: "riya.parent@example.com",
  emailVerified: true,
  name: "Riya's parent",
  picture: "https://example.com/riya.png",
};

function verifierFor(map: Record<string, GoogleIdentity>) {
  return async (credential: string): Promise<GoogleIdentity> => {
    const identity = map[credential];
    if (!identity) throw new GoogleAuthError();
    return identity;
  };
}

async function signIn(ctx: TestContext, credential = VALID_CREDENTIAL) {
  const response = await postJson(ctx, "/api/v1/auth/google", { credential });
  if (response.status !== 200) throw new Error(`Sign-in failed: ${response.status} ${await response.text()}`);
  return json<{ user: { id: string; email: string; name: string | null }; session_token: string; expires_at: string }>(
    response,
  );
}

describe("Google sign-in", () => {
  it("creates a user and returns a session token for a verified credential", async () => {
    const ctx = setup({ googleVerifier: verifierFor({ [VALID_CREDENTIAL]: riya }) });
    try {
      const result = await signIn(ctx);
      expect(result.user.email).toBe("riya.parent@example.com");
      expect(result.user.name).toBe("Riya's parent");
      expect(result.session_token.length).toBeGreaterThan(20);
      expect(result.expires_at).toBeTruthy();

      const me = await ctx.bundle.app.request("/api/v1/auth/me", {
        headers: { authorization: `Bearer ${result.session_token}` },
      });
      expect(me.status).toBe(200);
      const profile = await json<{ user: { id: string; email: string } }>(me);
      expect(profile.user.id).toBe(result.user.id);
      expect(profile.user.email).toBe("riya.parent@example.com");
    } finally {
      ctx.close();
    }
  });

  it("reuses the user row when the same Google account signs in again", async () => {
    const ctx = setup({ googleVerifier: verifierFor({ [VALID_CREDENTIAL]: riya }) });
    try {
      const first = await signIn(ctx);
      const second = await signIn(ctx);
      expect(second.user.id).toBe(first.user.id);
      expect(second.session_token).not.toBe(first.session_token);

      const users = ctx.store.db.query("SELECT COUNT(*) AS count FROM users").get() as { count: number };
      expect(users.count).toBe(1);
      const sessions = ctx.store.db.query("SELECT COUNT(*) AS count FROM sessions").get() as { count: number };
      expect(sessions.count).toBe(2);
    } finally {
      ctx.close();
    }
  });

  it("rejects a credential the verifier does not accept", async () => {
    const ctx = setup({ googleVerifier: verifierFor({}) });
    try {
      const response = await postJson(ctx, "/api/v1/auth/google", { credential: "forged-credential-value" });
      expect(response.status).toBe(401);
      const problem = await json<{ code: string }>(response);
      expect(problem.code).toBe("unauthorized");
      const users = ctx.store.db.query("SELECT COUNT(*) AS count FROM users").get() as { count: number };
      expect(users.count).toBe(0);
    } finally {
      ctx.close();
    }
  });

  it("returns 503 when GOOGLE_CLIENT_ID is not configured", async () => {
    const store = new Store(":memory:");
    const bundle = createApp({
      store,
      clock: () => TEST_NOW,
      config: { dbPath: ":memory:", googleClientId: "" },
    });
    try {
      const response = await bundle.app.request("/api/v1/auth/google", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ credential: "any-credential-value-here" }),
      });
      expect(response.status).toBe(503);
      const problem = await json<{ code: string }>(response);
      expect(problem.code).toBe("auth_unavailable");
    } finally {
      store.close();
    }
  });

  it("rejects /auth/me without, or with an expired, session token", async () => {
    const ctx = setup({ googleVerifier: verifierFor({ [VALID_CREDENTIAL]: riya }) });
    try {
      const anonymous = await ctx.bundle.app.request("/api/v1/auth/me");
      expect(anonymous.status).toBe(401);

      const { session_token } = await signIn(ctx);
      ctx.clock.now = TEST_NOW + ctx.bundle.config.sessionTtlMs + 1;

      const expired = await ctx.bundle.app.request("/api/v1/auth/me", {
        headers: { authorization: `Bearer ${session_token}` },
      });
      expect(expired.status).toBe(401);
    } finally {
      ctx.close();
    }
  });

  it("invalidates the session on logout", async () => {
    const ctx = setup({ googleVerifier: verifierFor({ [VALID_CREDENTIAL]: riya }) });
    try {
      const { session_token } = await signIn(ctx);
      const logout = await ctx.bundle.app.request("/api/v1/auth/logout", {
        method: "POST",
        headers: { authorization: `Bearer ${session_token}` },
      });
      expect(logout.status).toBe(204);

      const me = await ctx.bundle.app.request("/api/v1/auth/me", {
        headers: { authorization: `Bearer ${session_token}` },
      });
      expect(me.status).toBe(401);
    } finally {
      ctx.close();
    }
  });
});
