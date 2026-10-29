export type ProblemCode =
  | "validation_failed"
  | "not_found"
  | "consent_required"
  | "consent_invalid"
  | "consent_expired"
  | "slot_unavailable"
  | "hold_expired"
  | "hold_invalid"
  | "idempotency_conflict"
  | "outside_service_area"
  | "booking_not_cancellable"
  | "rate_limited"
  | "unauthorized"
  | "internal_error";

export interface Problem {
  type: string;
  title: string;
  status: number;
  code: ProblemCode;
  detail?: string;
  instance?: string;
}

const titles: Record<ProblemCode, string> = {
  validation_failed: "Request validation failed.",
  not_found: "Resource not found.",
  consent_required: "Parent consent is required to book a trial.",
  consent_invalid: "The consent token is invalid or already used.",
  consent_expired: "The consent token has expired.",
  slot_unavailable: "That trial slot is no longer available.",
  hold_expired: "The slot hold has expired.",
  hold_invalid: "The slot hold is invalid.",
  idempotency_conflict: "This idempotency key was used with a different request.",
  outside_service_area: "That locality is outside the service area.",
  booking_not_cancellable: "This booking can no longer be cancelled online.",
  rate_limited: "Too many requests.",
  unauthorized: "Not authorized.",
  internal_error: "An unexpected error occurred.",
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: ProblemCode;
  readonly detail?: string;

  constructor(status: number, code: ProblemCode, detail?: string) {
    super(detail ?? titles[code]);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

export function problemBody(error: ApiError, publicBaseUrl: string, instance?: string): Problem {
  return {
    type: `${publicBaseUrl.replace(/\/$/, "")}/errors/${error.code}`,
    title: titles[error.code],
    status: error.status,
    code: error.code,
    ...(error.detail ? { detail: error.detail } : {}),
    ...(instance ? { instance } : {}),
  };
}

export function problemResponse(error: ApiError, publicBaseUrl: string, instance?: string, headers?: HeadersInit): Response {
  return new Response(JSON.stringify(problemBody(error, publicBaseUrl, instance)), {
    status: error.status,
    headers: {
      "content-type": "application/problem+json",
      ...headers,
    },
  });
}
