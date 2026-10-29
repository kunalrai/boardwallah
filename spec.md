# Full Specification: Home Tuition Provider (CBSE Class 10)

**Status:** Draft v0.1.0. Ready for review. Bracketed values are placeholders.

**Assumptions used until you confirm otherwise:**
- One provider, you, teaching CBSE Class 10 at the student's home.
- Trial is free. Paid plans are paid by UPI or bank transfer, recorded manually at launch.
- Consent is verified by a 6-digit OTP sent to the parent's WhatsApp, with SMS as fallback.
- Localities use codes like `DL-NOIDA-07`. Replace them with your real list.

```
/spec
  README.md
  /models
    provider.schema.json
    subject.schema.json
    plan.schema.json
    slot.schema.json
    hold.schema.json
    booking.schema.json
    enquiry.schema.json
    consent.schema.json
    problem.schema.json
  /api
    openapi.yaml
  /mcp
    tools.json
  /behaviour
    consent.feature
    slots-and-holds.feature
    booking.feature
    enquiry.feature
    reads.feature
    privacy.feature
  /policies
    privacy.md
    consent.md
    cancellation-refund.md
  /content
    provider.json
    subjects.json
    plans.json
```

---

## 1. README

```markdown
# Home Tuition Provider Spec

Version: 0.1.0
Scope: One provider, CBSE Class 10, home visit, trial booking, enquiries.

## Principles
1. The spec is the source of truth. Change the spec first, then the tests, then the code.
2. Agents are the primary consumer. Every public fact is machine-readable.
3. Minors' data is minimised. Booking requires verified parent consent.
4. Every fact shown on a human page or GBP listing must match /content.

## Versioning
Semantic versioning. Breaking API changes bump the major version and the path prefix (/v2).
Every response includes `version` (spec version) and `last_updated`.

## Status of open decisions
| Decision | Current value | Status |
|---|---|---|
| Service localities | DL-NOIDA-07, DL-NOIDA-12 (placeholders) | Confirm |
| Consent channel | WhatsApp OTP, SMS fallback | Proposed |
| Payments | Manual at launch, no online checkout | Proposed |
| Tech stack | TypeScript, Fastify, Prisma, PostgreSQL | Proposed |
| Qualifications, experience | Placeholders in provider.json | Confirm |
| Plan prices | 0 placeholders in plans.json | Confirm |
```

---

## 2. Data Models

### models/provider.schema.json
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://[your-domain]/spec/models/provider.schema.json",
  "title": "Provider",
  "type": "object",
  "required": ["id", "name", "tutor_name", "qualifications", "experience_years", "teaching_mode", "boards", "classes", "subjects", "languages", "service_localities", "availability", "contact", "trial", "policies", "version", "last_updated"],
  "properties": {
    "id": { "type": "string", "pattern": "^P-[0-9]{3}$" },
    "name": { "type": "string", "maxLength": 120 },
    "tutor_name": { "type": "string", "maxLength": 120 },
    "qualifications": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
    "experience_years": { "type": "integer", "minimum": 0, "maximum": 80 },
    "teaching_mode": { "type": "array", "items": { "enum": ["home_visit", "online"] }, "minItems": 1 },
    "boards": { "type": "array", "items": { "enum": ["CBSE"] }, "minItems": 1 },
    "classes": { "type": "array", "items": { "const": 10 }, "minItems": 1 },
    "subjects": { "type": "array", "items": { "enum": ["maths", "science", "social_science", "english", "hindi"] }, "minItems": 1 },
    "languages": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
    "service_localities": { "type": "array", "items": { "type": "string", "pattern": "^[A-Z]{2}-[A-Z0-9-]+$" }, "minItems": 1 },
    "availability": {
      "type": "object",
      "required": ["timezone", "days", "window"],
      "properties": {
        "timezone": { "const": "Asia/Kolkata" },
        "days": { "type": "array", "items": { "enum": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] } },
        "window": { "type": "string", "pattern": "^[0-2][0-9]:[0-5][0-9]-[0-2][0-9]:[0-5][0-9]$" }
      }
    },
    "contact": {
      "type": "object",
      "required": ["whatsapp", "email"],
      "properties": {
        "whatsapp": { "type": "string", "pattern": "^\\+91[0-9]{10}$" },
        "email": { "type": "string", "format": "email" }
      }
    },
    "trial": {
      "type": "object",
      "required": ["available", "duration_minutes", "fee_paise", "currency"],
      "properties": {
        "available": { "type": "boolean" },
        "duration_minutes": { "type": "integer", "minimum": 30, "maximum": 120 },
        "fee_paise": { "type": "integer", "minimum": 0 },
        "currency": { "const": "INR" }
      }
    },
    "policies": {
      "type": "object",
      "required": ["refund", "cancellation", "privacy_url"],
      "properties": {
        "refund": { "type": "string" },
        "cancellation": { "type": "string" },
        "privacy_url": { "type": "string", "format": "uri" }
      }
    },
    "version": { "type": "string" },
    "last_updated": { "type": "string", "format": "date-time" }
  },
  "additionalProperties": false
}
```

### models/subject.schema.json
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://[your-domain]/spec/models/subject.schema.json",
  "title": "Subject",
  "type": "object",
  "required": ["id", "board", "class", "name"],
  "properties": {
    "id": { "enum": ["maths", "science", "social_science", "english", "hindi"] },
    "board": { "const": "CBSE" },
    "class": { "const": 10 },
    "name": { "type": "string" },
    "chapters_url": { "type": "string" }
  },
  "additionalProperties": false
}
```

