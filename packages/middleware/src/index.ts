/**
 * @levino/pocketbase-auth-middleware
 *
 * A pure function middleware for PocketBase authentication,
 * designed for Cloudflare Pages/Workers and other edge runtimes.
 *
 * @example
 * ```typescript
 * import {
 *   createAuthMiddleware,
 *   handleCookieEndpoint,
 *   handleLogoutEndpoint,
 *   loginPageResponse,
 * } from '@levino/pocketbase-auth-middleware';
 *
 * // Create the auth middleware
 * const authMiddleware = createAuthMiddleware({
 *   pocketbaseUrl: 'https://your-pocketbase.com',
 *   groupField: 'members',
 *   onLoginRequired: (req) => loginPageResponse({
 *     pocketbaseUrl: 'https://your-pocketbase.com',
 *   }),
 * });
 *
 * // Use in Cloudflare Pages
 * export const onRequest = async (context) => {
 *   const url = new URL(context.request.url);
 *
 *   // Handle auth endpoints
 *   if (url.pathname === '/api/cookie') {
 *     return handleCookieEndpoint(context.request, {
 *       pocketbaseUrl: 'https://your-pocketbase.com',
 *     });
 *   }
 *
 *   if (url.pathname === '/api/logout') {
 *     return handleLogoutEndpoint(context.request);
 *   }
 *
 *   // Check authentication
 *   const authResponse = await authMiddleware(context.request);
 *   if (authResponse) return authResponse;
 *
 *   return context.next();
 * };
 * ```
 */

// Core middleware functions
export {
  verifyAuth,
  handleCookieEndpoint,
  handleLogoutEndpoint,
  createAuthMiddleware,
} from "./middleware.js";

// Page generators
export {
  generateLoginPageHtml,
  generateNotAuthorizedPageHtml,
  loginPageResponse,
  notAuthorizedPageResponse,
} from "./pages.js";

// Utility functions
export {
  parseCookies,
  getCookie,
  buildCookieHeader,
  buildExpiredCookieHeader,
  jsonResponse,
  htmlResponse,
  redirectResponse,
} from "./utils.js";

// Types
export type {
  PocketBaseAuthConfig,
  CookieOptions,
  AuthResult,
  CookieHandlerOptions,
  LogoutHandlerOptions,
  LoginPageConfig,
  NotAuthorizedPageConfig,
} from "./types.js";
