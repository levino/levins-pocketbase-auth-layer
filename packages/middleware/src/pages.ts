import type { LoginPageConfig, NotAuthorizedPageConfig } from "./types.js";
import { htmlResponse } from "./utils.js";

/**
 * Generate a login page HTML string
 *
 * This creates a standalone login page with OAuth buttons that work with PocketBase.
 * The page is self-contained and includes all necessary JavaScript.
 *
 * @param config - Login page configuration
 * @returns HTML string for the login page
 */
export function generateLoginPageHtml(config: LoginPageConfig): string {
  const {
    pocketbaseUrl,
    pocketbaseUrlMicrosoft,
    title = "Login",
    cssUrl,
    providers = ["github", "google", "microsoft"],
    cookieEndpoint = "/api/cookie",
    redirectUrl = "/",
  } = config;

  const cssLink = cssUrl
    ? `<link rel="stylesheet" href="${cssUrl}">`
    : `<style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
      .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 400px; width: 100%; }
      h1 { margin-bottom: 1.5rem; text-align: center; color: #333; }
      .btn { display: block; width: 100%; padding: 0.75rem 1rem; margin-bottom: 0.75rem; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; text-align: center; text-decoration: none; transition: opacity 0.2s; }
      .btn:hover { opacity: 0.9; }
      .btn-github { background: #24292e; color: white; }
      .btn-google { background: #4285f4; color: white; }
      .btn-microsoft { background: #00a4ef; color: white; }
      .error { color: #dc3545; margin-top: 1rem; text-align: center; display: none; }
    </style>`;

  const providerButtons = providers
    .map((provider) => {
      const label =
        provider === "github"
          ? "GitHub"
          : provider === "google"
            ? "Google"
            : "Microsoft";
      return `<button class="btn btn-${provider}" onclick="login('${provider}')">${label}</button>`;
    })
    .join("\n      ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${cssLink}
  <script src="https://cdn.jsdelivr.net/npm/pocketbase@0.26.0/dist/pocketbase.umd.min.js"></script>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <div id="buttons">
      ${providerButtons}
    </div>
    <div id="error" class="error"></div>
  </div>

  <script>
    const pocketbaseUrl = ${JSON.stringify(pocketbaseUrl)};
    const pocketbaseUrlMicrosoft = ${JSON.stringify(pocketbaseUrlMicrosoft || pocketbaseUrl)};
    const cookieEndpoint = ${JSON.stringify(cookieEndpoint)};
    const redirectUrl = ${JSON.stringify(redirectUrl)};

    async function login(provider) {
      try {
        const pbUrl = provider === 'microsoft' ? pocketbaseUrlMicrosoft : pocketbaseUrl;
        const pb = new PocketBase(pbUrl);

        const authData = await pb.collection('users').authWithOAuth2({ provider });

        const response = await fetch(cookieEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: pb.authStore.token }),
        });

        if (response.ok) {
          window.location.href = redirectUrl;
        } else {
          throw new Error('Failed to set cookie');
        }
      } catch (error) {
        const errorEl = document.getElementById('error');
        errorEl.textContent = 'Login failed: ' + (error.message || 'Unknown error');
        errorEl.style.display = 'block';
      }
    }
  </script>
</body>
</html>`;
}

/**
 * Generate a "not authorized" page HTML string
 *
 * @param config - Page configuration
 * @returns HTML string for the not authorized page
 */
export function generateNotAuthorizedPageHtml(
  config: NotAuthorizedPageConfig
): string {
  const {
    userEmail,
    requestAccessEmail,
    title = "Access Denied",
    message = "You are logged in but do not have access to this resource.",
    cssUrl,
    logoutEndpoint = "/api/logout",
  } = config;

  const cssLink = cssUrl
    ? `<link rel="stylesheet" href="${cssUrl}">`
    : `<style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: system-ui, -apple-system, sans-serif; background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
      .container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; width: 100%; text-align: center; }
      h1 { margin-bottom: 1rem; color: #dc3545; }
      p { margin-bottom: 1rem; color: #666; }
      .email { font-weight: bold; color: #333; }
      .btn { display: inline-block; padding: 0.75rem 1.5rem; margin: 0.5rem; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; text-decoration: none; transition: opacity 0.2s; }
      .btn:hover { opacity: 0.9; }
      .btn-primary { background: #007bff; color: white; }
      .btn-secondary { background: #6c757d; color: white; }
    </style>`;

  const requestAccessButton = requestAccessEmail
    ? `<a href="mailto:${requestAccessEmail}?subject=Access%20Request&body=Please%20grant%20access%20to%20${encodeURIComponent(userEmail)}" class="btn btn-primary">Request Access</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${cssLink}
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>${message}</p>
    <p>Logged in as: <span class="email">${userEmail}</span></p>
    <div>
      ${requestAccessButton}
      <form action="${logoutEndpoint}" method="POST" style="display: inline;">
        <button type="submit" class="btn btn-secondary">Logout</button>
      </form>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Create a Response with the login page
 */
export function loginPageResponse(config: LoginPageConfig): Response {
  return htmlResponse(generateLoginPageHtml(config));
}

/**
 * Create a Response with the not authorized page
 */
export function notAuthorizedPageResponse(
  config: NotAuthorizedPageConfig
): Response {
  return htmlResponse(generateNotAuthorizedPageHtml(config), 403);
}
