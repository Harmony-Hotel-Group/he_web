/**
 * @file Logger para desarrollo con contexto precargado y colores
 *
 * Variables de Entorno:
 * - `LOG_ENABLED`: Si es 'false', deshabilita los logs (por defecto true)
 * - `LOG_CONTEXTS`: Lista separada por comas ("Api,UI"), o '*' para todos
 */

const isDev = import.meta.env.DEV;
const logEnabled = import.meta.env.LOG_ENABLED !== "false";
const allowedContexts = (import.meta.env.LOG_CONTEXTS || "*")
	.split(",")
	.map((c) => c.trim());

/**
 * Determina si un contexto tiene permitido loguear.
 */
function shouldLog(context: string): boolean {
	if (!isDev || !logEnabled) return false;
	return allowedContexts.includes("*") || allowedContexts.includes(context);
}

/**
 * Colores ANSI (funcionan en terminal y la mayoría de navegadores)
 */
const colors = {
	reset: "\x1b[0m",
	gray: "\x1b[90m",
	blue: "\x1b[34m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	bold: "\x1b[1m",
};

/**
 * Devuelve la hora actual en formato HH:MM:SS
 */
function timeStamp(): string {
	const now = new Date();
	return now.toTimeString().split(" ")[0];
}

/**
 * Formatea una línea de log con color y metadatos.
 */
function formatLine(
	level: "INFO" | "WARN" | "ERROR",
	context: string,
	args: any[],
): any[] {
	let color: string;
	switch (level) {
		case "WARN":
			color = colors.yellow;
			break;
		case "ERROR":
			color = colors.red;
			break;
		default:
			color = colors.blue;
			break;
	}

	const prefix = `${colors.gray}[${timeStamp()}]${colors.reset} ${color}[${level}]${colors.reset} ${colors.bold}[${context}]${colors.reset}`;
	return [prefix, ...args];
}

/**
 * Crea un logger con contexto fijo.
 * @example
 * const api = log('Api');
 * api.info('Llamada exitosa');
 * api.error('Fallo de red');
 */
export function logger(context: string) {
	const active = shouldLog(context);

	const base =
		(level: "INFO" | "WARN" | "ERROR", type: "log" | "warn" | "error") =>
		(...args: any[]) => {
			if (!active) return;
			console[type](...formatLine(level, context, args));
		};

	return {
		info: base("INFO", "log"),
		warn: base("WARN", "warn"),
		error: base("ERROR", "error"),
		log: base("INFO", "log"),
	};
}