### models/plan.schema.json
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://[your-domain]/spec/models/plan.schema.json",
  "title": "Plan",
  "type": "object",
  "required": ["id", "name", "type", "price_paise", "currency", "cancellation"],
  "properties": {
    "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
    "name": { "type": "string" },
    "type": { "enum": ["monthly", "per_subject", "crash_course"] },
    "price_paise": { "type": "integer", "minimum": 0, "description": "Amount in paise (1 INR = 100 paise). Never a formatted string." },
    "currency": { "const": "INR" },
    "subjects": { "type": "array", "items": { "enum": ["maths", "science", "social_science", "english", "hindi"] } },
    "sessions_per_week": { "type": "integer", "minimum": 1, "maximum": 7 },
    "session_minutes": { "type": "integer", "minimum": 30, "maximum": 180 },
    "duration_days": { "type": "integer", "minimum": 1 },
    "cancellation": { "type": "string" }
  },
  "additionalProperties": false
}
```

### models/slot.schema.json
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://[your-domain]/spec/models/slot.schema.json",
  "title": "TrialSlot",
  "type": "object",
  "required": ["id", "provider_id", "locality_code", "starts_at", "ends_at", "status", "version", "last_updated"],
  "properties": {
    "id": { "type": "string", "pattern": "^S-[0-9]+$" },
    "provider_id": { "type": "string" },
    "locality_code": { "type": "string" },
    "starts_at": { "type": "string", "format": "date-time", "description": "ISO 8601 with +05:30 offset" },
    "ends_at": { "type": "string", "format": "date-time" },
    "status": { "enum": ["open", "held", "booked", "closed"] },
    "version": { "type": "string" },
    "last_updated": { "type": "string", "format": "date-time" }
  },
  "additionalProperties": false
}
```

### models/hold.schema.json
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://[your-domain]/spec/models/hold.schema.json",
  "title": "SlotHold",
  "type": "object",
  "required": ["id", "slot_id", "expires_at", "status"],
  "properties": {
    "id": { "type": "string", "pattern": "^H-[0-9a-f]{12}$" },
    "slot_id": { "type": "string" },
    "expires_at": { "type": "string", "format": "date-time", "description": "Created time + 10 minutes" },
    "status": { "enum": ["active", "released", "converted", "expired"] }
  },
  "additionalProperties": false
}
```

### models/booking.schema.json
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://[your-domain]/spec/models/booking.schema.json",
  "title": "Booking",
  "description": "Public view. Parent contact details are stored internally and never returned.",
  "type": "object",
  "required": ["id", "type", "slot_id", "student", "subjects", "locality_code", "status", "payment_status", "consent_id", "created_at", "version", "last_updated"],
  "properties": {
    "id": { "type": "string", "pattern": "^B-[0-9a-f]{12}$" },
    "type": { "const": "trial" },
    "slot_id": { "type": "string" },
    "student": {
      "type": "object",
      "required": ["display_name", "class", "board"],
      "properties": {
        "display_name": { "type": "string", "maxLength": 20, "description": "First name or initials only" },
        "class": { "const": 10 },
        "board": { "const": "CBSE" }
      }
    },
    "subjects": { "type": "array", "items": { "enum": ["maths", "science", "social_science", "english", "hindi"] }, "minItems": 1 },
    "locality_code": { "type": "string" },
    "status": { "enum": ["confirmed", "cancelled", "completed", "no_show"] },
    "payment_status": { "enum": ["not_required", "pending", "paid"] },
    "consent_id": { "type": "string" },
    "created_at": { "type": "string", "format": "date-time" },
    "version": { "type": "string" },
    "last_updated": { "type": "string", "format": "date-time" }
  },
  "additionalProperties": false
}
```

### models/enquiry.schema.json
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://[your-domain]/spec/models/enquiry.schema.json",
  "title": "Enquiry",
  "type": "object",
  "required": ["id", "channel", "locality_code", "board", "class", "subjects", "status", "created_at"],
  "properties": {
    "id": { "type": "string", "pattern": "^E-[0-9a-f]{12}$" },
    "channel": { "enum": ["api", "web_form", "whatsapp", "gbp", "mcp"] },
    "locality_code": { "type": "string" },
    "board": { "const": "CBSE" },
    "class": { "const": 10 },
    "subjects": { "type": "array", "items": { "enum": ["maths", "science", "social_science", "english", "hindi"] } },
    "preferred_windows": { "type": "array", "items": { "type": "string" } },
    "message": { "type": "string", "maxLength": 500 },
    "status": { "enum": ["new", "contacted", "converted", "closed"] },
    "created_at": { "type": "string", "format": "date-time" }
  },
  "additionalProperties": false
}
```

### models/consent.schema.json
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://[your-domain]/spec/models/consent.schema.json",
  "title": "ConsentRecord",
  "description": "Stored separately from bookings. Parent contact is held internally only.",
  "type": "object",
  "required": ["id", "request_id", "purpose", "student_ref", "channel", "status", "granted_at", "expires_at", "policy_version"],
  "properties": {
    "id": { "type": "string", "pattern": "^C-[0-9a-f]{12}$" },
    "request_id": { "type": "string" },
    "purpose": { "enum": ["trial_booking"] },
    "student_ref": { "type": "string", "description": "Internal reference, never the student's name" },
    "channel": { "enum": ["whatsapp", "sms"] },
    "status": { "enum": ["pending", "granted", "used", "expired", "revoked"] },
    "granted_at": { "type": "string", "format": "date-time" },
    "expires_at": { "type": "string", "format": "date-time", "description": "Granted + 30 minutes for token use" },
    "policy_version": { "type": "string" }
  },
  "additionalProperties": false
}
```

