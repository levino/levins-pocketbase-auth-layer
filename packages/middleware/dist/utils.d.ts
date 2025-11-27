import type { CookieOptions } from "./types.js";
/**
 * Parse cookies from a Cookie header string
 */
export declare function parseCookies(cookieHeader: string | null): Record<string, string>;
/**
 * Get a specific cookie value from a request
 */
export declare function getCookie(request: Request, name: string): string | undefined;
/**
 * Build a Set-Cookie header value
 */
export declare function buildCookieHeader(name: string, value: string, options?: CookieOptions): string;
/**
 * Build an expired cookie header for clearing a cookie
 */
export declare function buildExpiredCookieHeader(name: string, options?: CookieOptions): string;
/**
 * Create a JSON response with proper headers
 */
export declare function jsonResponse(data: unknown, status?: number, headers?: Record<string, string>): Response;
/**
 * Create an HTML response with proper headers
 */
export declare function htmlResponse(html: string, status?: number, headers?: Record<string, string>): Response;
/**
 * Create a redirect response
 */
export declare function redirectResponse(url: string, status?: number, headers?: Record<string, string>): Response;
//# sourceMappingURL=utils.d.ts.map