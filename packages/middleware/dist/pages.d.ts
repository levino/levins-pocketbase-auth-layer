import type { LoginPageConfig, NotAuthorizedPageConfig } from "./types.js";
/**
 * Generate a login page HTML string
 *
 * This creates a standalone login page with OAuth buttons that work with PocketBase.
 * The page is self-contained and includes all necessary JavaScript.
 *
 * @param config - Login page configuration
 * @returns HTML string for the login page
 */
export declare function generateLoginPageHtml(config: LoginPageConfig): string;
/**
 * Generate a "not authorized" page HTML string
 *
 * @param config - Page configuration
 * @returns HTML string for the not authorized page
 */
export declare function generateNotAuthorizedPageHtml(config: NotAuthorizedPageConfig): string;
/**
 * Create a Response with the login page
 */
export declare function loginPageResponse(config: LoginPageConfig): Response;
/**
 * Create a Response with the not authorized page
 */
export declare function notAuthorizedPageResponse(config: NotAuthorizedPageConfig): Response;
//# sourceMappingURL=pages.d.ts.map