### models/problem.schema.json
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://[your-domain]/spec/models/problem.schema.json",
  "title": "Problem",
  "description": "RFC 9457 problem details, with a machine-readable code.",
  "type": "object",
  "required": ["type", "title", "status", "code"],
  "properties": {
    "type": { "type": "string", "format": "uri" },
    "title": { "type": "string" },
    "status": { "type": "integer" },
    "detail": { "type": "string" },
    "instance": { "type": "string" },
    "code": {
      "enum": [
        "validation_failed",
        "not_found",
        "consent_required",
        "consent_invalid",
        "consent_expired",
        "slot_unavailable",
        "hold_expired",
        "hold_invalid",
        "idempotency_conflict",
        "outside_service_area",
        "booking_not_cancellable",
        "rate_limited",
        "unauthorized",
        "internal_error"
      ]
    }
  },
  "additionalProperties": true
}
```

---

## 3. API (OpenAPI 3.1)

### api/openapi.yaml
```yaml
openapi: 3.1.0
info:
  title: Home Tuition Provider API
  version: 0.1.0
  description: |
    Machine interface for a single home-tuition provider (CBSE Class 10).
    Read endpoints are public. Writes require a parent consent token.
    Money is always integer paise. Timestamps are ISO 8601 with +05:30.
servers:
  - url: https://[your-domain]/api/v1
security:
  - {}
  - ApiKey: []

tags:
  - name: Provider
  - name: Content
  - name: Slots
  - name: Consent
  - name: Bookings
  - name: Enquiries

paths:
  /provider:
    get:
      tags: [Provider]
      operationId: getProvider
      summary: Get the provider profile
      responses:
        "200":
          description: Provider profile
          headers:
            X-RateLimit-Limit: { schema: { type: integer } }
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Provider" }
        "429": { $ref: "#/components/responses/RateLimited" }

  /subjects:
    get:
      tags: [Content]
      operationId: listSubjects
      summary: List subjects for a board and class
      parameters:
        - { name: board, in: query, schema: { type: string, enum: [CBSE], default: CBSE } }
        - { name: class, in: query, schema: { type: integer, enum: [10], default: 10 } }
      responses:
        "200":
          description: Subjects
          content:
            application/json:
              schema:
                type: object
                required: [version, last_updated, subjects]
                properties:
                  version: { type: string }
                  last_updated: { type: string, format: date-time }
                  subjects:
                    type: array
                    items: { $ref: "#/components/schemas/Subject" }

  /plans:
    get:
      tags: [Content]
      operationId: listPlans
      summary: List plans with prices in paise
      responses:
        "200":
          description: Plans
          content:
            application/json:
              schema:
                type: object
                required: [version, last_updated, plans]
                properties:
                  version: { type: string }
                  last_updated: { type: string, format: date-time }
                  plans:
                    type: array
                    items: { $ref: "#/components/schemas/Plan" }

  /slots:
    get:
      tags: [Slots]
      operationId: listSlots
      summary: List trial slots in a time window
      description: Returns only slots with status open. Times are in Asia/Kolkata.
      parameters:
        - { name: locality_code, in: query, required: true, schema: { type: string } }
        - { name: from, in: query, required: true, schema: { type: string, format: date-time } }
        - { name: to, in: query, required: true, schema: { type: string, format: date-time } }
      responses:
        "200":
          description: Open slots
          content:
            application/json:
              schema:
                type: object
                required: [version, last_updated, slots]
                properties:
                  version: { type: string }
                  last_updated: { type: string, format: date-time }
                  slots:
                    type: array
                    items: { $ref: "#/components/schemas/TrialSlot" }
        "400": { $ref: "#/components/responses/Problem" }
        "422": { $ref: "#/components/responses/Problem" }
        "429": { $ref: "#/components/responses/RateLimited" }

  /slots/{slot_id}/hold:
    post:
      tags: [Slots]
      operationId: holdSlot
      summary: Hold a slot for 10 minutes
      parameters:
        - { name: slot_id, in: path, required: true, schema: { type: string } }
        - { name: Idempotency-Key, in: header, required: true, schema: { type: string, maxLength: 64 } }
      responses:
        "201":
          description: Slot held
          content:
            application/json:
              schema: { $ref: "#/components/schemas/SlotHold" }
        "409": { $ref: "#/components/responses/Problem" }
        "404": { $ref: "#/components/responses/Problem" }
        "429": { $ref: "#/components/responses/RateLimited" }

  /consent/requests:
    post:
      tags: [Consent]
      operationId: createConsentRequest
      summary: Send an OTP to the parent to confirm consent for a trial booking
      description: |
        The OTP is delivered to the parent's WhatsApp, or SMS if WhatsApp fails.
        The agent never receives the OTP. The parent must pass it to the agent or enter it on the booking page.
      parameters:
        - { name: Idempotency-Key, in: header, required: true, schema: { type: string, maxLength: 64 } }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [parent_phone, student_display_name, purpose, policy_version]
              properties:
                parent_phone: { type: string, pattern: "^\\+91[0-9]{10}$" }
                student_display_name: { type: string, maxLength: 20 }
                purpose: { const: trial_booking }
                policy_version: { type: string, description: "Version of /policies/privacy.md the parent accepted" }
      responses:
        "202":
          description: OTP sent
          content:
            application/json:
              schema:
                type: object
                required: [request_id, channel, expires_at]
                properties:
                  request_id: { type: string, pattern: "^R-[0-9a-f]{12}$" }
                  channel: { enum: [whatsapp, sms] }
                  expires_at: { type: string, format: date-time, description: "OTP valid 10 minutes" }
        "422": { $ref: "#/components/responses/Problem" }
        "429": { $ref: "#/components/responses/RateLimited" }

  /consent/requests/{request_id}/verify:
    post:
      tags: [Consent]
      operationId: verifyConsentRequest
      summary: Verify the OTP and receive a consent token
      parameters:
        - { name: request_id, in: path, required: true, schema: { type: string } }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [otp]
              properties:
                otp: { type: string, pattern: "^[0-9]{6}$" }
      responses:
        "200":
          description: Consent granted
          content:
            application/json:
              schema:
                type: object
                required: [consent_id, consent_token, expires_at]
                properties:
                  consent_id: { type: string, pattern: "^C-[0-9a-f]{12}$" }
                  consent_token: { type: string, description: "Single-use, valid 30 minutes, bound to this request" }
                  expires_at: { type: string, format: date-time }
        "401": { $ref: "#/components/responses/Problem" }
        "404": { $ref: "#/components/responses/Problem" }
        "410": { $ref: "#/components/responses/Problem" }
        "429": { $ref: "#/components/responses/RateLimited" }

  /trial-bookings:
    post:
      tags: [Bookings]
      operationId: createTrialBooking
      summary: Book a free trial for a held slot
      description: |
        Requires an active hold and a valid consent token. Idempotency-Key is required.
        A repeated request with the same key returns the original result (200) and creates nothing new.
        On success, the slot becomes booked and the parent receives a WhatsApp confirmation.
        Returns a booking_access_token, which the parent uses to view or cancel the booking.
      parameters:
        - { name: Idempotency-Key, in: header, required: true, schema: { type: string, maxLength: 64 } }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [hold_id, consent_token, student, subjects, locality_code]
              properties:
                hold_id: { type: string, pattern: "^H-[0-9a-f]{12}$" }
                consent_token: { type: string }
                student:
                  type: object
                  required: [display_name]
                  properties:
                    display_name: { type: string, maxLength: 20 }
                subjects:
                  type: array
                  minItems: 1
                  items: { enum: [maths, science, social_science, english, hindi] }
                locality_code: { type: string }
      responses:
        "201":
          description: Booking confirmed
          content:
            application/json:
              schema:
                type: object
                required: [booking, booking_access_token]
                properties:
                  booking: { $ref: "#/components/schemas/Booking" }
                  booking_access_token: { type: string, description: "Sent to the parent by WhatsApp. Not stored by agents." }
        "200":
          description: Idempotent replay of an existing booking
          content:
            application/json:
              schema:
                type: object
                required: [booking]
                properties:
                  booking: { $ref: "#/components/schemas/Booking" }
        "403": { $ref: "#/components/responses/Problem" }
        "409": { $ref: "#/components/responses/Problem" }
        "410": { $ref: "#/components/responses/Problem" }
        "422": { $ref: "#/components/responses/Problem" }
        "429": { $ref: "#/components/responses/RateLimited" }

  /bookings/{booking_id}:
    get:
      tags: [Bookings]
      operationId: getBooking
      summary: Get a booking (parent only)
      parameters:
        - { name: booking_id, in: path, required: true, schema: { type: string } }
      security:
        - BookingToken: []
      responses:
        "200":
          description: Booking
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Booking" }
        "401": { $ref: "#/components/responses/Problem" }
        "404": { $ref: "#/components/responses/Problem" }

  /bookings/{booking_id}/cancel:
    post:
      tags: [Bookings]
      operationId: cancelBooking
      summary: Cancel a trial booking
      description: Allowed up to 4 hours before the slot start. Releases the slot.
      parameters:
        - { name: booking_id, in: path, required: true, schema: { type: string } }
        - { name: Idempotency-Key, in: header, required: true, schema: { type: string, maxLength: 64 } }
      security:
        - BookingToken: []
      responses:
        "200":
          description: Cancelled
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Booking" }
        "401": { $ref: "#/components/responses/Problem" }
        "404": { $ref: "#/components/responses/Problem" }
        "409": { $ref: "#/components/responses/Problem" }

  /enquiries:
    post:
      tags: [Enquiries]
      operationId: createEnquiry
      summary: Send an enquiry (no booking)
      description: Contact details are not required in the body. The provider replies via the channel the parent chooses.
      parameters:
        - { name: Idempotency-Key, in: header, required: true, schema: { type: string, maxLength: 64 } }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [locality_code, board, class, subjects]
              properties:
                locality_code: { type: string }
                board: { const: CBSE }
                class: { const: 10 }
                subjects:
                  type: array
                  minItems: 1
                  items: { enum: [maths, science, social_science, english, hindi] }
                preferred_windows: { type: array, items: { type: string }, maxItems: 5 }
                message: { type: string, maxLength: 500 }
                channel_hint: { enum: [api, web_form, whatsapp, gbp, mcp], default: api }
      responses:
        "201":
          description: Enquiry received
          content:
            application/json:
              schema: { $ref: "#/components/schemas/Enquiry" }
        "422": { $ref: "#/components/responses/Problem" }
        "429": { $ref: "#/components/responses/RateLimited" }

