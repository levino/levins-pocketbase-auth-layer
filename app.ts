import path from "node:path";
import cookieParser from "cookie-parser";
import express, { type Request, type Response, type NextFunction } from "express";
import {
	handleCookieRequest,
	handleLogoutRequest,
	verifyAuth,
	generateLoginPageHtml,
	generateNotAMemberPageHtml,
	type PocketBaseAuthOptions,
} from "./index.ts";

const __dirname = import.meta.dirname;

/**
 * Bridge function to convert Express req to Web Request
 */
function toWebRequest(req: Request): globalThis.Request {
	const protocol = req.protocol;
	const host = req.get("host") || "localhost";
	const url = `${protocol}://${host}${req.originalUrl}`;

	const headers = new Headers();
	for (const [key, value] of Object.entries(req.headers)) {
		if (typeof value === "string") {
			headers.set(key, value);
		} else if (Array.isArray(value)) {
			headers.set(key, value.join(", "));
		}
	}

	return new globalThis.Request(url, {
		method: req.method,
		headers,
		body: req.method !== "GET" && req.method !== "HEAD" ? JSON.stringify(req.body) : undefined,
	});
}

/**
 * Bridge function to send Web Response via Express res
 */
async function sendWebResponse(webResponse: globalThis.Response, res: Response): Promise<void> {
	res.status(webResponse.status);

	webResponse.headers.forEach((value, key) => {
		res.setHeader(key, value);
	});

	const body = await webResponse.text();
	res.send(body);
}

/**
 * Creates the Express app for Docker deployment
 */
export function createApp() {
	const options: PocketBaseAuthOptions = {
		pocketbaseUrl: process.env.POCKETBASE_URL!,
		pocketbaseUrlMicrosoft: process.env.POCKETBASE_URL_MICROSOFT,
		groupField: process.env.POCKETBASE_GROUP!,
	};

	return express()
		.use(cookieParser())
		.use("/api", express.json())
		.post("/api/cookie", async (req: Request, res: Response) => {
			const webRequest = toWebRequest(req);
			const webResponse = await handleCookieRequest(webRequest, options.pocketbaseUrl);
			await sendWebResponse(webResponse, res);
		})
		.post("/api/logout", async (_req: Request, res: Response) => {
			const webResponse = handleLogoutRequest("/");
			await sendWebResponse(webResponse, res);
		})
		.use(async (req: Request, res: Response, next: NextFunction) => {
			const webRequest = toWebRequest(req);
			const result = await verifyAuth(webRequest, options);

			if (!result.isAuthenticated) {
				return res
					.status(401)
					.send(generateLoginPageHtml(options.pocketbaseUrl, options.pocketbaseUrlMicrosoft));
			}

			if (!result.isAuthorized && result.user) {
				return res
					.status(403)
					.send(
						generateNotAMemberPageHtml(
							result.user.email,
							options.groupField,
							options.pocketbaseUrl,
						),
					);
			}

			return next();
		})
		.use(express.static(path.join(__dirname, "/build")));
}

const app = createApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
