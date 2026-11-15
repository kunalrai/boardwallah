# website

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.1. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Google sign-in

The website stays static. The browser obtains a Google ID token with Google Identity Services and the Hono API verifies it, then issues its own opaque session token.

1. Create an **OAuth 2.0 Web client** in Google Cloud Console and add `http://localhost:4321` (plus the production origin) as an authorised JavaScript origin.
2. Configure the environment:
   - API process: `GOOGLE_CLIENT_ID=<client id>`
   - Frontend build: `PUBLIC_GOOGLE_CLIENT_ID=<client id>` (also set `PUBLIC_API_URL` if the API is not on `http://localhost:8787`)
3. Open `/login/` on the site.

Without `GOOGLE_CLIENT_ID`, `POST /api/v1/auth/google` returns `503 auth_unavailable` and the login page shows a configuration notice.

Endpoints:

- `POST /api/v1/auth/google` — body `{ "credential": "<Google ID token>" }`, returns the user, a session token and its expiry.
- `GET /api/v1/auth/me` — requires `Authorization: Bearer <session token>`.
- `GET /api/v1/auth/me/bookings` — bookings linked to the signed-in account, newest first, including slot start and end.
- `POST /api/v1/auth/logout` — deletes the session.

A trial booking is linked to the account when `POST /api/v1/trial-bookings` includes a valid session token; otherwise it is created exactly as before and stays reachable only through its private booking link.

Sessions last 30 days, are stored as SHA-256 hashes in the `sessions` table, and the browser keeps the raw token in `localStorage`. No refresh tokens are requested; signing out only ends the local session.
