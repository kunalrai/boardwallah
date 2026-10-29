import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { problemBody, ApiError } from "./errors";
import { hashBody } from "./ids";
import type { Services } from "./services";
import { parseInstant } from "./time";
import type { SubjectId } from "./content";

const subject = z.enum(["maths", "science", "social_science", "english", "hindi"]);
const phone = z.string().regex(/^\+91[0-9]{10}$/);
const idempotencyKey = z.string().min(1).max(64);

function structured(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data) }],
    structuredContent: data as Record<string, unknown>,
  };
}

function toolError(services: Services, error: unknown) {
  const apiError =
    error instanceof ApiError ? error : new ApiError(500, "internal_error", "The tool failed unexpectedly.");
  if (!(error instanceof ApiError)) console.error(error);
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(problemBody(apiError, services.config.publicBaseUrl)),
      },
    ],
    structuredContent: problemBody(apiError, services.config.publicBaseUrl) as unknown as Record<string, unknown>,
  };
}

async function mcpIdempotent<T>(
  services: Services,
  tool: string,
  key: string,
  body: unknown,
  handler: () => Promise<T> | T,
): Promise<T> {
  if (!key || key.length > 64) {
    throw new ApiError(422, "validation_failed", "idempotency_key is required (max 64 characters).");
  }
  const scope = "mcp";
  const bodyHash = hashBody(body);
  const existing = services.store.getIdempotency(scope, "POST", tool, key);
  if (existing) {
    if (existing.body_hash !== bodyHash) {
      throw new ApiError(409, "idempotency_conflict", "This key was already used with a different request body.");
    }
    return JSON.parse(existing.response) as T;
  }
  const result = await handler();
  services.store.saveIdempotency({
    scope,
    method: "POST",
    path: tool,
    key,
    body_hash: bodyHash,
    status: 200,
    response: JSON.stringify(result),
    created_ms: services.clock(),
  });
  return result;
}

