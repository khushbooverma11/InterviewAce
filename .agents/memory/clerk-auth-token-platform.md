---
name: Clerk auth token getter platform split
description: setAuthTokenGetter must only be set on native; web uses cookies
---

## Rule
Call `setAuthTokenGetter(() => getToken())` only when `Platform.OS !== 'web'`.

**Why:** On web, the browser automatically sends the Clerk session cookie with every same-origin request. The `clerkMiddleware` on Express reads it. Setting the token getter on web causes token-refresh races and can produce 401s (getToken() may return null during initial render before the session is hydrated).

**How to apply:** In `(tabs)/_layout.tsx`, guard the effect:
```typescript
const IS_NATIVE = Platform.OS !== 'web';
useEffect(() => {
  if (IS_NATIVE) {
    setAuthTokenGetter(() => getToken());
    return () => setAuthTokenGetter(null);
  }
}, [getToken]);
```
