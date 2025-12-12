// src/utils/storage.ts

/**
 * Guarda un valor en el Local Storage, serializándolo a JSON.
 * Esta función solo se ejecuta en el lado del cliente.
 *
 * @param key - La clave bajo la cual se guardará el valor.
 * @param value - El valor a guardar. Puede ser cualquier tipo serializable a JSON.
 */
export function setItem(key: string, value: any): void {
	if (typeof window === "undefined") {
		// No hacer nada si no estamos en el navegador
		return;
	}

	try {
		const serializedValue = JSON.stringify(value);
		window.localStorage.setItem(key, serializedValue);
	} catch (error) {
		console.error(`Error al guardar en Local Storage (key: ${key}):`, error);
	}
}

/**
 * Recupera un valor del Local Storage, deserializándolo desde JSON.
 * Esta función solo se ejecuta en el lado del cliente.
 *
 * @param key - La clave del valor a recuperar.
 * @returns El valor deserializado o null si la clave no existe o hay un error.
 */
export function getItem<T>(key: string): T | null {
	if (typeof window === "undefined") {
		return null;
	}

	try {
		const serializedValue = window.localStorage.getItem(key);
		if (serializedValue === null) {
			return null;
		}
		return JSON.parse(serializedValue) as T;
	} catch (error) {
		console.error(`Error al leer de Local Storage (key: ${key}):`, error);
		return null;
	}
}

/**
 * Elimina un valor del Local Storage.
 * Esta función solo se ejecuta en el lado del cliente.
 *
 * @param key - La clave del valor a eliminar.
 */
export function removeItem(key: string): void {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.removeItem(key);
}

/**
 * Limpia todo el Local Storage.
 * ¡Usar con precaución!
 */
export function clearStorage(): void {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.clear();
}