import { handleAuthRequest } from "@levino/pocketbase-auth";

export const onRequest = async (context) => {
	const { request, env, next } = context;

	const options = {
		pocketbaseUrl: env.POCKETBASE_URL,
		pocketbaseUrlMicrosoft: env.POCKETBASE_URL_MICROSOFT,
		groupField: env.POCKETBASE_GROUP,
	};

	const authResponse = await handleAuthRequest(request, options);

	if (authResponse) {
		return authResponse;
	}

	return next();
};
