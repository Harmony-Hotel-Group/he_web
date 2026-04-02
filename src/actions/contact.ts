// src/actions/contact.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { logger } from "@/services/logger";
import { notifyContactForm } from "@/services/messages/notifications";

const log = logger("Contact");

export const contact = defineAction({
	accept: "form",
	input: z.object({
		name: z.string().min(1, "El nombre es requerido"),
		email: z.string().email("Email inválido"),
		phone: z.string().optional(),
		subject: z.string().min(1, "El asunto es requerido"),
		message: z.string().min(1, "El mensaje es requerido"),
	}),
	handler: async (input) => {
		const { name, email, phone, subject, message } = input;

		log.info(`Nuevo mensaje de contacto de ${name} (${email})`);

		try {
			// Notificar al equipo (email, Telegram, etc.)
			await notifyContactForm({
				name,
				email,
				phone: phone || "No especificado",
				subject,
				message,
			});

			log.info("Mensaje de contacto enviado exitosamente");

			return {
				success: true,
				data: {
					name,
					email,
					subject,
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
