import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

let cachedKey: Buffer | null = null;
let warned = false;

function key(): Buffer {
  if (cachedKey) return cachedKey;
  const configured = process.env.PII_ENCRYPTION_KEY;
  if (configured) {
    const buffer = /^[0-9a-f]{64}$/i.test(configured)
      ? Buffer.from(configured, "hex")
      : Buffer.from(configured, "base64");
    if (buffer.length !== 32) throw new Error("PII_ENCRYPTION_KEY must be 32 bytes (hex or base64).");
    cachedKey = buffer;
    return cachedKey;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("PII_ENCRYPTION_KEY is required in production.");
  }
  if (!warned) {
    warned = true;
    console.error("PII_ENCRYPTION_KEY is not set; using a development-only key.");
  }
  cachedKey = createHash("sha256").update("development-only-pii-key").digest();
  return cachedKey;
}

export function encryptText(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString("base64url")}.${tag.toString("base64url")}.${ciphertext.toString("base64url")}`;
}

export function decryptText(value: string): string {
  if (!value.startsWith("v1.")) return value;
  const [, ivPart, tagPart, ciphertextPart] = value.split(".");
  if (!ivPart || !tagPart || !ciphertextPart) throw new Error("Malformed encrypted value.");
  const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextPart, "base64url")), decipher.final()]).toString("utf8");
}

export function constantTimeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