components:
  securitySchemes:
    ApiKey:
      type: apiKey
      in: header
      name: X-API-Key
      description: Optional for read endpoints. Higher rate limit when present.
    BookingToken:
      type: http
      scheme: bearer
      description: booking_access_token returned at booking creation

  responses:
    Problem:
      description: Error (RFC 9457)
      content:
        application/problem+json:
          schema: { $ref: "https://[your-domain]/spec/models/problem.schema.json" }
    RateLimited:
      description: Rate limit exceeded
      headers:
        Retry-After: { schema: { type: integer } }
      content:
        application/problem+json:
          schema: { $ref: "https://[your-domain]/spec/models/problem.schema.json" }

  schemas:
    Provider:
      $ref: "https://[your-domain]/spec/models/provider.schema.json"
    Subject:
      $ref: "https://[your-domain]/spec/models/subject.schema.json"
    Plan:
      $ref: "https://[your-domain]/spec/models/plan.schema.json"
    TrialSlot:
      $ref: "https://[your-domain]/spec/models/slot.schema.json"
    SlotHold:
      $ref: "https://[your-domain]/spec/models/hold.schema.json"
    Booking:
      $ref: "https://[your-domain]/spec/models/booking.schema.json"
    Enquiry:
      $ref: "https://[your-domain]/spec/models/enquiry.schema.json"
