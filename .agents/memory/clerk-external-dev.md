---
name: External Clerk in dev
description: User uses an external (non-Replit-managed) Clerk account; auth behavior in dev vs production.
---

# External Clerk Dev Behavior

**Rule:** This project uses an external Clerk account (not Replit-managed). The Clerk proxy middleware (`/api/__clerk`) is disabled when `NODE_ENV !== production`, so it is a no-op in dev.

**Why:** Clerk proxy only works for production Clerk instances. Dev instances use a different FAPI host (`clerk.accounts.dev`) that is unreachable from Replit's browser sandbox. Without the proxy, Clerk JS can't load from the CDN in the sandbox either.

**How to apply:**
- The preview will always show a Clerk loading spinner in dev — this is expected, not a bug.
- Auth (sign-in, sign-up, protected routes, token getter) will work correctly after deployment.
- Do NOT try to fix the spinner by setting `EXPO_PUBLIC_CLERK_PROXY_URL` — in dev mode the proxy is a no-op so Clerk asset requests fall through to `requireAuth` → 401.
- Do NOT remove `EXPO_PUBLIC_CLERK_PROXY_URL` to go CDN-direct — Replit sandbox can't resolve `clerk.accounts.dev`.
- If the user wants auth to work in preview, they need to migrate to Replit-managed Clerk.
