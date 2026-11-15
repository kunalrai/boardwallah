# Audit — 2026-11-15

Repo: boardwallah (`main`). Scope: Astro frontend, Bun/Hono API, spec, tests, deployment.

## Summary

Full audit of the Astro site + Bun/Hono API: what works, and what's missing before this can go live. Findings are evidence-based (`file:line`) and ordered by what will bite first.

**Verified while auditing:** `tsc --noEmit` clean, `astro build` succeeds, `bun test` = 27 pass / 21 fail (failures are pre-existing content/test drift, see §6).

---

## P0 — Launch blockers (user-visible today)

| # | Issue | Evidence |
|---|---|---|
| 1 | Homepage layout is unstyled: 10 CSS classes used but not defined (`provider-profile`, `profile-text`, `profile-details`, `detail-item`, `qualifications`, `subjects-grid`, `subjects-section`, `cta-banner`, `subtitle`, `label/value`) | `frontend/src/pages/index.astro:22-56` vs `frontend/src/styles/global.css` |
| 2 | Prices render as "0 INR" and the page prints the internal note "A price of 0 is a placeholder… must be confirmed before publishing" | `spec/content/plans.json` (`price_paise: 0`), `frontend/src/pages/plans.astro:50` |
| 3 | Placeholders shipped to users: `[business email]` (footer + `llms.txt`), `[Your trading name]` / `[business email]` (privacy policy), `https://[your-domain]` in every schema `$id`. Google OAuth verification will be rejected with these. | `spec/content/provider.json:29`, `spec/policies/privacy.md:3,20`, `models/*.json:3` |
| 4 | Server-side contact email is fake and there is no email sending anywhere (no SMTP/API integration) | `spec/content/provider.json:29`, `src/` |
| 5 | Tutor cannot see bookings or enquiries. Enquiries are stored but never notified (no notifier call in `createEnquiry`), and there is no admin page or endpoint | `src/services.ts:353-377`, `src/notifier.ts` |
| 6 | Production can silently break booking: without `WHATSAPP_TOKEN` production uses `NoopNotifier` → OTPs are never delivered, while `/health` still returns `ok` | `src/notifier.ts:86-88`, `src/app.ts:162` |

## P1 — Security & privacy

- **Rate limiting is bypassable.** `X-API-Key: anything` grants the higher "keyed" limit because `config.apiKeys` is never validated. The same spoofable value scopes idempotency. — `src/app.ts:82`, `src/config.ts:66`
- **PII duplicated in plaintext.** Cached responses in the `idempotency` table include the student display name / enquiry message that `bookings` and `enquiries` store encrypted, defeating `src/crypto.ts`. — `src/app.ts:142-147`, `src/store.ts:494`
- **`OTP_SECRET` has no production guard** (unlike `PII_ENCRYPTION_KEY`, which throws); it silently defaults to a public dev string. — `src/ids.ts:20`
- **Session token in `localStorage` with no CSP or security headers** (`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, HSTS) — any XSS becomes session theft. — `frontend/src/pages/login.astro`, `src/app.ts`
- **Policy promises unimplemented**: consent revocation by email (`spec/policies/consent.md:7`) has no endpoint; 12-month booking / 3-year consent retention has no deletion job; access/deletion within 7 days has no mechanism. Only `sessions` and `idempotency` are ever purged.
- **No request body size cap**; the in-memory rate-limit map (`rateBuckets`) grows unbounded per IP/API key. — `src/app.ts:51`
- **Booking id enumeration**: unknown id → 404, wrong token → 401. — `src/services.ts:320-327`

## P2 — Functional gaps

- No admin/tutor dashboard (bookings, enquiries, cancellations, utilisation).
- No consent revoke endpoint even though the status enum supports `revoked`.
- No reschedule (cancel only), no waitlist when no slots are open.
- No account management: delete account, export data, "sign out everywhere", session list.
- Booking management page shows the slot id, not date/time, so the parent cannot tell when the session is. — `frontend/src/pages/booking.astro:140`
- No payments (spec says manual — but nothing records a payment either).
- No email notifications or reminders.
- No frontend/e2e tests, no CI (no `.github`), no pagination on any list.

## P3 — SEO, accessibility, UX

- No JSON-LD (`LocalBusiness`/`EducationalOrganization` with localities and price range), no `og:image`, no `twitter:card`, no `apple-touch-icon`, no manifest.
- No 404 page (`frontend/public` has only two favicons) → Vercel's default.
- Homepage copy has no locality, price, or trial details — weak for "home tuition near me" queries.
- `sitemap.xml` includes `/booking/` (private) and omits `/login/`. — `frontend/src/pages/sitemap.xml.ts:16-26`
- `plans.astro` calls `loadContent()` three times. — `frontend/src/pages/plans.astro:7-8`
- Accessibility baseline is good (skip link, labels, `aria-live`), but no `aria-describedby`/`aria-invalid` wiring and no text fallback if the Google script is blocked.

## P4 — Ops & deployment

- No deploy config for the API (no Dockerfile / fly.toml / Procfile), no SQLite backup or vacuum job.
- **Frontend build is root-dependent**: `frontend/src/lib/paths.ts` walks up to find `spec/`, but `frontend/vercel.json` sets `outputDirectory: dist` + `installCommand: npm install`. With the Vercel root set to `frontend`, the build cannot see `spec/`; `npm install` also ignores `bun.lock`.
- Default env values are localhost (`PUBLIC_API_URL`, `SITE_ORIGIN`, `CORS_ORIGIN`) with no build-time guard — a missed var ships a site calling `localhost:8787`.
- Root script `"web:dev": "bun --cwd frontend/site run dev"` points at a nonexistent directory (`frontend/site`). — `package.json:14`
- Local Node is 18 but Astro 7 requires >= 22.23.4, so frontend dev/build fails on a default Node 18 install.
- No logging/error tracking beyond `console.error`; no graceful `SIGTERM` closing SQLite.

## P5 — Spec & test drift

- 21 of 48 tests fail because `spec/content/provider.json` uses `"Gaur City 2"` / `"VVIP Homes"` while tests and `spec.md` use `DL-NOIDA-07` / `DL-NOIDA-12`. `provider.json` also no longer validates against `models/provider.schema.json` (locality pattern).
- `spec.md` still declares the stack as Fastify/Prisma/PostgreSQL (actual: Bun/Hono/SQLite) and still lists placeholder localities, inverting the repo's "spec is the source of truth" principle.
- **`bun run spec:extract` is a footgun**: it regenerates `spec/` from `spec.md`, which would overwrite real content with placeholder values. — `scripts/extract-spec.ts`
- `models/` is a byte-identical duplicate of `spec/models/`.
- `spec/api/openapi.yaml` documents none of the new `/auth/*` endpoints or `auth_unavailable`, and declares an unenforced `ApiKey` scheme.

---

## Suggested first batch

1. Fill placeholders (email, trading name, domain, real prices) and add the missing homepage CSS.
2. Enforce `API_KEYS` (or drop `X-API-Key`) and stop storing decrypted PII in `idempotency`.
3. Add an admin view for bookings + enquiries.
4. Add retention / delete / consent-revoke endpoints to match the privacy policy.
5. Reconcile content vs tests and guard `spec:extract`.