```

**Global rules (apply to every endpoint):**
- Every response includes `version` and `last_updated` where it returns content.
- Every `POST` requires `Idempotency-Key`. The key is scoped to the API key and path, and kept for 24 hours.
- Reuse of a key with a different body returns `409 idempotency_conflict`.
- Rate limits: reads 60/min and writes 10/min per API key; without a key, 20/min reads and 10/min writes per IP. Exceeding returns `429` with `Retry-After`. The anonymous write limit accommodates the four-write consent and booking flow within one minute.

---

## 4. Error Catalogue

| HTTP | code | When |
|---|---|---|
| 400 | validation_failed | Malformed parameters |
| 401 | unauthorized | Missing or wrong booking token, or OTP mismatch |
| 401 | consent_invalid | Token wrong or already used |
| 403 | consent_required | Booking attempted without a consent token |
| 404 | not_found | Unknown ID |
| 409 | slot_unavailable | Slot already held or booked by someone else |
| 409 | idempotency_conflict | Same key, different body |
| 409 | booking_not_cancellable | Within 4 hours of start, or already cancelled |
| 410 | consent_expired | Token past its 30-minute life |
| 410 | hold_expired | Hold passed 10 minutes |
| 422 | outside_service_area | Locality not in provider's list |
| 422 | validation_failed | Field-level violation of a schema |
| 429 | rate_limited | Too many requests |
| 500 | internal_error | Unexpected server failure |

Each error body is a `Problem` with `type` set to `https://[your-domain]/errors/{code}`.

Example:
```json
{
  "type": "https://[your-domain]/errors/consent_required",
  "title": "Parent consent is required to book a trial.",
  "status": 403,
  "code": "consent_required",
  "detail": "Call POST /consent/requests, then POST /consent/requests/{id}/verify.",
  "instance": "/trial-bookings"
}
```

---

## 5. Booking Flow

1. Agent calls `GET /slots?locality_code=…&from=…&to=…`.
2. Agent calls `POST /slots/{id}/hold`. Hold lasts 10 minutes.
3. Agent calls `POST /consent/requests` with the parent's phone. The parent receives an OTP on WhatsApp.
4. The parent gives the OTP to the agent. Agent calls `POST /consent/requests/{id}/verify`, receiving a consent token valid 30 minutes.
5. Agent calls `POST /trial-bookings` with `hold_id`, `consent_token`, student details, and an idempotency key.
6. System confirms the booking, sends a WhatsApp confirmation with the `booking_access_token`, and returns the booking to the agent.

If step 5 comes after the hold expires, return `410 hold_expired` and the agent must re-hold.

---

## 6. MCP Tools

### mcp/tools.json
```json
{
  "name": "home-tuition-provider",
  "version": "0.1.0",
  "description": "Find and book a free CBSE Class 10 home tuition trial with one provider. Booking needs parent consent via OTP.",
  "tools": [
    {
      "name": "get_provider",
      "description": "Returns the provider's qualifications, experience, subjects, service localities, availability, contact channel and policies. Call this first to decide whether the provider fits the request.",
      "inputSchema": { "type": "object", "properties": {}, "additionalProperties": false },
      "outputSchema": { "$ref": "https://[your-domain]/spec/models/provider.schema.json" },
      "annotations": { "readOnlyHint": true }
    },
    {
      "name": "get_plans",
      "description": "Returns plans with prices in paise and INR currency, with cancellation terms. Use before quoting any price.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "subject": { "enum": ["maths", "science", "social_science", "english", "hindi"] }
        },
        "additionalProperties": false
      },
      "outputSchema": { "type": "object", "properties": { "plans": { "type": "array", "items": { "$ref": "https://[your-domain]/spec/models/plan.schema.json" } } } },
      "annotations": { "readOnlyHint": true }
    },
    {
      "name": "check_trial_slots",
      "description": "Lists open trial slots in a locality within a time window (Asia/Kolkata). Returns only open slots. Does not reserve anything.",
      "inputSchema": {
        "type": "object",
        "required": ["locality_code", "from", "to"],
        "properties": {
          "locality_code": { "type": "string" },
          "from": { "type": "string", "format": "date-time" },
          "to": { "type": "string", "format": "date-time" }
        },
        "additionalProperties": false
      },
      "outputSchema": { "type": "object", "properties": { "slots": { "type": "array", "items": { "$ref": "https://[your-domain]/spec/models/slot.schema.json" } } } },
      "annotations": { "readOnlyHint": true }
    },
    {
      "name": "request_parent_consent",
      "description": "Sends a one-time code to the parent's WhatsApp to confirm consent for a trial booking. The agent must ask the parent for the code. The code is never shown to the agent.",
      "inputSchema": {
        "type": "object",
        "required": ["parent_phone", "student_display_name", "policy_version", "idempotency_key"],
        "properties": {
          "parent_phone": { "type": "string", "pattern": "^\\+91[0-9]{10}$" },
          "student_display_name": { "type": "string", "maxLength": 20 },
          "policy_version": { "type": "string" },
          "idempotency_key": { "type": "string", "maxLength": 64 }
        },
        "additionalProperties": false
      },
      "outputSchema": { "type": "object", "properties": { "request_id": { "type": "string" }, "channel": { "enum": ["whatsapp", "sms"] }, "expires_at": { "type": "string", "format": "date-time" } } },
      "annotations": { "readOnlyHint": false, "destructiveHint": false }
    },
    {
      "name": "verify_parent_consent",
      "description": "Exchanges the parent's one-time code for a consent token valid 30 minutes. Use only with a code the parent has provided in this conversation.",
      "inputSchema": {
        "type": "object",
        "required": ["request_id", "otp"],
        "properties": {
          "request_id": { "type": "string" },
          "otp": { "type": "string", "pattern": "^[0-9]{6}$" }
        },
        "additionalProperties": false
      },
      "outputSchema": { "type": "object", "properties": { "consent_id": { "type": "string" }, "consent_token": { "type": "string" }, "expires_at": { "type": "string", "format": "date-time" } } },
      "annotations": { "readOnlyHint": false }
    },
    {
      "name": "hold_trial_slot",
      "description": "Holds one open slot for 10 minutes so it can be booked. Required before book_trial.",
      "inputSchema": {
        "type": "object",
        "required": ["slot_id", "idempotency_key"],
        "properties": {
          "slot_id": { "type": "string" },
          "idempotency_key": { "type": "string", "maxLength": 64 }
        },
        "additionalProperties": false
      },
      "outputSchema": { "$ref": "https://[your-domain]/spec/models/hold.schema.json" },
      "annotations": { "readOnlyHint": false }
    },
    {
      "name": "book_trial",
      "description": "Books a free trial for a held slot. Requires a valid consent token. Only call after the parent has explicitly confirmed the booking details in this conversation.",
      "inputSchema": {
        "type": "object",
        "required": ["hold_id", "consent_token", "student", "subjects", "locality_code", "idempotency_key"],
        "properties": {
          "hold_id": { "type": "string" },
          "consent_token": { "type": "string" },
          "student": {
            "type": "object",
            "required": ["display_name"],
            "properties": { "display_name": { "type": "string", "maxLength": 20 } }
          },
          "subjects": { "type": "array", "minItems": 1, "items": { "enum": ["maths", "science", "social_science", "english", "hindi"] } },
          "locality_code": { "type": "string" },
          "idempotency_key": { "type": "string", "maxLength": 64 }
        },
        "additionalProperties": false
      },
      "outputSchema": { "$ref": "https://[your-domain]/spec/models/booking.schema.json" },
      "annotations": { "readOnlyHint": false, "destructiveHint": false, "idempotentHint": true }
    },
    {
      "name": "create_enquiry",
      "description": "Sends a non-binding enquiry to the provider. Use when the parent wants information or a callback rather than a trial.",
      "inputSchema": {
        "type": "object",
        "required": ["locality_code", "subjects", "idempotency_key"],
        "properties": {
          "locality_code": { "type": "string" },
          "subjects": { "type": "array", "minItems": 1, "items": { "enum": ["maths", "science", "social_science", "english", "hindi"] } },
          "preferred_windows": { "type": "array", "items": { "type": "string" }, "maxItems": 5 },
          "message": { "type": "string", "maxLength": 500 },
          "idempotency_key": { "type": "string", "maxLength": 64 }
        },
        "additionalProperties": false
      },
      "outputSchema": { "$ref": "https://[your-domain]/spec/models/enquiry.schema.json" },
      "annotations": { "readOnlyHint": false, "idempotentHint": true }
    }
  ]
}
```

