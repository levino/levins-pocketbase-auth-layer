import PocketBase from "pocketbase";

/**
 * Configuration options for the PocketBase auth middleware
 */
export interface PocketBaseAuthOptions {
	/** URL of the PocketBase instance */
	pocketbaseUrl: string;
	/** Optional: Separate PocketBase URL for Microsoft OAuth */
	pocketbaseUrlMicrosoft?: string;
	/** Name of the group field to check for authorization */
	groupField: string;
}

/**
 * Result of authentication verification
 */
export interface AuthResult {
	isAuthenticated: boolean;
	isAuthorized: boolean;
	user?: { id: string; email: string };
	error?: string;
}

// --- Utility functions ---

function parseCookies(cookieHeader: string | null): Record<string, string> {
	if (!cookieHeader) return {};
	return cookieHeader.split(";").reduce(
		(cookies, cookie) => {
			const [name, ...rest] = cookie.trim().split("=");
			if (name) {
				cookies[name] = decodeURIComponent(rest.join("="));
			}
			return cookies;
		},
		{} as Record<string, string>,
	);
}

function getCookie(request: Request, name: string): string | undefined {
	const cookieHeader = request.headers.get("Cookie");
	const cookies = parseCookies(cookieHeader);
	return cookies[name];
}

function jsonResponse(
	data: unknown,
	status = 200,
	headers: Record<string, string> = {},
): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json", ...headers },
	});
}

function htmlResponse(
	html: string,
	status = 200,
	headers: Record<string, string> = {},
): Response {
	return new Response(html, {
		status,
		headers: { "Content-Type": "text/html; charset=utf-8", ...headers },
	});
}

function redirectResponse(
	url: string,
	headers: Record<string, string> = {},
): Response {
	return new Response(null, {
		status: 302,
		headers: { Location: url, ...headers },
	});
}

// --- HTML Page Generators ---

