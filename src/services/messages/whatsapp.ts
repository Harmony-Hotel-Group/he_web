import { logger } from "@/services/logger";

const log = logger("messages:whatsapp");

// src/services/messages/whatsapp.ts

import { formatBookingMessageFromFormData } from "@/adapters/booking/whatsapp.adapter";
import { logger } from "@/services/logger";

const log = logger("messages:whatsapp");

interface WhatsAppOptions {
	token?: string; // Meta Graph API token
	phoneId?: string; // WhatsApp Business phone number ID
}

const ENV = {
	WHATSAPP_TOKEN: import.meta.env.WHATSAPP_TOKEN as string | undefined,
	WHATSAPP_PHONE_ID: import.meta.env.WHATSAPP_PHONE_ID as string | undefined,
	WHATSAPP_DESTINATION_PHONE: import.meta.env.WHATSAPP_DESTINATION_PHONE as
		| string
		| undefined,
	DEV: import.meta.env.DEV as boolean,
};

/**
 * Sends a WhatsApp message with booking information.
 * It reads configuration from environment variables.
 *
 * @param formData The FormData object from the booking form.
 * @param bookingType The type of booking, 'group' or 'vehicle'.
 * @param options Optional configuration for WhatsApp token and phone ID.
 * @returns A promise that resolves with the result of the API call.
 */
export async function sendWhatsappMessage(
	formData: FormData,
	bookingType: "group" | "vehicle",
	options: WhatsAppOptions = {},
) {
	const token = options.token ?? ENV.WHATSAPP_TOKEN;
	const phoneId = options.phoneId ?? ENV.WHATSAPP_PHONE_ID;
	const toE164 = ENV.WHATSAPP_DESTINATION_PHONE;

	if (!token || !phoneId || !toE164) {
		const missing = [
			!token && "WHATSAPP_TOKEN",
			!phoneId && "WHATSAPP_PHONE_ID",
			!toE164 && "WHATSAPP_DESTINATION_PHONE",
		]
			.filter(Boolean)
			.join(", ");

		log.warn(
			`Faltan variables de entorno (${missing}); omitiendo envío de WhatsApp.`,
		);

		if (ENV.DEV) {
			console.warn(
				`[messages/whatsapp] Missing environment variables: ${missing}. Skipping WhatsApp message.`,
			);
			// En DEV, mostramos el mensaje en consola para depuración
			console.log("------- WHATSAPP MESSAGE PREVIEW -------");
			console.log(formatBookingMessageFromFormData(formData, bookingType));
			console.log("--------------------------------------");
		}

		return { ok: false, skipped: true } as const;
	}

	const bodyText = formatBookingMessageFromFormData(formData, bookingType);
	const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
	const payload = {
		messaging_product: "whatsapp",
		to: toE164,
		type: "text",
		text: { body: bodyText },
	};

	try {
		log.info(`Enviando mensaje de reserva a ${toE164}`);
		const res = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		const responseBody = await res.text().catch(() => "");

		if (res.ok) {
			log.info("Mensaje de WhatsApp enviado con éxito.", {
				status: res.status,
				body: responseBody,
			});
			return { ok: true, status: res.status, body: responseBody } as const;
		} else {
			log.error("Error al enviar mensaje de WhatsApp.", {
				status: res.status,
				body: responseBody,
			});
			return { ok: false, status: res.status, body: responseBody } as const;
		}
	} catch (e) {
		const error = e instanceof Error ? e.message : String(e);
		log.error("Excepción al enviar mensaje de WhatsApp.", { error });
		return { ok: false, error } as const;
	}
}
