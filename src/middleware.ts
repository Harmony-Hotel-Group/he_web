import { defineMiddleware } from "astro:middleware";
import { logger } from "@/services/logger";

const log = logger("Middleware");

export const onRequest = defineMiddleware(async (context, next) => {
	const { request, url } = context;

	// Leer cookie de idioma
	const cookieHeader = request.headers.get("cookie");
	const langMatch = cookieHeader?.match(/lang=(\w+)/);
	const cookieLang = langMatch ? langMatch[1] : null;

	log.info("🟢 [MIDDLEWARE] URL:", url.pathname);
	log.info("🟢 [MIDDLEWARE] Cookie lang:", cookieLang);

	// Si la cookie es 'en' pero estamos en una ruta español (sin /en/)
	// Vercel ya hizo el rewrite, así que no hacemos nada más aquí

	return next();
});