**Tool rules:**
- `book_trial` must never be called without the parent's explicit confirmation of student name, subjects, locality, and time.
- Agents must not store `consent_token` or `booking_access_token` beyond the current task.
- Tool errors return the same `code` values as the API.

---

## 7. Behaviour (Gherkin)

### behaviour/consent.feature
```gherkin
Feature: Parent consent for trial booking

  Scenario: Consent request is sent to the parent's WhatsApp
    Given the parent phone is "+919800000001"
    When the agent calls POST /consent/requests with purpose "trial_booking"
    Then the response status is 202
    And the channel is "whatsapp"
    And the OTP is not included in the response

  Scenario: Consent request falls back to SMS when WhatsApp fails
    Given WhatsApp delivery fails for the parent phone
    When the agent calls POST /consent/requests
    Then the response status is 202
    And the channel is "sms"

  Scenario: Correct OTP grants a single-use consent token
    Given consent request "R-0a1b2c3d4e5f" is pending
    When the agent calls POST /consent/requests/R-0a1b2c3d4e5f/verify with the correct OTP
    Then the response status is 200
    And a consent token is returned with a 30-minute expiry
    When the same token is used for a second booking
    Then the error code is "consent_invalid"

  Scenario: Wrong OTP is rejected
    Given consent request "R-0a1b2c3d4e5f" is pending
    When the agent verifies with a wrong OTP
    Then the response status is 401
    And the error code is "unauthorized"

  Scenario: Five wrong OTP attempts lock the request
    Given consent request "R-0a1b2c3d4e5f" is pending
    When five wrong OTPs are submitted
    Then the next verify attempt returns 429
    And the request cannot be verified again

  Scenario: Expired OTP cannot be used
    Given consent request "R-0a1b2c3d4e5f" was created 11 minutes ago
    When the correct OTP is submitted
    Then the response status is 410
    And the error code is "consent_expired"
```

### behaviour/slots-and-holds.feature
```gherkin
Feature: Trial slots and holds

  Scenario: Open slots are listed for a locality and window
    Given slot "S-5531" is open at 17:00 IST tomorrow in locality "DL-NOIDA-07"
    When the agent calls GET /slots with locality "DL-NOIDA-07" covering tomorrow
    Then the response status is 200
    And "S-5531" appears with status "open"

  Scenario: Held and booked slots are not listed as open
    Given slot "S-5531" is held
    When the agent calls GET /slots covering tomorrow
    Then "S-5531" does not appear in the results

  Scenario: Holding an open slot succeeds
    Given slot "S-5531" is open
    When the agent calls POST /slots/S-5531/hold
    Then the response status is 201
    And the hold expires 10 minutes later
    And slot "S-5531" status is "held"

  Scenario: A second hold on the same slot is refused
    Given slot "S-5531" is held by another request
    When the agent calls POST /slots/S-5531/hold
    Then the response status is 409
    And the error code is "slot_unavailable"

  Scenario: A hold expires after 10 minutes
    Given slot "S-5531" was held 11 minutes ago
    Then slot "S-5531" status is "open"
    And the hold status is "expired"

  Scenario: Repeated hold request with the same key returns the same hold
    Given a hold was created with key "K-1" for slot "S-5531"
    When the same request is sent with key "K-1"
    Then the response returns the original hold
    And no second hold is created
```