export function generateLoginPageHtml(
	pocketbaseUrl: string,
	pocketbaseUrlMicrosoft?: string,
): string {
	const pbUrlMicrosoft = pocketbaseUrlMicrosoft || pocketbaseUrl;
	return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Einloggen</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/infima@0.2.0-alpha.45/dist/css/default/default.min.css" />
  <style>
    .stack-vertically {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }
  </style>
</head>
<body>
<div class="container padding-top--lg">
  <h1>Bitte einloggen</h1>
  <p>Bitte logge Dich ein, um die Inhalte zu sehen.</p>
  <div class="stack-vertically padding-bottom--md">
    <button type="button" class="button button--primary" id="loginWithGithub">Login mit GitHub</button>
    <button type="button" class="button button--primary" id="loginWithGoogle">Login mit Google</button>
    <button type="button" class="button button--primary" id="loginWithMicrosoft">Login mit Microsoft</button>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/pocketbase@0.26.0/dist/pocketbase.umd.min.js"></script>
<script>
  const pb = new PocketBase("${pocketbaseUrl}");
  const pbMicrosoft = new PocketBase("${pbUrlMicrosoft}");

  const saveTokenAndReload = (token) =>
    fetch('/api/cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(() => window.location.reload());

  document.getElementById('loginWithGithub').addEventListener('click', () =>
    pb.collection('users').authWithOAuth2({ provider: 'github' }).then(() => saveTokenAndReload(pb.authStore.token)));
  document.getElementById('loginWithGoogle').addEventListener('click', () =>
    pb.collection('users').authWithOAuth2({ provider: 'google' }).then(() => saveTokenAndReload(pb.authStore.token)));
  document.getElementById('loginWithMicrosoft').addEventListener('click', () =>
    pbMicrosoft.collection('users').authWithOAuth2({ provider: 'microsoft' }).then(() => saveTokenAndReload(pbMicrosoft.authStore.token)));
</script>
</body>
</html>`;
}

export function generateNotAMemberPageHtml(
	userEmail: string,
	groupName: string,
	pocketbaseUrl: string,
): string {
	return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Keine Berechtigung</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/infima@0.2.0-alpha.45/dist/css/default/default.min.css" />
</head>
<body>
  <div class="container padding-top--lg">
    <div class="alert alert--warning">
      <h3>Du bist eingeloggt, aber noch kein Mitglied</h3>
      <p>Du bist mit der E-Mail-Adresse <strong>${userEmail}</strong> angemeldet.</p>
      <p>Bitte kontaktiere Levin, damit er deinen Account freischaltet.</p>
      <div class="padding-top--md">
        <button type="button" class="button button--primary" id="sendEmailButton">E-Mail an Levin senden</button>
      </div>
      <div class="padding-top--lg">
        <p>Mit dem falschen Account eingeloggt?</p>
        <form method="post" action="/api/logout">
          <button type="submit" class="button button--secondary">Ausloggen</button>
        </form>
      </div>
    </div>
  </div>
  <script>
    document.getElementById('sendEmailButton').addEventListener('click', () => {
      const subject = 'Aufnahme in die Gruppe "${groupName}"';
      const body = 'Hallo Levin,\\n\\nhier ist [BITTE NAMEN EINTRAGEN], ich habe mich gerade mit der E-Mail ${userEmail} registriert und möchte gerne in die Gruppe "${groupName}" aufgenommen werden.\\n\\nPocketBase URL: ${pocketbaseUrl}\\n\\nVielen Dank!\\n\\n[DEIN NAME]';
      window.open('mailto:post@levinkeller.de?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body), '_blank');
    });
  </script>
</body>
</html>`;
}

// --- Core Auth Functions ---

/**
 * Verify authentication from a request
 */
export async function verifyAuth(
	request: Request,
	options: PocketBaseAuthOptions,
): Promise<AuthResult> {
	const { pocketbaseUrl, groupField } = options;
	const pb = new PocketBase(pocketbaseUrl);
	const cookie = request.headers.get("Cookie");

	if (!cookie) {
		return { isAuthenticated: false, isAuthorized: false, error: "No cookie" };
	}

	pb.authStore.loadFromCookie(cookie);

	if (!pb.authStore.isValid) {
		return {
			isAuthenticated: false,
			isAuthorized: false,
			error: "Invalid cookie",
		};
	}

	try {
		await pb.collection("users").authRefresh();
	} catch {
		return {
			isAuthenticated: false,
			isAuthorized: false,
			error: "Auth refresh failed",
		};
	}

	const user = pb.authStore.record;
	if (!user) {
		return {
			isAuthenticated: false,
			isAuthorized: false,
			error: "No user record",
		};
	}

	try {
		const groups = await pb
			.collection("groups")
			.getFirstListItem(`user_id="${user.id}"`);

		if (groups[groupField]) {
			return {
				isAuthenticated: true,
				isAuthorized: true,
				user: { id: user.id, email: user.email },
			};
		}

		return {
			isAuthenticated: true,
			isAuthorized: false,
			user: { id: user.id, email: user.email },
			error: "Not in required group",
		};
	} catch {
		return {
			isAuthenticated: true,
			isAuthorized: false,
			user: { id: user.id, email: user.email },
			error: "Group check failed",
		};
	}
}

/**
 * Handle POST /api/cookie - converts OAuth token to HTTP-only cookie
 */
export async function handleCookieRequest(
	request: Request,
	pocketbaseUrl: string,
): Promise<Response> {
	if (request.method !== "POST") {
		return jsonResponse({ error: "Method not allowed" }, 405);
	}

	let body: { token?: string };
	try {
		body = (await request.json()) as { token?: string };
	} catch {
		return jsonResponse({ error: "Invalid JSON" }, 400);
	}

	const { token } = body;
	if (!token) {
		return jsonResponse({ error: "Token required" }, 400);
	}

	const pb = new PocketBase(pocketbaseUrl);
	pb.authStore.save(token);
	const authCookie = pb.authStore.exportToCookie({ sameSite: "None" });

	return jsonResponse({ success: true }, 200, { "Set-Cookie": authCookie });
}

/**
 * Handle POST /api/logout - clears cookie and redirects
 */
export function handleLogoutRequest(redirectUrl = "/"): Response {
	return redirectResponse(redirectUrl, {
		"Set-Cookie":
			"pb_auth=; Path=/; HttpOnly; SameSite=None; Secure; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
	});
}

/**
 * Create auth middleware for edge runtimes (Cloudflare Pages, etc.)
 *
 * Returns null if authenticated and authorized, otherwise returns a Response
 */
export function createAuthMiddleware(options: PocketBaseAuthOptions) {
	const { pocketbaseUrl, pocketbaseUrlMicrosoft, groupField } = options;

	return async (request: Request): Promise<Response | null> => {
		const result = await verifyAuth(request, options);

		if (!result.isAuthenticated) {
			return htmlResponse(
				generateLoginPageHtml(pocketbaseUrl, pocketbaseUrlMicrosoft),
				401,
			);
		}

		if (!result.isAuthorized && result.user) {
			return htmlResponse(
				generateNotAMemberPageHtml(result.user.email, groupField, pocketbaseUrl),
				403,
			);
		}

		return null; // Proceed with request
	};
}

/**
 * Handle all auth-related requests
 *
 * Use this as a catch-all handler in your edge function
 */
export async function handleAuthRequest(
	request: Request,
	options: PocketBaseAuthOptions,
): Promise<Response | null> {
	const url = new URL(request.url);

	if (url.pathname === "/api/cookie" && request.method === "POST") {
		return handleCookieRequest(request, options.pocketbaseUrl);
	}

	if (url.pathname === "/api/logout" && request.method === "POST") {
		return handleLogoutRequest("/");
	}

	const authMiddleware = createAuthMiddleware(options);
	return authMiddleware(request);
}
