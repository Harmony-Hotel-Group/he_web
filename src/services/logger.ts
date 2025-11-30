/**
 * @file Logger para desarrollo con contexto precargado y colores
 *
 * Variables de Entorno:
 * - `LOG_ENABLED`: Si es 'false', deshabilita los logs (por defecto true)
 * - `LOG_CONTEXTS`: Lista separada por comas ("Api,UI"), o '*' para todos
 */

const isDev = import.meta.env.DEV;
const isServer = import.meta.env.SSR;
const logEnabled = import.meta.env.LOG_ENABLED !== "false";
const allowedContexts = (import.meta.env.LOG_CONTEXTS || "*")
	.split(",")
	.map((c: string) => c.trim());

/**
 * Determina si un contexto tiene permitido loguear.
 */
function shouldLog(context: string): boolean {
	if (!isDev || !logEnabled) return false;
	return allowedContexts.includes("*") || allowedContexts.includes(context);
}

/**
 * Colores ANSI para terminal (servidor)
 */
const ansiColors = {
	reset: "\x1b[0m",
	gray: "\x1b[90m",
	blue: "\x1b[34m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	bold: "\x1b[1m",
};

/**
 * Colores CSS para navegador (cliente)
 */
const cssColors = {
	info: "color: #3b82f6; font-weight: bold",
	warn: "color: #f59e0b; font-weight: bold",
	error: "color: #ef4444; font-weight: bold",
	context: "color: #10b981; font-weight: bold",
	time: "color: #6b7280",
	reset: "color: inherit; font-weight: normal",
};

/**
 * Devuelve la hora actual en formato HH:MM:SS
 */
function timeStamp(): string {
	const now = new Date();
	return now.toTimeString().split(" ")[0];
}

/**
 * Formatea una línea de log para el servidor (ANSI colors)
 */

const colorMap: Record<string, string> = {
	INFO: cssColors.info,
	WARN: cssColors.warn,
	ERROR: cssColors.error,
};

function formatLineServer(
	level: "INFO" | "WARN" | "ERROR",
	context: string,
	args: unknown[],
): unknown[] {
	const color = colorMap[level] ?? ansiColors.blue;

	const prefix = `${color}[${timeStamp()}] [${level}] ${ansiColors.bold}[${context}]${ansiColors.reset}`;
	return [prefix, ...args];
}

/**
 * Formatea una línea de log para el navegador (CSS colors)
 */
function formatLineBrowser(
	level: "INFO" | "WARN" | "ERROR",
	context: string,
	args: unknown[],
): unknown[] {
	const levelColor = colorMap[level] ?? cssColors.info;
	const message = `%c[${timeStamp()}]%c [${level}]%c [${context}]%c`;
	const styles = [
		cssColors.time,
		levelColor,
		cssColors.context,
		cssColors.reset,
	];

	return [message, ...styles, ...args];
}

/**
 * Crea un logger con contexto fijo.
 * Detecta automáticamente si está en servidor o navegador y aplica el formato adecuado.
 *
 * @example
 * // En el servidor (terminal con colores ANSI)
 * const api = logger('Api');
 * api.info('Llamada exitosa');
 *
 * @example
 * // En el navegador (consola con colores CSS)
 * const ui = logger('UI');
 * ui.warn('Estado incompleto');
 * ui.error('Fallo de red');
 */
export function logger(context: string) {
	const active = shouldLog(context);

	const base =
		(level: "INFO" | "WARN" | "ERROR", type: "log" | "warn" | "error") =>
		(...args: unknown[]) => {
			if (!active) return;

			// Usar formato apropiado según el entorno
			const formattedArgs = isServer
				? formatLineServer(level, context, args)
				: formatLineBrowser(level, context, args);

			console[type](...formattedArgs);
		};

	return {
		info: base("INFO", "log"),
		warn: base("WARN", "warn"),
		error: base("ERROR", "error"),
		log: base("INFO", "log"),

		get context() {
			return context;
		},
	};
}

/**
 * Logger global para uso rápido sin contexto específico
 */
export const log = logger("App");