### behaviour/booking.feature
```gherkin
Feature: Trial booking

  Scenario: Booking succeeds with a valid hold and consent
    Given slot "S-5531" is held by hold "H-aaaaaaaaaaaa"
    And a valid consent token for purpose "trial_booking"
    When the agent calls POST /trial-bookings with the hold, token, student "Riya", subjects ["maths"], and locality "DL-NOIDA-07"
    Then the response status is 201
    And a booking is created with status "confirmed" and payment_status "not_required"
    And slot "S-5531" status is "booked"
    And the parent receives a WhatsApp confirmation
    And the response includes a booking_access_token
    And the response does not include the parent's phone number

  Scenario: Booking without consent is rejected
    Given slot "S-5531" is held by hold "H-aaaaaaaaaaaa"
    When the agent calls POST /trial-bookings without a consent token
    Then the response status is 403
    And the error code is "consent_required"

  Scenario: Booking with an expired hold is rejected
    Given hold "H-aaaaaaaaaaaa" expired 1 minute ago
    When the agent books with that hold
    Then the response status is 410
    And the error code is "hold_expired"

  Scenario: Repeated booking with the same idempotency key creates nothing new
    Given a booking was created with idempotency key "K-2"
    When the same request is sent again with key "K-2"
    Then the response status is 200
    And the response returns the original booking
    And no second booking exists

  Scenario: Same idempotency key with a different body is refused
    Given a booking was created with idempotency key "K-2"
    When a request with key "K-2" and a different student name is sent
    Then the response status is 409
    And the error code is "idempotency_conflict"

  Scenario: Locality outside the service area is refused
    Given the provider's service localities are "DL-NOIDA-07" and "DL-NOIDA-12"
    When the agent books in locality "MH-PUNE-01"
    Then the response status is 422
    And the error code is "outside_service_area"

  Scenario: Parent can view their booking with the access token
    Given a booking "B-111111111111" exists
    When the parent calls GET /bookings/B-111111111111 with the booking_access_token
    Then the response status is 200
    And the booking is returned

  Scenario: Booking cannot be read without the token
    Given a booking "B-111111111111" exists
    When a request calls GET /bookings/B-111111111111 without a token
    Then the response status is 401

  Scenario: Cancellation more than 4 hours before start succeeds
    Given booking "B-111111111111" starts in 6 hours
    When the parent cancels it
    Then the booking status is "cancelled"
    And slot status returns to "open"

  Scenario: Cancellation within 4 hours is refused
    Given booking "B-111111111111" starts in 2 hours
    When the parent cancels it
    Then the response status is 409
    And the error code is "booking_not_cancellable"
```

### behaviour/enquiry.feature
```gherkin
Feature: Enquiries

  Scenario: Enquiry is accepted without contact details in the request
    Given the locality "DL-NOIDA-07" is in the service area
    When the agent posts an enquiry for maths and science
    Then the response status is 201
    And the enquiry status is "new"

  Scenario: Enquiry outside the service area is refused
    When the agent posts an enquiry for locality "MH-PUNE-01"
    Then the response status is 422
    And the error code is "outside_service_area"

  Scenario: Enquiry message is limited to 500 characters
    When the agent posts an enquiry with a 600-character message
    Then the response status is 422
    And the error code is "validation_failed"
```

### behaviour/reads.feature
```gherkin
Feature: Public reads

  Scenario: Provider profile is returned with version and timestamp
    When the agent calls GET /provider
    Then the response status is 200
    And the response includes "version" and "last_updated"

  Scenario: Plan prices are integers in paise
    When the agent calls GET /plans
    Then every plan has "price_paise" as an integer
    And every plan has currency "INR"

  Scenario: Read rate limit is enforced
    Given an anonymous client has made 20 reads this minute
    When it calls GET /provider again
    Then the response status is 429
    And a Retry-After header is present

  Scenario: Public content matches the content files
    Given /content/provider.json has tutor_name "[Your full name]"
    When the agent calls GET /provider
    Then the returned tutor_name equals the value in /content/provider.json
```

### behaviour/privacy.feature
```gherkin
Feature: Privacy of minors and parents

  Scenario: Agents never see parent contact details
    When any agent calls any endpoint with a booking
    Then no response contains a phone number or email except the provider's own contact

  Scenario: Student identity is limited to a display name
    When a booking is created with student display name "Riya Sharma"
    Then the request is refused with code "validation_failed"

  Scenario: Consent records are kept separately from bookings
    Given a booking "B-111111111111" with consent "C-aaaaaaaaaaaa"
    Then the booking response contains consent_id but no consent token or parent phone

  Scenario: Parent deletion request removes personal data
    Given a booking and consent exist for a parent phone
    When the parent requests deletion
    Then the parent phone, student display name, and enquiry messages are deleted within 30 days
    And anonymised booking counts are retained
```

---

## 8. Policies

### policies/privacy.md
```markdown
# Privacy Policy (summary, version 1.0)

**Who we are:** [Your trading name], run by [Your full name]. Contact: [business email].

**Who the service is for:** Parents and guardians of students in Class 10. Students are minors. We never ask for a student's full name, date of birth, school name, address, or health information.

**What we collect:**
- Parent: name, phone number (WhatsApp), locality.
- Student: first name or initials, class, board, subjects.
- Enquiry or booking details: preferred times and a short message.

**What we do not collect:** Student date of birth, school name, photos of the student, health data, or Aadhaar and other ID numbers.

**Consent:** A booking requires a one-time code sent to the parent's WhatsApp. The parent confirms consent and the code is recorded with the time and policy version.

**Retention:** Booking and enquiry records are kept for 12 months after the last session, then deleted. Consent records are kept for 3 years to show proof of consent.

**Sharing:** We do not sell data. AI agents receive only public provider information and the booking status for the parent who holds the access token. Agents never receive parent phone numbers.

**Your rights:** Request access, correction, or deletion at [business email]. We respond within 7 days.

**Security:** Data is stored in encrypted form at rest and in transit, with access limited to the provider.

**Changes:** Changes are published with a new version number. Consent records keep the version the parent accepted.
```

