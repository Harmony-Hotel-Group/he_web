// src/utils/validation.ts
/**
 * Utilidades de validación y sanitización para formularios
 */

import { z } from 'astro:schema';

// Schema para formulario de contacto
export const contactFormSchema = z.object({
	name: z
		.string()
		.min(2, 'El nombre debe tener al menos 2 caracteres')
		.max(100, 'El nombre no puede exceder 100 caracteres')
		.regex(/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/, 'El nombre solo puede contener letras y espacios'),
	
	email: z
		.string()
		.email('Ingresa un correo electrónico válido'),
	
	phone: z
		.string()
		.optional()
		.refine(
			(val) => !val || /^\+?[0-9\s()-]{7,20}$/.test(val),
			'Ingresa un número de teléfono válido'
		),
	
	subject: z
		.string()
		.min(5, 'El asunto debe tener al menos 5 caracteres')
		.max(200, 'El asunto no puede exceder 200 caracteres'),
	
	message: z
		.string()
		.min(10, 'El mensaje debe tener al menos 10 caracteres')
		.max(2000, 'El mensaje no puede exceder 2000 caracteres')
		.refine(
			(val) => !/<script|javascript:|on\w+=/i.test(val),
			'El mensaje no puede contener código HTML o scripts'
		),
});

// Schema para formulario de booking
export const bookingFormSchema = z.object({
	dateRange: z
		.string()
		.regex(
			/^\d{4}[-/]\d{2}[-/]\d{2}\s*➜\s*\d{4}[-/]\d{2}[-/]\d{2}\s*\(\d+\s*nights?\)$/,
			'Selecciona un rango de fechas válido'
		),
	
	adults: z
		.string()
		.min(1, 'Selecciona al menos 1 adulto'),
	
	children: z
		.string()
		.default('0'),
	
	rooms: z
		.string()
		.min(1, 'Selecciona al menos 1 habitación'),
	
	breakfast: z
		.string()
		.default('true'),
	
	vehicle: z
		.string()
		.default('false'),
	
	special_request: z
		.string()
		.default('false'),
	
	groupAdults: z
		.string()
		.optional(),
	
	groupTeens: z
		.string()
		.optional(),
	
	groupKids: z
		.string()
		.optional(),
	
	groupInfants: z
		.string()
		.optional(),
	
	groupNotes: z
		.string()
		.max(1000, 'Las notas no pueden exceder 1000 caracteres')
		.optional(),
});

// Schema para vehículo
export const vehicleFormSchema = z.object({
	vehicleType: z
		.string()
		.min(1, 'Selecciona un tipo de vehículo'),
	
	vehiclePlate: z
		.string()
		.optional()
		.refine(
			(val) => !val || /^[A-Z0-9-]{4,10}$/i.test(val),
			'Ingresa una placa válida (ej: ABC-1234)'
		),
});

// Tipos inferidos
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type BookingFormData = z.infer<typeof bookingFormSchema>;
export type VehicleFormData = z.infer<typeof vehicleFormSchema>;

/**
 * Valida y sanitiza datos de formulario
 * @param schema - El schema de Zod a usar
 * @param data - Los datos a validar
 * @returns Resultado de la validación
 */
export async function validateFormData<T extends z.ZodType>(
	schema: T,
	data: Record<string, unknown>
): Promise<{ success: true; data: z.infer<T> } | { success: false; errors: Array<{ path: (string | number)[]; message: string }> }> {
	const result = await schema.safeParseAsync(data);
	
	if (!result.success) {
		const errors = result.error.errors.map((err) => ({
			path: err.path,
			message: err.message,
		}));
		return { success: false, errors };
	}
	
	return { success: true, data: result.data };
}

/**
 * Sanitiza texto para prevenir XSS
 * @param text - Texto a sanitizar
 * @returns Texto sanitizado
 */
export function sanitizeText(text: string): string {
	return text
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g, '&#x2F;');
}

/**
 * Escapa caracteres especiales para HTML
 * @param text - Texto a escapar
 * @returns Texto escapado
 */
export function escapeHtml(text: string): string {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
	};
	return text.replace(/[&<>"']/g, (m) => map[m]);
}
