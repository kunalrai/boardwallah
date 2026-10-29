import { join } from "node:path";

export interface RateLimitConfig {
  windowMs: number;
  readAnonymous: number;
  readKeyed: number;
  writeAnonymous: number;
  writeKeyed: number;
}

export interface Config {
  specVersion: string;
  providerId: string;
  publicBaseUrl: string;
  siteOrigin: string;
  dbPath: string;
  contentDir: string;
  holdTtlMs: number;
  consentTtlMs: number;
  otpTtlMs: number;
  otpMaxAttempts: number;
  cancelCutoffMs: number;
  idempotencyTtlMs: number;
  slotHorizonDays: number;
  rateLimit: RateLimitConfig;
  apiKeys: string[];
}

const minute = 60_000;
const hour = 60 * minute;

const numberFromEnv = (name: string, fallback: number) => {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export function createConfig(overrides: Partial<Config> = {}): Config {
  const root = join(import.meta.dir, "..");
  return {
    specVersion: "0.1.0",
    providerId: "P-001",
    publicBaseUrl: process.env.PUBLIC_API_URL ?? "http://localhost:8787",
    siteOrigin: process.env.SITE_ORIGIN ?? "http://localhost:4321",
    dbPath: process.env.DATABASE_PATH ?? join(root, "data", "app.db"),
    contentDir: join(root, "spec", "content"),
    holdTtlMs: 10 * minute,
    consentTtlMs: 30 * minute,
    otpTtlMs: 10 * minute,
    otpMaxAttempts: 5,
    cancelCutoffMs: 4 * hour,
    idempotencyTtlMs: 24 * hour,
    slotHorizonDays: 14,
    rateLimit: {
      windowMs: minute,
      readAnonymous: 20,
      readKeyed: 60,
      writeAnonymous: numberFromEnv("RATE_LIMIT_WRITE_ANONYMOUS", 10),
      writeKeyed: numberFromEnv("RATE_LIMIT_WRITE_KEYED", 10),
    },
    apiKeys: (process.env.API_KEYS ?? "")
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean),
    ...overrides,
  };
}
