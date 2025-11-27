import type { PocketBaseAuthConfig, AuthResult, CookieHandlerOptions, LogoutHandlerOptions } from "./types.js";
/**
 * Verify authentication and authorization from a request
 *
 * This is a pure function that checks if the request has a valid auth cookie
 * and if the user belongs to the required group.
 *
 * @param request - The incoming request
 * @param config - Configuration options
 * @returns AuthResult with authentication and authorization status
 */
export declare function verifyAuth(request: Request, config: Pick<PocketBaseAuthConfig, "pocketbaseUrl" | "groupField" | "cookieName">): Promise<AuthResult>;
/**
 * Handle the cookie endpoint - converts OAuth token to HTTP-only cookie
 *
 * This handler should be used for POST requests to your cookie endpoint
 * (typically /api/cookie)
 *
 * @param request - The incoming POST request with token in body
 * @param options - Configuration options
 * @returns Response with Set-Cookie header
 */
export declare function handleCookieEndpoint(request: Request, options: CookieHandlerOptions): Promise<Response>;
/**
 * Handle the logout endpoint - clears the auth cookie and redirects
 *
 * @param request - The incoming request
 * @param options - Configuration options
 * @returns Response with cleared cookie and redirect
 */
export declare function handleLogoutEndpoint(_request: Request, options?: LogoutHandlerOptions): Response;
/**
 * Create a middleware function that protects routes with PocketBase authentication
 *
 * This is the main middleware factory that creates a handler for protecting routes.
 * It's designed to work with Cloudflare Pages/Workers and other edge runtimes.
 *
 * @param config - Configuration options
 * @returns A middleware function that can be used to protect routes
 *
 * @example
 * ```typescript
 * import { createAuthMiddleware } from '@levino/pocketbase-auth-middleware';
 *
 * const authMiddleware = createAuthMiddleware({
 *   pocketbaseUrl: 'https://your-pocketbase.com',
 *   groupField: 'members',
 *   onLoginRequired: () => new Response('Please login', { status: 401 }),
 *   onNotAuthorized: (req, user) => new Response('Access denied', { status: 403 }),
 * });
 *
 * // In Cloudflare Pages
 * export const onRequest = async (context) => {
 *   const authResult = await authMiddleware(context.request);
 *   if (authResult) return authResult; // Return if auth failed
 *   return context.next(); // Continue to the page
 * };
 * ```
 */
export declare function createAuthMiddleware(config: PocketBaseAuthConfig): (request: Request) => Promise<Response | null>;
//# sourceMappingURL=middleware.d.ts.map