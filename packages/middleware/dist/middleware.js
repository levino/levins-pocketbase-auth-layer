import PocketBase from "pocketbase";
import { getCookie, buildExpiredCookieHeader, jsonResponse, redirectResponse, } from "./utils.js";
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
export async function verifyAuth(request, config) {
    const { pocketbaseUrl, groupField, cookieName = "pb_auth" } = config;
    const pb = new PocketBase(pocketbaseUrl);
    const authCookie = getCookie(request, cookieName);
    if (!authCookie) {
        return {
            isAuthenticated: false,
            isAuthorized: false,
            error: "No auth cookie found",
        };
    }
    // Load the cookie into PocketBase
    pb.authStore.loadFromCookie(`${cookieName}=${authCookie}`);
    if (!pb.authStore.isValid) {
        return {
            isAuthenticated: false,
            isAuthorized: false,
            error: "Invalid auth cookie",
        };
    }
    try {
        // Refresh the auth to ensure the token is still valid
        await pb.collection("users").authRefresh();
    }
    catch {
        return {
            isAuthenticated: false,
            isAuthorized: false,
            error: "Failed to refresh authentication",
        };
    }
    const user = pb.authStore.record;
    if (!user) {
        return {
            isAuthenticated: false,
            isAuthorized: false,
            error: "No user record found",
        };
    }
    // Check group membership
    try {
        const groups = await pb.collection("groups").getFullList({
            filter: `users.id ?= "${user.id}"`,
        });
        const isAuthorized = groups.some((group) => group[groupField] === true);
        return {
            isAuthenticated: true,
            isAuthorized,
            user,
            groups,
            pb,
            error: isAuthorized ? undefined : `User not in required group (${groupField})`,
        };
    }
    catch (error) {
        return {
            isAuthenticated: true,
            isAuthorized: false,
            user,
            pb,
            error: `Failed to check group membership: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
    }
}
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
export async function handleCookieEndpoint(request, options) {
    const { pocketbaseUrl, cookieOptions = {} } = options;
    if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed" }, 405);
    }
    let body;
    try {
        body = (await request.json());
    }
    catch {
        return jsonResponse({ error: "Invalid JSON body" }, 400);
    }
    const { token } = body;
    if (!token) {
        return jsonResponse({ error: "Token is required" }, 400);
    }
    const pb = new PocketBase(pocketbaseUrl);
    pb.authStore.save(token);
    // Use PocketBase's built-in cookie export
    const authCookie = pb.authStore.exportToCookie({
        sameSite: cookieOptions.sameSite || "None",
        secure: cookieOptions.secure !== false,
        httpOnly: cookieOptions.httpOnly !== false,
        path: cookieOptions.path || "/",
    });
    return jsonResponse({ success: true }, 200, { "Set-Cookie": authCookie });
}
/**
 * Handle the logout endpoint - clears the auth cookie and redirects
 *
 * @param request - The incoming request
 * @param options - Configuration options
 * @returns Response with cleared cookie and redirect
 */
export function handleLogoutEndpoint(_request, options = {}) {
    const { cookieName = "pb_auth", redirectUrl = "/", cookieOptions = {}, } = options;
    const expiredCookie = buildExpiredCookieHeader(cookieName, cookieOptions);
    return redirectResponse(redirectUrl, 302, {
        "Set-Cookie": expiredCookie,
    });
}
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
export function createAuthMiddleware(config) {
    const { pocketbaseUrl, groupField, cookieName = "pb_auth", onLoginRequired, onNotAuthorized, onAuthenticated, } = config;
    return async (request) => {
        const authResult = await verifyAuth(request, {
            pocketbaseUrl,
            groupField,
            cookieName,
        });
        if (!authResult.isAuthenticated) {
            if (onLoginRequired) {
                return onLoginRequired(request);
            }
            return jsonResponse({ error: "Authentication required", isAuthenticated: false }, 401);
        }
        if (!authResult.isAuthorized) {
            if (onNotAuthorized && authResult.user) {
                return onNotAuthorized(request, authResult.user);
            }
            return jsonResponse({
                error: authResult.error || "Not authorized",
                isAuthenticated: true,
                isAuthorized: false,
                userEmail: authResult.user?.email,
            }, 403);
        }
        // User is authenticated and authorized
        if (onAuthenticated && authResult.user && authResult.groups) {
            return onAuthenticated(request, authResult.user, authResult.groups);
        }
        // Return null to indicate the request should proceed
        return null;
    };
}
//# sourceMappingURL=middleware.js.map