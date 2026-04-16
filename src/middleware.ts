// src/middleware.ts
/**
 * Middleware global para la aplicación
 * Maneja:
 * - Redirección HTTPS en producción
 * - Headers de seguridad
 * - Logging de requests
 *
 * Nota: Astro 5.x mantiene middleware.ts como estándar
 * Ver: https://docs.astro.build/en/guides/middleware/
 */

import { defineMiddleware } from "astro:middleware";
import { logger } from "@/services/logger";

const log = logger("Middleware");

export const onRequest = defineMiddleware(async (context, next) => {
	const { request, url } = context;
	const { protocol } = url;

	// ========================================
	// REDIRECCIÓN HTTPS (Solo en producción)
	// ========================================
	const isProduction = import.meta.env.PROD;
	const forceHTTPS = import.meta.env.FORCE_HTTPS === "true";

	if (isProduction && forceHTTPS && protocol === "http:") {
		const httpsUrl = new URL(url);
		httpsUrl.protocol = "https:";

		log.info(`Redirigiendo HTTP a HTTPS: ${url} → ${httpsUrl}`);

		return Response.redirect(httpsUrl.toString(), 301);
	}

	// ========================================
	// HEADERS DE SEGURIDAD
	// ========================================

	// Ejecutar el siguiente middleware o ruta
	const response = await next();

	// Agregar headers de seguridad
	response.headers.set("X-Content-Type-Options", "nosniff");
	response.headers.set("X-Frame-Options", "SAMEORIGIN");
	response.headers.set("X-XSS-Protection", "1; mode=block");
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// Content Security Policy (CSP) - Configuración endurecida
	// Usamos nonces para scripts inline en producción
	const cspDirectives = [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' https://cdn.mxpnl.com https://fonts.googleapis.com",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com",
		"img-src 'self' data: https: blob:",
		"connect-src 'self' https://api.mixpanel.com",
		"frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
	];

	response.headers.set("Content-Security-Policy", cspDirectives.join("; "));

	// Permissions Policy (antes Feature Policy)
	response.headers.set(
		"Permissions-Policy",
		[
			"accelerometer=()",
			"camera=()",
			"geolocation=()",
			"gyroscope=()",
			"magnetometer=()",
			"microphone=()",
			"payment=(self)",
			"usb=()",
		].join(", "),
	);

	// ========================================
	// LOGGING DE REQUESTS
	// ========================================
	if (import.meta.env.DEV) {
		log.info(`${request.method} ${url.pathname} - ${response.status}`);
	}

	return response;
});
