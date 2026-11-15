import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export interface GoogleIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
}

export type GoogleVerifier = (credential: string) => Promise<GoogleIdentity>;

const googleIssuers = ["https://accounts.google.com", "accounts.google.com"];
const googleJwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export class GoogleAuthError extends Error {
  constructor(message = "The Google credential could not be verified.") {
    super(message);
    this.name = "GoogleAuthError";
  }
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function toIdentity(payload: JWTPayload): GoogleIdentity {
  const sub = text(payload.sub);
  const email = text(payload.email);
  if (!sub || !email) throw new GoogleAuthError();
  if (payload.email_verified !== true) {
    throw new GoogleAuthError("The Google account email address is not verified.");
  }
  return {
    sub,
    email: email.toLowerCase(),
    emailVerified: true,
    name: text(payload.name),
    picture: text(payload.picture),
  };
}

export function createGoogleVerifier(clientId: string): GoogleVerifier {
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is required for Google sign-in.");
  return async (credential) => {
    try {
      const { payload } = await jwtVerify(credential, googleJwks, {
        issuer: googleIssuers,
        audience: clientId,
        clockTolerance: 5,
      });
      return toIdentity(payload);
    } catch (error) {
      if (error instanceof GoogleAuthError) throw error;
      throw new GoogleAuthError();
    }
  };
}
