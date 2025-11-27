import type PocketBase from "pocketbase";
import type { RecordModel, AuthRecord } from "pocketbase";

/**
 * Configuration options for the PocketBase auth middleware
 */
export interface PocketBaseAuthConfig {
  /**
   * URL of the PocketBase instance
   */
  pocketbaseUrl: string;

  /**
   * Optional: Separate PocketBase URL for Microsoft OAuth
   * (useful when Microsoft requires a different redirect URL)
   */
  pocketbaseUrlMicrosoft?: string;

  /**
   * Name of the group field to check for authorization
   * This field should exist on the groups collection and be a boolean
   */
  groupField: string;

  /**
   * Optional: Name of the cookie used for authentication
   * @default "pb_auth"
   */
  cookieName?: string;

  /**
   * Optional: Cookie options for the auth cookie
   */
  cookieOptions?: CookieOptions;

  /**
   * Optional: Custom handler for rendering the login page
   * If not provided, returns a JSON response with isAuthenticated: false
   */
  onLoginRequired?: (request: Request) => Response | Promise<Response>;

  /**
   * Optional: Custom handler for when user is authenticated but not in the required group
   * If not provided, returns a JSON response with error details
   */
  onNotAuthorized?: (
    request: Request,
    user: AuthRecord
  ) => Response | Promise<Response>;

  /**
   * Optional: Custom handler for successful authentication
   * Receives the request, user, and a function to proceed with the original request
   */
  onAuthenticated?: (
    request: Request,
    user: AuthRecord,
    groups: RecordModel[]
  ) => Response | Promise<Response>;
}

/**
 * Cookie configuration options
 */
export interface CookieOptions {
  /**
   * Cookie path
   * @default "/"
   */
  path?: string;

  /**
   * Whether the cookie is HTTP only
   * @default true
   */
  httpOnly?: boolean;

  /**
   * SameSite attribute
   * @default "None"
   */
  sameSite?: "Strict" | "Lax" | "None";

  /**
   * Whether the cookie requires HTTPS
   * @default true
   */
  secure?: boolean;

  /**
   * Cookie domain (optional)
   */
  domain?: string;

  /**
   * Max age in seconds (optional)
   */
  maxAge?: number;
}

/**
 * Result of authentication verification
 */
export interface AuthResult {
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;

  /**
   * Whether the user is authorized (in the required group)
   */
  isAuthorized: boolean;

  /**
   * The authenticated user record (if authenticated)
   */
  user?: AuthRecord;

  /**
   * The groups the user belongs to (if authenticated)
   */
  groups?: RecordModel[];

  /**
   * The PocketBase client instance (if authenticated)
   */
  pb?: PocketBase;

  /**
   * Error message if authentication/authorization failed
   */
  error?: string;
}

/**
 * Options for the cookie handler
 */
export interface CookieHandlerOptions {
  /**
   * URL of the PocketBase instance
   */
  pocketbaseUrl: string;

  /**
   * Optional: Cookie options
   */
  cookieOptions?: CookieOptions;
}

/**
 * Options for the logout handler
 */
export interface LogoutHandlerOptions {
  /**
   * Optional: Cookie name to clear
   * @default "pb_auth"
   */
  cookieName?: string;

  /**
   * Optional: URL to redirect to after logout
   * @default "/"
   */
  redirectUrl?: string;

  /**
   * Optional: Cookie options (for setting the expired cookie)
   */
  cookieOptions?: CookieOptions;
}

/**
 * Login page configuration for generating HTML
 */
export interface LoginPageConfig {
  /**
   * URL of the PocketBase instance
   */
  pocketbaseUrl: string;

  /**
   * Optional: Separate PocketBase URL for Microsoft OAuth
   */
  pocketbaseUrlMicrosoft?: string;

  /**
   * Optional: Title for the login page
   * @default "Login"
   */
  title?: string;

  /**
   * Optional: Custom CSS URL to include
   */
  cssUrl?: string;

  /**
   * Optional: Array of OAuth providers to show
   * @default ["github", "google", "microsoft"]
   */
  providers?: ("github" | "google" | "microsoft")[];

  /**
   * Optional: URL to post the cookie to after OAuth
   * @default "/api/cookie"
   */
  cookieEndpoint?: string;

  /**
   * Optional: URL to redirect to after successful login
   * @default "/"
   */
  redirectUrl?: string;
}

/**
 * Not authorized page configuration
 */
export interface NotAuthorizedPageConfig {
  /**
   * User's email address
   */
  userEmail: string;

  /**
   * Optional: Email address to request access from
   */
  requestAccessEmail?: string;

  /**
   * Optional: Title for the page
   * @default "Access Denied"
   */
  title?: string;

  /**
   * Optional: Custom message to display
   */
  message?: string;

  /**
   * Optional: Custom CSS URL to include
   */
  cssUrl?: string;

  /**
   * Optional: URL for logout endpoint
   * @default "/api/logout"
   */
  logoutEndpoint?: string;
}
