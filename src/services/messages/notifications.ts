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

import { sendWhatsappMessage } from "./whatsapp";
import { sendEmail, sendAdminEmail } from "./email";
import { sendTelegramMessage } from "./telegram";
import { postWebhook } from "./webhooks";
import { logger } from "@/services/logger";

const log = logger("messages:notifications");

// ============== Tipos ==============

export type NotificationChannel = "whatsapp" | "email" | "telegram" | "webhook";

export interface NotificationResult {
	channel: NotificationChannel;
	ok: boolean;
	skipped?: boolean;
	error?: string;
}

export interface BookingNotificationData {
	type: "standard" | "group" | "vehicle";
	checkin?: string | null;
	checkout?: string | null;
	nights?: string | null;
	adults?: string;
	children?: string;
	rooms?: string;
	breakfast?: string;
	groupAdults?: string;
	groupTeens?: string;
	groupKids?: string;
	groupInfants?: string;
	groupNotes?: string;
	vehicles?: { type: string; plate: string }[];
	vehicleNotes?: string;
}

interface NotifyOptions {
	channels?: NotificationChannel[];
	webhookUrl?: string;
}

// ============== Config ==============

const ENV = {
	TELEGRAM_CHAT_ID: import.meta.env.TELEGRAM_CHAT_ID as string | undefined,
	ADMIN_EMAIL: import.meta.env.ADMIN_EMAIL as string | undefined,
	BOOKING_WEBHOOK_URL: import.meta.env.BOOKING_WEBHOOK_URL as string | undefined,
	DEV: import.meta.env.DEV as boolean,
};

// ============== Formateo de mensaje ==============

function formatBookingMessage(data: BookingNotificationData): string {
	const lines: string[] = [];

	lines.push("🏨 *Nueva solicitud de reserva — Hotel Ensueños*");
	lines.push("");

	if (data.type === "group") {
		lines.push("📋 *Tipo:* Reserva grupal");
	} else if (data.type === "vehicle") {
		lines.push("📋 *Tipo:* Reserva con vehículo");
	} else {
		lines.push("📋 *Tipo:* Reserva estándar");
	}

	if (data.checkin) lines.push(`📅 Check-in: ${data.checkin}`);
	if (data.checkout) lines.push(`📅 Check-out: ${data.checkout}`);
	if (data.nights) lines.push(`🌙 Noches: ${data.nights}`);

	if (data.adults) lines.push(`👤 Adultos: ${data.adults}`);
	if (data.children) lines.push(`👶 Niños: ${data.children}`);
	if (data.rooms) lines.push(`🚪 Habitaciones: ${data.rooms}`);
	if (data.breakfast) lines.push(`🍳 Desayuno: ${data.breakfast === "true" ? "Sí" : "No"}`);

	if (data.groupAdults) lines.push(`👤 Adultos (grupo): ${data.groupAdults}`);
	if (data.groupTeens) lines.push(`👦 Adolescentes: ${data.groupTeens}`);
	if (data.groupKids) lines.push(`🧒 Niños: ${data.groupKids}`);
	if (data.groupInfants) lines.push(`🍼 Infantes: ${data.groupInfants}`);
	if (data.groupNotes) lines.push(`📝 Notas: ${data.groupNotes}`);

	if (data.vehicles?.length) {
		lines.push("");
		lines.push("🚗 *Vehículos:*");
		data.vehicles.forEach((v, i) => {
			lines.push(`  ${i + 1}. ${v.type} — Placa: ${v.plate}`);
		});
	}
	if (data.vehicleNotes) lines.push(`📝 Notas vehículo: ${data.vehicleNotes}`);

	lines.push("");
	lines.push("_Enviado desde hotelensuenos.com_");

	return lines.join("\n");
}

function formatPlainMessage(data: BookingNotificationData): string {
	return formatBookingMessage(data)
		.replace(/\*/g, "")
		.replace(/_/g, "");
}

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

async function dispatchToEmail(subject: string, text: string): Promise<NotificationResult> {
	try {
		const result = await sendAdminEmail(subject, text);
		if (result.skipped) {
			log.info("Email: no configurado, omitido");
			return { channel: "email", ok: false, skipped: true };
		}
		return { channel: "email", ok: result.ok };
	} catch (e) {
		return { channel: "email", ok: false, error: String(e) };
	}
}

async function dispatchToWebhook(url: string, data: BookingNotificationData): Promise<NotificationResult> {
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
	const text = formatBookingMessage(data);
	const plainText = formatPlainMessage(data);
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

function formatContactMessage(data: ContactFormData): string {
	const lines: string[] = [];

	lines.push("📧 *Nuevo mensaje de contacto — Hotel Ensueños*");
	lines.push("");
	lines.push(`👤 *Nombre:* ${data.name}`);
	lines.push(`📧 *Email:* ${data.email}`);
	lines.push(`📱 *Teléfono:* ${data.phone}`);
	lines.push(`📝 *Asunto:* ${data.subject}`);
	lines.push("");
	lines.push(`💬 *Mensaje:*`);
	lines.push(data.message);
	lines.push("");
	lines.push("_Enviado desde hotelensuenos.com_");

	return lines.join("\n");
}

function formatContactEmail(data: ContactFormData): string {
	const lines: string[] = [];

	lines.push("Nuevo mensaje de contacto desde el sitio web:");
	lines.push("");
	lines.push(`Nombre: ${data.name}`);
	lines.push(`Email: ${data.email}`);
	lines.push(`Teléfono: ${data.phone}`);
	lines.push(`Asunto: ${data.subject}`);
	lines.push("");
	lines.push("Mensaje:");
	lines.push(data.message);
	lines.push("");
	lines.push("Enviado desde hotelensuenos.com");

	return lines.join("\n");
}

/**
 * Envía una notificación de formulario de contacto a los canales configurados.
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
					results.push(await dispatchToWebhook(webhookUrl, { type: "standard", ...data } as BookingNotificationData));
				} else {
					results.push({ channel: "webhook", ok: false, skipped: true });
				}
				break;
		}
	}

	const sent = results.filter((r) => r.ok).length;
	log.info(`Notificación de contacto enviada: ${sent}/${results.length} canales`);

	return results;
}