### policies/consent.md
```markdown
# Consent Policy (version 1.0)

1. Trial bookings for minors require verified parent consent.
2. Consent is requested by a one-time code sent to the parent's WhatsApp, with SMS fallback.
3. The code expires after 10 minutes. Five wrong attempts lock the request.
4. A consent token is granted after successful verification. It is valid for 30 minutes, single-use, and bound to one booking.
5. The parent can revoke consent at any time by writing to [business email]. Revoking cancels any unused hold and any future booking that depends on it.
6. Consent is not given on the parent's behalf by an agent. The parent must provide the code.
```

### policies/cancellation-refund.md
```markdown
# Cancellation and Refund Policy (version 1.0)

**Trial sessions:** Free. Cancel up to 4 hours before the start time through the booking link or by WhatsApp. Cancellations within 4 hours are not possible through the API; contact the provider directly.

**Paid plans:**
- Cancel before the first session for a full refund.
- After the first session, the remaining unused sessions are refunded pro rata, minus the cost of sessions already delivered.
- Refunds are paid by UPI or bank transfer within 7 working days.

**Missed sessions:** If the provider cancels a session, it is rescheduled or refunded at the parent's choice.

**Tutor replacement:** If the parent is not satisfied after the trial, the parent can request a replacement or a refund for any paid period not yet started.

[Replace bracketed amounts and timings with final terms before publishing.]
```

---

## 9. Content (Source of Truth)

### content/provider.json
```json
{
  "id": "P-001",
  "version": "1.0.0",
  "last_updated": "2026-10-29T00:00:00+05:30",
  "name": "[Your trading name]",
  "tutor_name": "[Your full name]",
  "qualifications": ["[Degree, e.g. M.Sc. Mathematics]", "[B.Ed., if applicable]"],
  "experience_years": 0,
  "teaching_mode": ["home_visit"],
  "boards": ["CBSE"],
  "classes": [10],
  "subjects": ["maths", "science", "social_science", "english", "hindi"],
  "languages": ["English", "Hindi"],
  "service_localities": ["DL-NOIDA-07", "DL-NOIDA-12"],
  "availability": {
    "timezone": "Asia/Kolkata",
    "days": ["mon", "tue", "wed", "thu", "fri", "sat"],
    "window": "16:00-20:00"
  },
  "contact": {
    "whatsapp": "+91XXXXXXXXXX",
    "email": "[business email]"
  },
  "trial": {
    "available": true,
    "duration_minutes": 60,
    "fee_paise": 0,
    "currency": "INR"
  },
  "policies": {
    "refund": "See /policies/cancellation-refund.md",
    "cancellation": "Trials: up to 4 hours before start. Paid plans: see policy.",
    "privacy_url": "https://[your-domain]/privacy"
  }
}
```

### content/subjects.json
```json
{
  "version": "1.0.0",
  "board": "CBSE",
  "class": 10,
  "subjects": [
    { "id": "maths", "board": "CBSE", "class": 10, "name": "Mathematics" },
    { "id": "science", "board": "CBSE", "class": 10, "name": "Science" },
    { "id": "social_science", "board": "CBSE", "class": 10, "name": "Social Science" },
    { "id": "english", "board": "CBSE", "class": 10, "name": "English" },
    { "id": "hindi", "board": "CBSE", "class": 10, "name": "Hindi" }
  ]
}
```

### content/plans.json
```json
{
  "version": "1.0.0",
  "last_updated": "2026-10-29T00:00:00+05:30",
  "plans": [
    {
      "id": "monthly-all",
      "name": "Monthly, all subjects",
      "type": "monthly",
      "price_paise": 0,
      "currency": "INR",
      "subjects": ["maths", "science", "social_science", "english", "hindi"],
      "sessions_per_week": 3,
      "session_minutes": 60,
      "cancellation": "See /policies/cancellation-refund.md"
    },
    {
      "id": "crash-60",
      "name": "Final 60-day crash course",
      "type": "crash_course",
      "price_paise": 0,
      "currency": "INR",
      "subjects": ["maths", "science", "social_science", "english", "hindi"],
      "duration_days": 60,
      "session_minutes": 60,
      "cancellation": "See /policies/cancellation-refund.md"
    }
  ]
}
```

Replace the `0` prices with amounts in paise (for example, ₹4,000 = `400000`).

---

## 10. Acceptance and Build Order

**Definition of done for v0.1.0:**
- All JSON files validate against their schemas (use `ajv` or `check-jsonschema`).
- `openapi.yaml` passes Spectral lint and the OpenAPI 3.1 validator.
- Every Gherkin scenario has a passing test before the endpoint is considered complete.
- `llms.txt` links resolve, and every fact in the site matches `/content`.
- GBP fields match `provider.json` exactly.

**Build order:**
1. Validate the models and content files.
2. Build read endpoints (`/provider`, `/subjects`, `/plans`) and their tests.
3. Build `/slots` and holds, with the hold-expiry job.
4. Build the consent flow, including the OTP lockout and token expiry.
5. Build booking, cancellation, and idempotency.
6. Build enquiries.
7. Build the MCP server from `mcp/tools.json`, and test it with an MCP client.
8. Publish `llms.txt`, register the API and MCP server in directories, and submit the sitemap.

---

## 11. Open Items for You

1. Real service localities and their codes.
2. Qualifications and years of experience.
3. Plan prices in paise (or confirm free until launch).
4. Consent channel: WhatsApp with SMS fallback, as proposed, or a change.
5. Whether to allow online teaching in addition to home visits.
6. Tech stack, if you want the code generated in a specific language.

Send me these six items and I'll replace every placeholder and return the finished files.