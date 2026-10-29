import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";

export function randomHex(bytes = 6): string {
  return randomBytes(bytes).toString("hex");
}

export function randomToken(): string {
  return randomBytes(32).toString("base64url");
}

export function randomOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function hashOtp(requestId: string, otp: string): string {
  const secret = process.env.OTP_SECRET ?? "development-only-otp-secret";
  return createHmac("sha256", secret).update(`${requestId}:${otp}`).digest("hex");
}

export function studentRef(): string {
  return `SR-${randomHex(8)}`;
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`).join(",")}}`;
}

export function hashBody(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}
