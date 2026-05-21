// src/utils/security.ts
/**
 * Utilidades de seguridad para manipulación segura del DOM.
 *
 *Principios:
 * - Sanitizar texto antes de insertar en innerHTML
 * - Evitar XSS al renderizar contenido dinámico
 */

/**
 * Escapa caracteres HTML en una cadena para uso seguro en innerHTML.
 *
 * @param text Texto sin sanitizar (puede contener < > & " ')
 * @returns Texto con entidades HTML escapadas
 * @example
 * escapeHTML('<script>alert(1)</script>')
 * // => '&lt;script&gt;alert(1)&lt;/script&gt;'
 */
export function escapeHTML(text: string): string {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
	};
	return text.replace(/[&<>"']/g, (char) => map[char] ?? char);
}

/**
 * Crea un elemento de texto seguro para usar como contenido de toast.
 * Combina escapeHTML con la capacidad de preservar SVG inline aprobado.
 *
 * @param text Texto del mensaje (se escapará automáticamente)
 * @param allowedTags Tags permitidos sin escapar (por defecto vacío)
 * @returns Cadena segura para innerHTML
 */
export function sanitizeHTML(
	text: string,
	allowedTags: string[] = [],
): string {
	// Si no hay tags permitidos, escapar todo
	if (allowedTags.length === 0) {
		return escapeHTML(text);
	}
	// Implementación simple: escapar todo, luego des-escapar tags permitidos
	// Para producción considerar DOMPurify o librería validada
	const escaped = escapeHTML(text);
	// Por ahora, retornar escapado completo. Si se necesitan rich texts,
	// integrar DOMPurify en etapas futuras.
	return escaped;
}
