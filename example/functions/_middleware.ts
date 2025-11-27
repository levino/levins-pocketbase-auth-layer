import {
	handleAuthRequest,
	type PocketBaseAuthOptions,
} from "@levino/pocketbase-auth";

interface Env {
	POCKETBASE_URL: string;
	POCKETBASE_URL_MICROSOFT?: string;
	POCKETBASE_GROUP: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const { request, env, next } = context;

	const options: PocketBaseAuthOptions = {
		pocketbaseUrl: env.POCKETBASE_URL,
		pocketbaseUrlMicrosoft: env.POCKETBASE_URL_MICROSOFT,
		groupField: env.POCKETBASE_GROUP,
	};

	// Handle auth-related requests and check authentication
	const authResponse = await handleAuthRequest(request, options);

	// If authResponse is not null, return it (login page, error, or API response)
	if (authResponse) {
		return authResponse;
	}

	// User is authenticated and authorized, proceed to the next handler
	return next();
};
