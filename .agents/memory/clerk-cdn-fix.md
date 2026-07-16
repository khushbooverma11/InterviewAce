---
name: Clerk CDN fix for Replit
description: External CDNs (npm.clerk.dev, cdn.jsdelivr.net) are unreachable from Replit sandbox; use Replit-managed Clerk instead of custom clerkJSUrl.
---

# Clerk CDN Fix for Replit

## Rule
Never set `clerkJSUrl` in `<ClerkProvider>` for Expo web on Replit. Use Replit-managed Clerk (`setupClerkWhitelabelAuth()`) so Metro bundles `@clerk/clerk-js` at build time instead of fetching it from an external CDN at runtime.

**Why:** Both `npm.clerk.dev` and `cdn.jsdelivr.net` are unreachable from Replit's sandbox (`ERR_NAME_NOT_RESOLVED`). A custom `clerkJSUrl` pointing to either causes Clerk to fail silently, hanging the app on a spinner forever.

**How to apply:** If the app hangs on spinner with `ERR_NAME_NOT_RESOLVED` in browser logs and Clerk is involved:
1. Call `setupClerkWhitelabelAuth()` to switch to Replit-managed Clerk.
2. Remove the `clerkJSUrl` prop from `<ClerkProvider>` in `_layout.tsx`.
3. Restart the Expo workflow.

The `AUTH_ENABLED` / `require('@clerk/expo')` guard pattern should stay — it prevents native module crashes on web when Clerk is not yet loaded.
