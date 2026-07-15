---
name: Clerk no-key crash
description: How to prevent the app from crashing when CLERK_PUBLISHABLE_KEY is not set in this Replit environment.
---

# Clerk no-key crash fix

## The rule
Never import `@clerk/expo` at the module top-level in files that run on first load (`_layout.tsx`, tab layout, auth layout). Use `require('@clerk/expo')` inside a conditional guarded by an `AUTH_ENABLED` flag.

## Why
`@clerk/expo` tries to register a native module (`ClerkExpo`) at import time. On web, this throws `Cannot find native module 'ClerkExpo'` when `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is an empty string, crashing the entire Expo app before any screen renders.

## How to apply
- `app/_layout.tsx` exports `AUTH_ENABLED = publishableKey.length > 0`.
- All Clerk usage is gated: `if (AUTH_ENABLED) { const { ClerkProvider } = require('@clerk/expo'); ... }`.
- Auth layout and tab layout both import `AUTH_ENABLED` and skip all Clerk code when false.
- This lets the full app UI run and be previewed without Clerk keys configured.