export function createMcpServer(services: Services): McpServer {
  const server = new McpServer(
    { name: "home-tuition-provider", version: services.config.specVersion },
    {
      instructions:
        "Find and book a free CBSE Class 10 home tuition trial with one provider. " +
        "The parent must provide the one-time consent code. Never invent a code. " +
        "Confirm student display name, subjects, locality and time with the parent before booking.",
    },
  );

  server.registerTool(
    "get_provider",
    {
      title: "Get provider",
      description:
        "Returns the provider's qualifications, experience, subjects, service localities, availability, contact channel and policies. Call this first.",
      annotations: { readOnlyHint: true },
    },
    async () => structured(services.provider()),
  );

  server.registerTool(
    "get_plans",
    {
      title: "Get plans",
      description: "Returns plans with prices in paise and INR currency, with cancellation terms.",
      inputSchema: { subject: subject.optional() },
      annotations: { readOnlyHint: true },
    },
    async (args) => structured({ plans: services.plans(args.subject) }),
  );

  server.registerTool(
    "check_trial_slots",
    {
      title: "Check trial slots",
      description: "Lists open trial slots in a locality within a time window (Asia/Kolkata). Does not reserve anything.",
      inputSchema: {
        locality_code: z.string().min(1),
        from: z.string(),
        to: z.string(),
      },
      annotations: { readOnlyHint: true },
    },
    async (args) => {
      try {
        if (!services.isServiceLocality(args.locality_code)) {
          throw new ApiError(422, "outside_service_area", "Choose a locality from the provider's service area.");
        }
        const from = parseInstant(args.from);
        const to = parseInstant(args.to);
        if (from === null || to === null || to <= from) {
          throw new ApiError(422, "validation_failed", "from and to must be valid ISO timestamps with to after from.");
        }
        return structured({ slots: services.listSlots(args.locality_code, from, to) });
      } catch (error) {
        return toolError(services, error);
      }
    },
  );

  server.registerTool(
    "request_parent_consent",
    {
      title: "Request parent consent",
      description:
        "Sends a one-time code to the parent's WhatsApp to confirm consent for a trial booking. The code is never shown to the agent.",
      inputSchema: {
        parent_phone: phone,
        student_display_name: z.string().min(1).max(20),
        policy_version: z.string().min(1).max(50),
        idempotency_key: idempotencyKey,
      },
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async (args) => {
      try {
        const result = await mcpIdempotent(services, "request_parent_consent", args.idempotency_key, args, () =>
          services.requestConsent(args),
        );
        return structured(result);
      } catch (error) {
        return toolError(services, error);
      }
    },
  );

  server.registerTool(
    "verify_parent_consent",
    {
      title: "Verify parent consent",
      description: "Exchanges the parent's one-time code for a consent token valid 30 minutes.",
      inputSchema: {
        request_id: z.string().min(1),
        otp: z.string().regex(/^[0-9]{6}$/),
      },
      annotations: { readOnlyHint: false },
    },
    async (args) => {
      try {
        return structured(services.verifyConsent(args.request_id, args.otp));
      } catch (error) {
        return toolError(services, error);
      }
    },
  );

  server.registerTool(
    "hold_trial_slot",
    {
      title: "Hold trial slot",
      description: "Holds one open slot for 10 minutes so it can be booked. Required before book_trial.",
      inputSchema: {
        slot_id: z.string().min(1),
        idempotency_key: idempotencyKey,
      },
      annotations: { readOnlyHint: false },
    },
    async (args) => {
      try {
        const hold = await mcpIdempotent(services, "hold_trial_slot", args.idempotency_key, args, () =>
          services.holdSlot(args.slot_id),
        );
        return structured(hold);
      } catch (error) {
        return toolError(services, error);
      }
    },
  );

  server.registerTool(
    "book_trial",
    {
      title: "Book trial",
      description:
        "Books a free trial for a held slot. Requires a valid consent token. Only call after the parent confirms all details.",
      inputSchema: {
        hold_id: z.string().min(1),
        consent_token: z.string().min(1),
        student: z.object({ display_name: z.string().min(1).max(20) }),
        subjects: z.array(subject).min(1),
        locality_code: z.string().min(1),
        idempotency_key: idempotencyKey,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
    },
    async (args) => {
      try {
        const result = await mcpIdempotent(services, "book_trial", args.idempotency_key, args, async () => {
          const booking = await services.createBooking({
            hold_id: args.hold_id,
            consent_token: args.consent_token,
            student: args.student,
            subjects: args.subjects as SubjectId[],
            locality_code: args.locality_code,
          });
          return booking.booking;
        });
        return structured(result);
      } catch (error) {
        return toolError(services, error);
      }
    },
  );

  server.registerTool(
    "create_enquiry",
    {
      title: "Create enquiry",
      description: "Sends a non-binding enquiry to the provider. Use when the parent wants information or a callback.",
      inputSchema: {
        locality_code: z.string().min(1),
        subjects: z.array(subject).min(1),
        preferred_windows: z.array(z.string()).max(5).optional(),
        message: z.string().max(500).optional(),
        idempotency_key: idempotencyKey,
      },
      annotations: { readOnlyHint: false, idempotentHint: true },
    },
    async (args) => {
      try {
        if (!services.isServiceLocality(args.locality_code)) {
          throw new ApiError(422, "outside_service_area", "Choose a locality from the provider's service area.");
        }
        const result = await mcpIdempotent(services, "create_enquiry", args.idempotency_key, args, () =>
          services.createEnquiry({
            locality_code: args.locality_code,
            board: "CBSE",
            class: 10,
            subjects: args.subjects as SubjectId[],
            preferred_windows: args.preferred_windows,
            message: args.message,
            channel_hint: "mcp",
          }),
        );
        return structured(result);
      } catch (error) {
        return toolError(services, error);
      }
    },
  );

  return server;
}

export async function handleMcpRequest(request: Request, services: Services): Promise<Response> {
  const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true });
  const server = createMcpServer(services);
  await server.connect(transport);
  return transport.handleRequest(request);
}
