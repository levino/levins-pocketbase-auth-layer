import path from "node:path";
import cookieParser from "cookie-parser";
import express, { type Request, type Response, type NextFunction } from "express";
import hbs from "hbs";
import PocketBase from "pocketbase";

const __dirname = import.meta.dirname;

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
	/** Optional: Path to views directory (defaults to package's views) */
	viewsPath?: string;
}

/**
 * Express middleware that handles the /api/cookie endpoint
 * Converts OAuth token to HTTP-only cookie
 */
export function createCookieHandler(pocketbaseUrl: string) {
	return async (req: Request, res: Response) => {
		const pb = new PocketBase(pocketbaseUrl);
		try {
			const { token } = req.body;

			if (!token) {
				return res.status(400).send("Auth token is missing");
			}

			pb.authStore.save(token);
			const authCookie = pb.authStore.exportToCookie({ sameSite: "None" });

			res.setHeader("Set-Cookie", authCookie);
			res.status(200).json({});
		} catch (_error) {
			res.status(500).send("Internal server error");
		}
	};
}

/**
 * Express middleware that handles the /api/logout endpoint
 * Clears the auth cookie and redirects to home
 */
export function createLogoutHandler(redirectUrl = "/") {
	return (_req: Request, res: Response) => {
		res.setHeader(
			"Set-Cookie",
			"pb_auth=; Path=/; HttpOnly; SameSite=None; Secure; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
		);
		res.redirect(redirectUrl);
	};
}

/**
 * Express middleware that checks PocketBase authentication and group membership
 */
export function createAuthMiddleware(options: PocketBaseAuthOptions) {
	const { pocketbaseUrl, pocketbaseUrlMicrosoft, groupField } = options;

	return async (req: Request, res: Response, next: NextFunction) => {
		const pb = new PocketBase(pocketbaseUrl);
		const cookie = req.headers.cookie;

		if (!cookie) {
			return res.status(401).render("login", {
				pocketbaseUrl,
				pocketbaseUrlMicrosoft: pocketbaseUrlMicrosoft || pocketbaseUrl,
			});
		}

		pb.authStore.loadFromCookie(cookie);

		try {
			await pb.collection("users").authRefresh();
			const groups = await pb
				.collection("groups")
				.getFirstListItem(`user_id="${pb.authStore.record.id}"`);
			if (groups[groupField]) {
				return next();
			}
			return res.status(401).render("not_a_member", {
				userEmail: pb.authStore.record.email,
				groupName: groupField,
				pocketbaseUrl,
			});
		} catch (_error) {
			return res.status(401).render("login", {
				pocketbaseUrl,
				pocketbaseUrlMicrosoft: pocketbaseUrlMicrosoft || pocketbaseUrl,
			});
		}
	};
}

/**
 * Creates a complete Express app with PocketBase authentication
 * Uses environment variables for configuration
 */
export function createApp() {
	return express()
		.use(cookieParser())
		.use("/public", express.static(path.join(__dirname, "/build/public")))
		.use("/api", express.json())
		.post("/api/cookie", createCookieHandler(process.env.POCKETBASE_URL))
		.post("/api/logout", createLogoutHandler("/"))
		.set("view engine", "html")
		.engine("html", hbs.__express)
		.set("views", path.join(process.cwd(), "views"))
		.use(
			createAuthMiddleware({
				pocketbaseUrl: process.env.POCKETBASE_URL,
				pocketbaseUrlMicrosoft: process.env.POCKETBASE_URL_MICROSOFT,
				groupField: process.env.POCKETBASE_GROUP,
			}),
		)
		.use(express.static(path.join(__dirname, "/build")));
}

/**
 * Creates an Express app with custom configuration
 * Useful when you want to provide your own configuration instead of using env vars
 */
export function createConfiguredApp(options: PocketBaseAuthOptions) {
	const { pocketbaseUrl, pocketbaseUrlMicrosoft, groupField, viewsPath } = options;

	return express()
		.use(cookieParser())
		.use("/public", express.static(path.join(__dirname, "/build/public")))
		.use("/api", express.json())
		.post("/api/cookie", createCookieHandler(pocketbaseUrl))
		.post("/api/logout", createLogoutHandler("/"))
		.set("view engine", "html")
		.engine("html", hbs.__express)
		.set("views", viewsPath || path.join(__dirname, "views"))
		.use(
			createAuthMiddleware({
				pocketbaseUrl,
				pocketbaseUrlMicrosoft,
				groupField,
			}),
		)
		.use(express.static(path.join(__dirname, "/build")));
}
