// src/actions/contact.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { logger } from "@/services/logger";
import { notifyContactForm } from "@/services/messages/notifications";
import { validateCSRFInAction } from "@/utils/csrf";
import { applyRateLimit, presets } from "@/utils/rateLimit";
import {
	contactFormSchema,
	sanitizeText,
	validateFormData,
} from "@/utils/validation";

const log = logger("Contact");

export const contact = defineAction({
	accept: "form",
	input: z.object({
		name: z.string().min(1, "El nombre es requerido"),
		email: z.string().email("Email inválido"),
		phone: z.string().optional(),
		subject: z.string().min(1, "El asunto es requerido"),
		message: z.string().min(1, "El mensaje es requerido"),
		_csrf: z.string().min(1, "Token CSRF requerido"),
	}),
	handler: async (input, context) => {
		// Aplicar rate limiting (5 peticiones por minuto)
		try {
			await applyRateLimit(context.request, "contact", presets.form);
		} catch (error) {
			log.warn(`Rate limit excedido para contacto: ${error}`);
			return {
				success: false,
				error: {
					message:
						error instanceof Error
							? error.message
							: "Demasiados intentos. Por favor espera un momento.",
				},
			};
		}

		// Validar token CSRF
		try {
			await validateCSRFInAction(context.request, input as unknown as FormData);
		} catch (error) {
			log.error("Error de validación CSRF:", error);
			return {
				success: false,
				error: {
					message:
						"Error de seguridad. Por favor recarga la página e intenta de nuevo.",
				},
			};
		}

		// Validar datos con schema mejorado
		const validation = await validateFormData(contactFormSchema, {
			name: input.name,
			email: input.email,
			phone: input.phone,
			subject: input.subject,
			message: input.message,
		});

		if (!validation.success) {
			log.warn(`Validación fallida: ${JSON.stringify(validation.errors)}`);
			return {
				success: false,
				error: {
					message: "Datos inválidos",
					fields: validation.errors,
				},
			};
		}

		// Sanitizar datos
		const { name, email, phone, subject, message } = validation.data;
		const sanitizedName = sanitizeText(name);
		const sanitizedSubject = sanitizeText(subject);
		const sanitizedMessage = sanitizeText(message);

		log.info(`Nuevo mensaje de contacto de ${sanitizedName} (${email})`);

		try {
			// Notificar al equipo (email, Telegram, etc.)
			await notifyContactForm({
				name: sanitizedName,
				email,
				phone: phone || "No especificado",
				subject: sanitizedSubject,
				message: sanitizedMessage,
			});

			log.info("Mensaje de contacto enviado exitosamente");

			return {
				success: true,
				data: {
					name: sanitizedName,
					email,
					subject: sanitizedSubject,
				},
			};
		} catch (error) {
			log.error("Error al enviar mensaje de contacto:", error);

			return {
				success: false,
				error: {
					message: "Error al enviar el mensaje. Por favor intenta de nuevo.",
				},
			};
		}
	},
});
