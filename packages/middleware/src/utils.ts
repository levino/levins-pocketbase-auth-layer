import type { CookieOptions } from "./types.js";

/**
 * Parse cookies from a Cookie header string
 */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name) {
      cookies[name] = decodeURIComponent(rest.join("="));
    }
    return cookies;
  }, {} as Record<string, string>);
}

/**
 * Get a specific cookie value from a request
 */
export function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get("Cookie");
  const cookies = parseCookies(cookieHeader);
  return cookies[name];
}

/**
 * Build a Set-Cookie header value
 */
export function buildCookieHeader(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const {
    path = "/",
    httpOnly = true,
    sameSite = "None",
    secure = true,
    domain,
    maxAge,
  } = options;

  let cookie = `${name}=${encodeURIComponent(value)}`;

  cookie += `; Path=${path}`;

  if (httpOnly) {
    cookie += "; HttpOnly";
  }

  cookie += `; SameSite=${sameSite}`;

  if (secure) {
    cookie += "; Secure";
  }

  if (domain) {
    cookie += `; Domain=${domain}`;
  }

  if (maxAge !== undefined) {
    cookie += `; Max-Age=${maxAge}`;
  }

  return cookie;
}

/**
 * Build an expired cookie header for clearing a cookie
 */
export function buildExpiredCookieHeader(
  name: string,
  options: CookieOptions = {}
): string {
  const {
    path = "/",
    httpOnly = true,
    sameSite = "None",
    secure = true,
    domain,
  } = options;

  let cookie = `${name}=`;
  cookie += `; Path=${path}`;

  if (httpOnly) {
    cookie += "; HttpOnly";
  }

  cookie += `; SameSite=${sameSite}`;

  if (secure) {
    cookie += "; Secure";
  }

  if (domain) {
    cookie += `; Domain=${domain}`;
  }

  cookie += "; Expires=Thu, 01 Jan 1970 00:00:00 GMT";

  return cookie;
}

/**
 * Create a JSON response with proper headers
 */
export function jsonResponse(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * Create an HTML response with proper headers
 */
export function htmlResponse(
  html: string,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      ...headers,
    },
  });
}

/**
 * Create a redirect response
 */
export function redirectResponse(
  url: string,
  status = 302,
  headers: Record<string, string> = {}
): Response {
  return new Response(null, {
    status,
    headers: {
      Location: url,
      ...headers,
    },
  });
}
