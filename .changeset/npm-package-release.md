---
"@levino/pocketbase-auth": minor
---

Prepare package for npm publishing alongside Docker release.

- Rename package to `@levino/pocketbase-auth`
- Export reusable middleware functions: `createCookieHandler`, `createLogoutHandler`, `createAuthMiddleware`
- Add `createConfiguredApp` for programmatic configuration
- Add TypeScript interface `PocketBaseAuthOptions`
- Include views directory in npm package
