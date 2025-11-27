---
"@levino/pocketbase-auth": minor
---

Refactor to pure functions for edge runtime compatibility (Cloudflare Pages/Workers).

- Export pure functions using Web Standard APIs (Request/Response)
- `handleAuthRequest` - all-in-one handler for auth endpoints
- `createAuthMiddleware` - middleware that returns Response or null
- `verifyAuth` - low-level auth verification
- `handleCookieRequest` - POST /api/cookie handler
- `handleLogoutRequest` - POST /api/logout handler
- `generateLoginPageHtml` / `generateNotAMemberPageHtml` - HTML generators

Express/Docker code moved to app.ts (not published to npm).
Only `pocketbase` is a runtime dependency.
