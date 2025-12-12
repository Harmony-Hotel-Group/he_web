// src/utils/cookies.ts

/**
 * Opciones para configurar una cookie.
 */
interface CookieOptions {
	/** Número de días hasta que la cookie expire. */
	days?: number;
	/** La ruta para la cual la cookie es válida. Por defecto es '/'. */
	path?: string;
	/** El dominio para el cual la cookie es válida. */
	domain?: string;
	/** Si la cookie solo debe ser transmitida sobre una conexión segura (HTTPS). */
	secure?: boolean;
	/** Controla si una cookie se envía con solicitudes de sitios cruzados. */
	sameSite?: "Strict" | "Lax" | "None";
}

/**
 * Establece (crea o sobrescribe) una cookie en el navegador.
 * Esta función solo se ejecuta en el lado del cliente.
 *
 * @param name - El nombre de la cookie.
 * @param value - El valor de la cookie.
 * @param options - Opciones adicionales para la cookie (days, path, etc.).
 */
export function setCookie(
	name: string,
	value: string,
	options: CookieOptions = {},
): void {
	if (typeof document === "undefined") {
		// No hacer nada si no estamos en el navegador
		return;
	}

	let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

	// Días de expiración
	if (options.days) {
		const date = new Date();
		date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000);
		cookieString += `; expires=${date.toUTCString()}`;
	}

	// Ruta
	const path = options.path || "/";
	cookieString += `; path=${path}`;

	// Dominio
	if (options.domain) {
		cookieString += `; domain=${options.domain}`;
	}

	// SameSite
	if (options.sameSite) {
		cookieString += `; samesite=${options.sameSite}`;
	}

	// Secure
	if (options.secure) {
		cookieString += `; secure`;
	}

	document.cookie = cookieString;
}

/**
 * Obtiene el valor de una cookie por su nombre.
 * Esta función solo se ejecuta en el lado del cliente.
 *
 * @param name - El nombre de la cookie a recuperar.
 * @returns El valor de la cookie o undefined si no se encuentra.
 */
export function getCookie(name: string): string | undefined {
	if (typeof document === "undefined") {
		return undefined;
	}

	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${encodeURIComponent(name)}=`);

	if (parts.length === 2) {
		return decodeURIComponent(parts.pop()?.split(";").shift() || "");
	}

	return undefined;
}

/**
 * Elimina una cookie estableciendo su fecha de expiración en el pasado.
 *
 * @param name - El nombre de la cookie a eliminar.
 */
export function deleteCookie(name: string): void {
	// Para eliminar una cookie, la establecemos con una fecha de expiración pasada.
	setCookie(name, "", { days: -1 });
}