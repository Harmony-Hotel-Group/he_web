// src/services/messages/notifications.ts
/**
 * Servicio unificado de notificaciones multi-canal.
 *
 * Patrón Strategy: despacha el mismo mensaje a múltiples canales
 * (WhatsApp, Email, Telegram, Webhook) según configuración.
 *
 * Cada canal es opcional y seguro: si no está configurado, se omite sin error.
 *
 * Uso:
 *   import { notify } from '@/services/messages/notifications';
 *   await notify.booking({ ... });
 */

import { logger } from "@/services/logger";
import { sendAdminEmail } from "./email";
import { sendTelegramMessage } from "./telegram";
import { postWebhook } from "./webhooks";
import {
	buildBookingNotificationMessage,
	formatContactMessage,
	formatContactEmail,
} from "@/adapters/booking/whatsapp.adapter";

const log = logger("messages:notifications");

// ============== Tipos ==============

export type NotificationChannel = "whatsapp" | "email" | "telegram" | "webhook";

export interface NotificationResult {
	channel: NotificationChannel;
	ok: boolean;
	skipped?: boolean;
	error?: string;
}

export type BookingNotificationData = Parameters<
	typeof buildBookingNotificationMessage
>[0];

interface NotifyOptions {
	channels?: NotificationChannel[];
	webhookUrl?: string;
}

const ENV = {
	TELEGRAM_CHAT_ID: import.meta.env.TELEGRAM_CHAT_ID as string | undefined,
	ADMIN_EMAIL: import.meta.env.ADMIN_EMAIL as string | undefined,
	BOOKING_WEBHOOK_URL: import.meta.env.BOOKING_WEBHOOK_URL as
		| string
		| undefined,
	DEV: import.meta.env.DEV as boolean,
};

// ============== Despacho por canal ==============

async function dispatchToTelegram(text: string): Promise<NotificationResult> {
	try {
		const result = await sendTelegramMessage(text, ENV.TELEGRAM_CHAT_ID);
		if ("skipped" in result && result.skipped) {
			log.info("Telegram: no configurado, omitido");
			return { channel: "telegram", ok: false, skipped: true };
		}
		return { channel: "telegram", ok: result.ok };
	} catch (e) {
		return { channel: "telegram", ok: false, error: String(e) };
	}
}
// ============== Despacho por canal ==============

async function dispatchToEmail(
	subject: string,
	text: string,
): Promise<NotificationResult> {
	try {
		const result = await sendAdminEmail(subject, text);
		if ("skipped" in result && result.skipped) {
			log.info("Email: no configurado, omitido");
			return { channel: "email", ok: false, skipped: true };
		}
		return { channel: "email", ok: result.ok };
	} catch (e) {
		return { channel: "email", ok: false, error: String(e) };
	}
}
// ============== Despacho por canal ==============

async function dispatchToWebhook(
	url: string,
	data: BookingNotificationData,
): Promise<NotificationResult> {
	try {
		const result = await postWebhook(url, {
			type: "booking",
			timestamp: new Date().toISOString(),
			data,
		});
		return { channel: "webhook", ok: result.ok };
	} catch (e) {
		return { channel: "webhook", ok: false, error: String(e) };
	}
}

// ============== API pública ==============

/**
 * Envía una notificación de reserva a los canales configurados.
 *
 * @param data — Datos de la reserva
 * @param options — Canales a usar (default: todos los configurados)
 * @returns Resultados por canal
 */
export async function notifyBooking(
	data: BookingNotificationData,
	options: NotifyOptions = {},
): Promise<NotificationResult[]> {
	const text = buildBookingNotificationMessage(data);
	const plainText = buildBookingNotificationMessage(data).replace(/\*/g, "").replace(/_/g, "");
	const subject = `Nueva reserva ${data.type} — Hotel Ensueños`;

	const channels = options.channels ?? ["telegram", "email"];
	const webhookUrl = options.webhookUrl ?? ENV.BOOKING_WEBHOOK_URL;

	const results: NotificationResult[] = [];

	for (const channel of channels) {
		switch (channel) {
			case "telegram":
				results.push(await dispatchToTelegram(text));
				break;
			case "email":
				results.push(await dispatchToEmail(subject, plainText));
				break;
			case "webhook":
				if (webhookUrl) {
					results.push(await dispatchToWebhook(webhookUrl, data));
				} else {
					results.push({ channel: "webhook", ok: false, skipped: true });
				}
				break;
		}
	}

	const sent = results.filter((r) => r.ok).length;
	log.info(`Notificación enviada: ${sent}/${results.length} canales`);

	return results;
}

/**
 * Atajo: notificar a todos los canales configurados.
 */
export async function notifyAllChannels(
	data: BookingNotificationData,
): Promise<NotificationResult[]> {
	return notifyBooking(data, {
		channels: ["telegram", "email"],
		webhookUrl: ENV.BOOKING_WEBHOOK_URL,
	});
}

// ============== Notificación de Contacto ==============

export interface ContactFormData {
	name: string;
	email: string;
	phone: string;
	subject: string;
	message: string;
}

/**
 * Envía una notificación de formulario de contacto a los canales configurados.
 * Los formatos de mensaje (WhatsApp y email) se importan desde el adapter.
 */
export async function notifyContactForm(
	data: ContactFormData,
	options: NotifyOptions = {},
): Promise<NotificationResult[]> {
	const text = formatContactMessage(data);
	const plainText = formatContactEmail(data);
	const subject = `Contacto: ${data.subject} — ${data.name}`;

	const channels = options.channels ?? ["telegram", "email"];
	const webhookUrl = options.webhookUrl ?? ENV.BOOKING_WEBHOOK_URL;

	const results: NotificationResult[] = [];

	for (const channel of channels) {
		switch (channel) {
			case "telegram":
				results.push(await dispatchToTelegram(text));
				break;
			case "email":
				results.push(await dispatchToEmail(subject, plainText));
				break;
			case "webhook":
				if (webhookUrl) {
					results.push(
						await dispatchToWebhook(webhookUrl, {
							type: "standard",
							...data,
						} as BookingNotificationData),
					);
				} else {
					results.push({ channel: "webhook", ok: false, skipped: true });
				}
				break;
		}
	}

	const sent = results.filter((r) => r.ok).length;
	log.info(
		`Notificación de contacto enviada: ${sent}/${results.length} canales`,
	);

	return results;
}
