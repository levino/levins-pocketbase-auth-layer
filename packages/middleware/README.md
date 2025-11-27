# @levino/pocketbase-auth-middleware

A pure function middleware for PocketBase authentication, designed for Cloudflare Pages/Workers and other edge runtimes.

## Features

- Pure functions - no file system access required
- Works with Web Standard APIs (Request/Response)
- Compatible with Cloudflare Pages, Workers, Deno, and other edge runtimes
- Built-in OAuth login page generator
- Group-based authorization
- TypeScript-first with full type definitions

## Installation

```bash
npm install @levino/pocketbase-auth-middleware pocketbase
```

## Quick Start

### Cloudflare Pages

Create a `functions/_middleware.ts` file:

```typescript
import {
  createAuthMiddleware,
  handleCookieEndpoint,
  handleLogoutEndpoint,
  loginPageResponse,
  notAuthorizedPageResponse,
} from '@levino/pocketbase-auth-middleware';

const POCKETBASE_URL = 'https://your-pocketbase.com';
const GROUP_FIELD = 'members'; // The boolean field on your groups collection

export const onRequest: PagesFunction = async (context) => {
  const url = new URL(context.request.url);

  // Handle auth API endpoints
  if (url.pathname === '/api/cookie' && context.request.method === 'POST') {
    return handleCookieEndpoint(context.request, {
      pocketbaseUrl: POCKETBASE_URL,
    });
  }

  if (url.pathname === '/api/logout' && context.request.method === 'POST') {
    return handleLogoutEndpoint(context.request);
  }

  // Create auth middleware
  const authMiddleware = createAuthMiddleware({
    pocketbaseUrl: POCKETBASE_URL,
    groupField: GROUP_FIELD,
    onLoginRequired: () =>
      loginPageResponse({
        pocketbaseUrl: POCKETBASE_URL,
        providers: ['github', 'google'],
      }),
    onNotAuthorized: (_req, user) =>
      notAuthorizedPageResponse({
        userEmail: user.email || 'Unknown',
        requestAccessEmail: 'admin@example.com',
      }),
  });

  // Check authentication
  const authResponse = await authMiddleware(context.request);
  if (authResponse) return authResponse;

  // User is authenticated and authorized, proceed
  return context.next();
};
```

### Hono (Cloudflare Workers)

```typescript
import { Hono } from 'hono';
import {
  createAuthMiddleware,
  handleCookieEndpoint,
  handleLogoutEndpoint,
  loginPageResponse,
} from '@levino/pocketbase-auth-middleware';

const app = new Hono();

const POCKETBASE_URL = 'https://your-pocketbase.com';

// Auth endpoints
app.post('/api/cookie', (c) =>
  handleCookieEndpoint(c.req.raw, { pocketbaseUrl: POCKETBASE_URL })
);

app.post('/api/logout', (c) => handleLogoutEndpoint(c.req.raw));

// Protected routes
app.use('/*', async (c, next) => {
  const authMiddleware = createAuthMiddleware({
    pocketbaseUrl: POCKETBASE_URL,
    groupField: 'members',
    onLoginRequired: () =>
      loginPageResponse({ pocketbaseUrl: POCKETBASE_URL }),
  });

  const authResponse = await authMiddleware(c.req.raw);
  if (authResponse) return authResponse;

  await next();
});

export default app;
```

## API Reference

### `createAuthMiddleware(config)`

Creates a middleware function that checks authentication and authorization.

```typescript
const middleware = createAuthMiddleware({
  pocketbaseUrl: string;           // Required: PocketBase URL
  groupField: string;              // Required: Group field to check
  cookieName?: string;             // Optional: Cookie name (default: "pb_auth")
  onLoginRequired?: (req) => Response;    // Optional: Custom login handler
  onNotAuthorized?: (req, user) => Response;  // Optional: Custom unauthorized handler
  onAuthenticated?: (req, user, groups) => Response;  // Optional: Custom success handler
});

// Returns null if authenticated and authorized, or a Response if not
const response = await middleware(request);
```

### `verifyAuth(request, config)`

Low-level function to verify authentication without creating a middleware.

```typescript
const result = await verifyAuth(request, {
  pocketbaseUrl: 'https://your-pocketbase.com',
  groupField: 'members',
});

if (result.isAuthenticated && result.isAuthorized) {
  console.log('User:', result.user);
  console.log('Groups:', result.groups);
}
```

### `handleCookieEndpoint(request, options)`

Handles POST requests to convert OAuth tokens to HTTP-only cookies.

```typescript
// Expects POST body: { token: string }
const response = await handleCookieEndpoint(request, {
  pocketbaseUrl: 'https://your-pocketbase.com',
  cookieOptions: {
    sameSite: 'None',
    secure: true,
  },
});
```

### `handleLogoutEndpoint(request, options)`

Handles logout by clearing the auth cookie and redirecting.

```typescript
const response = handleLogoutEndpoint(request, {
  cookieName: 'pb_auth',
  redirectUrl: '/',
});
```

### `loginPageResponse(config)`

Generates a login page with OAuth buttons.

```typescript
const response = loginPageResponse({
  pocketbaseUrl: 'https://your-pocketbase.com',
  pocketbaseUrlMicrosoft: 'https://other-pb.com', // Optional: separate PB for Microsoft
  title: 'Login',
  providers: ['github', 'google', 'microsoft'],
  cookieEndpoint: '/api/cookie',
  redirectUrl: '/',
});
```

### `notAuthorizedPageResponse(config)`

Generates a page shown when user is authenticated but not authorized.

```typescript
const response = notAuthorizedPageResponse({
  userEmail: user.email,
  requestAccessEmail: 'admin@example.com',
  title: 'Access Denied',
  message: 'You do not have access to this resource.',
  logoutEndpoint: '/api/logout',
});
```

## PocketBase Setup

This middleware expects your PocketBase to have:

1. **Users collection** - The default `users` collection with OAuth providers configured
2. **Groups collection** - A collection named `groups` with:
   - A relation field `users` pointing to the users collection
   - A boolean field matching your `groupField` config (e.g., `members`)

### Example Groups Schema

```
groups:
  - name (text)
  - users (relation to users, multiple)
  - members (boolean) - set to true for groups that grant access
```

## Utility Functions

The package also exports utility functions for custom implementations:

```typescript
import {
  parseCookies,
  getCookie,
  buildCookieHeader,
  buildExpiredCookieHeader,
  jsonResponse,
  htmlResponse,
  redirectResponse,
} from '@levino/pocketbase-auth-middleware';
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type {
  PocketBaseAuthConfig,
  AuthResult,
  CookieOptions,
  LoginPageConfig,
  NotAuthorizedPageConfig,
} from '@levino/pocketbase-auth-middleware';
```

## License

MIT
