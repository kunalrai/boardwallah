import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { getConnInfo } from "hono/bun";
import { z } from "zod";
import type { Config } from "./config";
import { createConfig } from "./config";
import { loadContent, type Content } from "./content";
import type { Clock } from "./services";
import { displayNameError, Services, type Notifier } from "./services";
import { ApiError, problemResponse } from "./errors";
import { hashBody } from "./ids";
import type { IdempotencyRow } from "./store";
import { Store } from "./store";
import { parseInstant, toIstIso } from "./time";
import { createNotifier } from "./notifier";
import { handleMcpRequest } from "./mcp";

const subject = z.enum(["maths", "science", "social_science", "english", "hindi"]);
const phone = z.string().regex(/^\+91[0-9]{10}$/, "Use an Indian mobile number in +91XXXXXXXXXX format.");

export interface AppOptions {
  config?: Partial<Config>;
  content?: Content;
  store?: Store;
  clock?: Clock;
  notifier?: Notifier;
}

export interface AppBundle {
  app: Hono<{ Variables: { scope: string } }>;
  services: Services;
  store: Store;
  config: Config;
  content: Content;
}

type AppEnv = { Variables: { scope: string } };

export function createApp(options: AppOptions = {}): AppBundle {
  const config = createConfig(options.config);
  const content = options.content ?? loadContent(config.contentDir);
  const store = options.store ?? new Store(config.dbPath);
  const notifier = options.notifier ?? createNotifier();
  const clock = options.clock ?? (() => Date.now());
  const services = new Services({ config, content, store, clock, notifier });
  services.ensureSlots();

  const app = new Hono<AppEnv>();
  const rateBuckets = new Map<string, { start: number; count: number }>();
  const allowedOrigins = new Set([
    config.siteOrigin,
    "http://localhost:4321",
    "http://127.0.0.1:4321",
  ]);
  if (process.env.CORS_ORIGIN) {
    for (const origin of process.env.CORS_ORIGIN.split(",")) {
      const trimmed = origin.trim();
      if (trimmed) allowedOrigins.add(trimmed);
    }
  }

  app.use(
    "*",
    cors({
      origin: (origin) => (allowedOrigins.has(origin) ? origin : undefined),
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "Idempotency-Key", "X-API-Key"],
      exposeHeaders: ["Retry-After", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
      maxAge: 600,
    }),
  );

  app.use("/api/v1/*", async (c, next) => {
    const apiKey = c.req.header("X-API-Key");
    const write = c.req.method !== "GET" && c.req.method !== "HEAD";
    const scope = apiKey ? `key:${apiKey}` : `ip:${clientIp(c)}`;
    c.set("scope", scope);

    const limits = config.rateLimit;
    const limit = apiKey
      ? write
        ? limits.writeKeyed
        : limits.readKeyed
      : write
        ? limits.writeAnonymous
        : limits.readAnonymous;
    const now = clock();
    const bucket = rateBuckets.get(scope);
    const current = !bucket || now - bucket.start >= limits.windowMs ? { start: now, count: 0 } : bucket;
    current.count += 1;
    rateBuckets.set(scope, current);
    c.header("X-RateLimit-Limit", String(limit));
    c.header("X-RateLimit-Remaining", String(Math.max(0, limit - current.count)));
    if (current.count > limit) {
      const retryAfter = Math.max(1, Math.ceil((current.start + limits.windowMs - now) / 1000));
      return problemResponse(
        new ApiError(429, "rate_limited", "Wait before making another request."),
        config.publicBaseUrl,
        c.req.path,
        { "Retry-After": String(retryAfter) },
      );
    }
    await next();
  });

  const idempotent = async (
    c: Context<AppEnv>,
    body: unknown,
    handler: () => Promise<Response> | Response,
    replay: (stored: IdempotencyRow) => Response = (stored) =>
      new Response(stored.response, {
        status: stored.status,
        headers: { "content-type": "application/json" },
      }),
  ): Promise<Response> => {
    const key = c.req.header("Idempotency-Key");
    if (!key || key.length > 64) {
      throw new ApiError(400, "validation_failed", "Idempotency-Key is required (max 64 characters).");
    }
    const scope = c.get("scope");
    const path = c.req.path;
    const bodyHash = hashBody(body);
    const existing = store.getIdempotency(scope, "POST", path, key);
    if (existing) {
      if (existing.body_hash !== bodyHash) {
        throw new ApiError(409, "idempotency_conflict", "This key was already used with a different request body.");
      }
      return replay(existing);
    }

    const response = await handler();
    if (response.status >= 200 && response.status < 300) {
      const text = await response.clone().text();
      store.saveIdempotency({
        scope,
        method: "POST",
        path,
        key,
        body_hash: bodyHash,
        status: response.status,
        response: text,
        created_ms: clock(),
      });
      store.deleteExpiredIdempotency(clock() - config.idempotencyTtlMs);
    }
    return response;
  };

  app.get("/", (c) =>
    c.json({
      name: "Home Tuition Provider API",
      version: config.specVersion,
      api: "/api/v1",
      mcp: "/mcp",
      openapi: "/openapi.yaml",
      health: "/health",
    }),
  );

  app.get("/health", (c) => c.json({ status: "ok", version: config.specVersion }));

  app.get("/openapi.yaml", (c) => {
    const yaml = readFileSync(join(import.meta.dir, "..", "spec", "api", "openapi.yaml"), "utf8");
    return c.body(yaml, 200, { "content-type": "application/yaml" });
  });

  app.get("/api/v1/provider", (c) => c.json(services.provider()));

  app.get("/api/v1/subjects", (c) =>
    c.json({
      version: content.subjects.version,
      last_updated: content.provider.last_updated,
      subjects: content.subjects.subjects,
    }),
  );

  app.get("/api/v1/plans", (c) => {
    const subjectParam = c.req.query("subject");
    if (subjectParam) {
      const parsed = subject.safeParse(subjectParam);
      if (!parsed.success) throw new ApiError(400, "validation_failed", "Unknown subject filter.");
    }
    return c.json({
      version: content.plans.version,
      last_updated: content.plans.last_updated,
      plans: services.plans(subjectParam),
    });
  });

  app.get("/api/v1/slots", (c) => {
    const locality = requiredQuery(c, "locality_code");
    const from = parseInstant(requiredQuery(c, "from"));
    const to = parseInstant(requiredQuery(c, "to"));
    if (from === null || to === null) {
      throw new ApiError(400, "validation_failed", "from and to must be ISO 8601 timestamps.");
    }
    if (to <= from) throw new ApiError(400, "validation_failed", "to must be after from.");
    if (to - from > 31 * 24 * 60 * 60 * 1000) {
      throw new ApiError(400, "validation_failed", "The slot window cannot exceed 31 days.");
    }
    if (!services.isServiceLocality(locality)) {
      throw new ApiError(422, "outside_service_area", "Choose a locality from the provider's service area.");
    }
    return c.json({
      version: config.specVersion,
      last_updated: toIstIso(clock()),
      slots: services.listSlots(locality, from, to),
    });
  });

  app.post("/api/v1/slots/:slot_id/hold", async (c) => {
    const slotId = c.req.param("slot_id");
    return idempotent(c, {}, () => c.json(services.holdSlot(slotId), 201));
  });

  app.post("/api/v1/consent/requests", async (c) => {
    const body = await parseBody(c, consentRequestSchema);
    return idempotent(c, body, async () => c.json(await services.requestConsent(body), 202));
  });

  app.post("/api/v1/consent/requests/:request_id/verify", async (c) => {
    const requestId = c.req.param("request_id");
    const body = await parseBody(c, verifySchema);
    return idempotent(c, body, () => c.json(services.verifyConsent(requestId, body.otp)));
  });

  app.post("/api/v1/trial-bookings", async (c) => {
    const body = await parseBody(c, bookingSchema);
    return idempotent(
      c,
      body,
      async () => c.json(await services.createBooking(body), 201),
      (stored) => {
        const parsed = JSON.parse(stored.response) as { booking: unknown };
        return new Response(JSON.stringify({ booking: parsed.booking }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    );
  });

  app.get("/api/v1/bookings/:booking_id", (c) =>
    c.json(services.getBooking(c.req.param("booking_id"), bearer(c))),
  );

  app.post("/api/v1/bookings/:booking_id/cancel", async (c) => {
    const bookingId = c.req.param("booking_id");
    return idempotent(c, {}, () => c.json(services.cancelBooking(bookingId, bearer(c))));
  });

  app.post("/api/v1/enquiries", async (c) => {
    const body = await parseBody(c, enquirySchema);
    if (!services.isServiceLocality(body.locality_code)) {
      throw new ApiError(422, "outside_service_area", "Choose a locality from the provider's service area.");
    }
    return idempotent(c, body, () => c.json(services.createEnquiry(body), 201));
  });

  app.all("/mcp", async (c) => handleMcpRequest(c.req.raw, services));

  app.notFound((c) => problemResponse(new ApiError(404, "not_found"), config.publicBaseUrl, c.req.path));

  app.onError((error, c) => {
    if (error instanceof ApiError) return problemResponse(error, config.publicBaseUrl, c.req.path);
    console.error(error);
    return problemResponse(new ApiError(500, "internal_error"), config.publicBaseUrl, c.req.path);
  });

  return { app, services, store, config, content };
}

const consentRequestSchema = z.object({
  parent_phone: phone,
  student_display_name: z.string().trim().min(1).max(20),
  purpose: z.literal("trial_booking"),
  policy_version: z.string().min(1).max(50),
});

const verifySchema = z.object({
  otp: z.string().regex(/^[0-9]{6}$/, "The code must be 6 digits."),
});

const bookingSchema = z.object({
  hold_id: z.string().regex(/^H-[0-9a-f]{12}$/).optional(),
  consent_token: z.string().min(1).optional(),
  student: z.object({ display_name: z.string().trim().min(1).max(20) }),
  subjects: z.array(subject).min(1),
  locality_code: z.string().min(1),
});

const enquirySchema = z.object({
  locality_code: z.string().min(1),
  board: z.literal("CBSE"),
  class: z.literal(10),
  subjects: z.array(subject).min(1),
  preferred_windows: z.array(z.string().max(100)).max(5).optional(),
  message: z.string().max(500).optional(),
  channel_hint: z.enum(["api", "web_form", "whatsapp", "gbp", "mcp"]).optional(),
});

function requiredQuery(c: Context<AppEnv>, name: string): string {
  const value = c.req.query(name);
  if (!value) throw new ApiError(400, "validation_failed", `${name} is required.`);
  return value;
}

async function parseBody<T>(c: Context<AppEnv>, schema: z.ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new ApiError(400, "validation_failed", "The request body must be valid JSON.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path.length ? `${issue.path.join(".")}: ` : "";
    throw new ApiError(422, "validation_failed", `${path}${issue?.message ?? "Invalid request body."}`);
  }
  const data = parsed.data as Record<string, unknown>;
  if (typeof data.student_display_name === "string") {
    const error = displayNameError(data.student_display_name);
    if (error) throw new ApiError(422, "validation_failed", error);
  }
  return parsed.data;
}

function bearer(c: Context<AppEnv>): string | null {
  const header = c.req.header("Authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match?.[1]?.trim() ?? null;
}

function clientIp(c: Context<AppEnv>): string {
  try {
    const address = getConnInfo(c).remote.address;
    if (address) return address;
  } catch {
    return (
      c.req.header("cf-connecting-ip") ??
      c.req.header("x-real-ip") ??
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      "local"
    );
  }
  return "local";
}
