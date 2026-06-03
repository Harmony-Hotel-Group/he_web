import type { BuildBookingMessageInput } from "@/domain/booking/types";
import { calculateNights } from "@/domain/date.utils";

/**
 * src/adapters/booking/whatsapp.adapter.ts
 *
 * Adapter centralizado para construir mensajes de WhatsApp.
 * Este módulo es la única fuente de verdad para construir mensajes de reserva.
 *
 * Ahora expone también buildBookingMessage() para compatibilidad con código legacy.
 */

// ============== Funciones legacy (usadas por buildBookingMessage) ==============

/**
 * Parsea un rango de fechas en formato "YYYY-MM-DD ➜ YYYY-MM-DD (N noches)"
 */
function parseDateRangeLegacy(dateRangeRaw: string): {
	checkIn: string;
	checkOut: string;
	nightsCount: string;
} {
	let checkIn = "N/A";
	let checkOut = "N/A";
	let nightsCount = "N/A";

	if (dateRangeRaw.includes("➜")) {
		const parts = dateRangeRaw.split("➜").map((p) => p.trim());
		checkIn = parts[0];
		const rightPart = parts[1];

		if (rightPart?.includes("(")) {
			const subParts = rightPart.split("(").map((p) => p.trim());
			checkOut = subParts[0];
			nightsCount = subParts[1]
				.replace(")", "")
				.replace("noches", "")
				.replace("noche", "")
				.trim();
		} else {
			checkOut = rightPart;
		}
	} else if (dateRangeRaw.includes(" to ")) {
		const parts = dateRangeRaw.split(" to ");
		checkIn = parts[0];
		checkOut = parts[1] || "N/A";
	} else {
		checkIn = dateRangeRaw;
	}

	return { checkIn, checkOut, nightsCount };
}

/**
 * Mapea BuildBookingMessageInput → BookingData (formato del adapter)
 * Usado solo por buildBookingMessage; forma parte del bloque legacy.
 */
function _mapLegacyToBookingData(input: BuildBookingMessageInput): BookingData {
	const isGroup = input.isGroupMode;

	// Extraer fechas del processing o del dateRangeRaw
	let checkin = "";
	let checkout = "";
	let nights = 0;

	if (input.isGroupMode && input.dateRangeRaw) {
		const parsed = parseDateRangeLegacy(input.dateRangeRaw);
		checkin = parsed.checkIn;
		checkout = parsed.checkOut;
		nights = Number(parsed.nightsCount) || 0;
	} else if (input.processing) {
		checkin =
			typeof input.processing.checkin === "string"
				? input.processing.checkin
				: "";
		checkout =
			typeof input.processing.checkout === "string"
				? input.processing.checkout
				: "";
		nights = Number(input.processing.nights) || 0;
	}

	// Mapear huéspedes
	let adults = 0;
	let children = 0;

	if (isGroup) {
		adults = Number(input.groupAdults) || 0;
		// No hay children en grupo legacy, se ignora
	} else if (input.processing) {
		adults =
			typeof input.processing.adults === "number"
				? input.processing.adults
				: Number(input.processing.adults) || 0;
		children =
			typeof input.processing.children === "number"
				? input.processing.children
				: Number(input.processing.children) || 0;
	}

	return {
		checkin,
		checkout,
		rooms: isGroup ? 1 : Number(input.processing?.rooms) || 1,
		adults,
		children: children || undefined,
		breakfast:
			input.processing?.breakfast === "on" ||
			input.processing?.breakfast === "true",
		notes: input.groupNotes || undefined,
		vehicleType: isGroup ? undefined : input.vehicleItems?.[0]?.type,
		vehiclePlate: isGroup ? undefined : input.vehicleItems?.[0]?.plate,
		phone: undefined,
	};
}

/**
 * Valida que los datos de la reservación tengan los campos requeridos
 *
 * @param data - Datos de la reservación
 * @returns true si los datos son válidos
 */
export function validateBookingData(data: BookingData): boolean {
	if (!data.checkin || !data.checkout) return false;
	if (data.rooms < 1 || data.adults < 1) return false;

	// Validar formato de fecha
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(data.checkin) || !dateRegex.test(data.checkout))
		return false;

	return true;
}

// ============== Fin funciones legacy ==============

/**
 * Construye el mensaje de WhatsApp en formato legacy.
 */
export function buildBookingMessage(input: BuildBookingMessageInput): string {
	if (input.isGroupMode) {
		const parsed = parseDateRangeLegacy(input.dateRangeRaw || "");
		return `
*Estimado Hotel Ensueños por favor necesito que me ayude con una reserva de GRUPO:*

➢ Check In: ${parsed.checkIn}
➢ Check Out: ${parsed.checkOut}
➢ Cantidad de Noches: ${parsed.nightsCount}
➢ Adultos: ${input.groupAdults}
➢ Adolescentes: ${input.groupTeens}
➢ Niños: ${input.groupKids}
➢ Infantes: ${input.groupInfants}
➢ Distribución: ${input.distributionLabel}
➢ Desayuno incluido: ${input.processing?.breakfast === "on" ? "Sí" : "No"}
`;
	} else {
		const type = input.isVehicleChecked ? "VEHÍCULO" : "RESERVACIÓN";
		const vehicleSection = input.isVehicleChecked
			? input.vehicleItems
				? `\n➢ *Vehículos:*\n${input.vehicleItems.map((item, idx) => `   ${idx + 1}. ${item.type}, Placa: ${item.plate || "N/A"}`).join("\n")}`
				: ""
			: "";

		return `
*Estimado Hotel Ensueños por favor necesito que me ayude con una reserva de ${type}:*

➢ Check In: ${input.processing?.checkin}
➢ Check Out: ${input.processing?.checkout}
➢ Cantidad de Noches: ${input.processing?.nights}
➢ Adultos: ${input.processing?.adults}
➢ Niños: ${input.processing?.children}
➢ Habitaciones: ${input.processing?.rooms}
➢ Desayuno incluido: ${input.processing?.breakfast === "true" ? "Sí" : "No"}${vehicleSection}
`;
	}
}

// ============== Fin compatibilidad ==============

export type BookingType = "standard" | "group" | "vehicle";

export interface BookingData {
	/** Fecha de check-in (YYYY-MM-DD) */
	checkin: string;
	/** Fecha de checkout (YYYY-MM-DD) */
	checkout: string;
	/** Número de habitaciones */
	rooms: number;
	/** Número de adultos */
	adults: number;
	/** Número de niños */
	children?: number;
	/** Incluye desayuno */
	breakfast?: boolean;
	/** Notas adicionales */
	notes?: string;
	/** Tipo de vehículo (si aplica) */
	vehicleType?: string;
	/** Placa del vehículo (si aplica) */
	vehiclePlate?: string;
	/** Teléfono de contacto */
	phone?: string;
}

export interface WhatsAppMessageOptions {
	/** Tipo de reservación */
	type: BookingType;
	/** Datos de la reservación */
	data: BookingData;
	/** Incluir información del vehículo */
	includeVehicle?: boolean;
	/** Número de vehículos */
	vehicleCount?: number;
	/** Notas de vehículos */
	vehicleNotes?: string;
}

/**
 * Formatea una fecha para mostrar en el mensaje
 */
function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) return dateStr;

	return date.toLocaleDateString("es-EC", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

/**
 * Plantilla común para mensajes de WhatsApp — extrae la lógica compartida.
 * Cada tipo de mensaje solo especifica su encabezado y campos específicos.
 */
function _buildWhatsAppTemplate(params: {
	header: string;
	footer: string;
	buildLines: (data: BookingData, ctx: BuildContext) => string[];
	ctx?: BuildContext;
}): string {
	const lines: string[] = [];
	lines.push(params.header);
	lines.push("");

	if (params.ctx) {
		lines.push(...params.buildLines(params.ctx.data, params.ctx));
	} else {
		// buildLines llamará a formatDate y calculateNights internamente
		// En este caso ctx no se usa; el header/footer lo definen las subfunciones
	}

	return lines.join("\n") + "\n" + params.footer;
}

/** Contexto compartido para builders */
interface BuildContext {
	data: BookingData;
	vehicleCount?: number;
	vehicleNotes?: string;
}

/**
 * Construye el mensaje de WhatsApp para una reservación estándar
 */
function buildStandardMessage(data: BookingData): string {
	const nights = calculateNights(data.checkin, data.checkout);
	const breakfastText = data.breakfast ? "✅ Incluido" : "❌ No incluido";

	const lines: string[] = [
		"🏨 *NUEVA RESERVACIÓN - Hotel Ensueños*",
		"",
		`📅 *Check-in:* ${formatDate(data.checkin)}`,
		`📅 *Check-out:* ${formatDate(data.checkout)}`,
		`🌙 *Noches:* ${nights}`,
		`🚪 *Habitaciones:* ${data.rooms}`,
		`👨‍👩‍👧 *Adultos:* ${data.adults}`,
	];

	if (data.children && data.children > 0) {
		lines.push(`👶 *Niños:* ${data.children}`);
	}

	lines.push(`🍳 *Desayuno:* ${breakfastText}`);

	if (data.notes) {
		lines.push("");
		lines.push(`📝 *Notas:* ${data.notes}`);
	}

	lines.push("");
	lines.push("_Reserva generada desde hotelensueños.com_");

	return lines.join("\n");
}

/**
 * Construye el mensaje de WhatsApp para una reservación grupal
 */
function buildGroupMessage(data: BookingData): string {
	const nights = calculateNights(data.checkin, data.checkout);

	const lines: string[] = [
		"🏨 *NUEVA RESERVACIÓN GRUPAL - Hotel Ensueños*",
		"",
		`📅 *Check-in:* ${formatDate(data.checkin)}`,
		`📅 *Check-out:* ${formatDate(data.checkout)}`,
		`🌙 *Noches:* ${nights}`,
		`👨‍👩‍👧 *Adultos:* ${data.adults}`,
	];

	if (data.children && data.children > 0) {
		lines.push(`👶 *Niños:* ${data.children}`);
	}

	if (data.notes) {
		lines.push("");
		lines.push(`📝 *Notas:* ${data.notes}`);
	}

	lines.push("");
	lines.push("_Reserva grupal generada desde hotelensueños.com_");

	return lines.join("\n");
}

/**
 * Construye el mensaje de WhatsApp para reservación con vehículo
 */
function buildVehicleMessage(
	data: BookingData,
	vehicleCount: number = 1,
	vehicleNotes?: string,
): string {
	const nights = calculateNights(data.checkin, data.checkout);

	const lines: string[] = [
		"🏨 *NUEVA RESERVACIÓN CON VEHÍCULO - Hotel Ensueños*",
		"",
		`📅 *Check-in:* ${formatDate(data.checkin)}`,
		`📅 *Check-out:* ${formatDate(data.checkout)}`,
		`🌙 *Noches:* ${nights}`,
		`🚗 *Vehículos:* ${vehicleCount}`,
	];

	if (data.vehicleType) {
		lines.push(`🚙 *Tipo:* ${data.vehicleType}`);
	}

	if (data.vehiclePlate) {
		lines.push(`🔖 *Placa:* ${data.vehiclePlate}`);
	}

	if (vehicleNotes) {
		lines.push("");
		lines.push(`📝 *Notas de vehículos:* ${vehicleNotes}`);
	}

	lines.push("");
	lines.push("_Reserva con vehículo generada desde hotelensueños.com_");

	return lines.join("\n");
}

/**
 * Construye el mensaje de WhatsApp para una reservación estándar
 */

/**
 * Construye el mensaje de WhatsApp para una reservación grupal
 */

/**
 * Construye el mensaje de WhatsApp para reservación con vehículo
 */

/**
 * Función principal para construir mensajes de WhatsApp
 *
 * @param options - Opciones del mensaje
 * @returns El mensaje formateado para WhatsApp
 */
export function buildWhatsAppMessage(options: WhatsAppMessageOptions): string {
	const {
		type,
		data,
		includeVehicle = false,
		vehicleCount = 0,
		vehicleNotes,
	} = options;

	switch (type) {
		case "group":
			return buildGroupMessage(data);

		case "vehicle":
			return buildVehicleMessage(data, vehicleCount, vehicleNotes);

		default:
			if (includeVehicle) {
				return buildVehicleMessage(data, vehicleCount, vehicleNotes);
			}
			return buildStandardMessage(data);
	}
}

/**
 * Convierte un mensaje de WhatsApp a formato URL
 *
 * @param phone - Número de teléfono destino (formato E.164)
 * @param message - Mensaje a enviar
 * @returns URL formateada para WhatsApp
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
	const encodedMessage = encodeURIComponent(message);
	return `https://wa.me/${phone}?text=${encodedMessage}`;
}

/**
 * Construye un mensaje simple de contacto (para botón flotante)
 */
export function buildContactMessage(
	hotelName: string = "Hotel Ensueños",
): string {
	return `Hola, estoy interesado en reservar una habitación en ${hotelName}.`;
}

// ============== Re-export helpers para src/services/messages/whatsapp.ts ==============

/**
 * Formats the booking data from a FormData object into a readable string.
 * Ahora vive en el adapter para centralizar la lógica de mensajes WhatsApp.
 */
export function formatBookingMessageFromFormData(
	formData: FormData,
	bookingType: "group" | "vehicle",
): string {
	// Contenido compartido con el endpoint de notifications
	return buildBookingMessage({
		isGroupMode: bookingType === "group",
		dateRangeRaw:
			(formData.get("dateRangeGroup") as string | null) ||
			(formData.get("dateRange") as string | null) ||
			undefined,
		groupAdults: formData.get("groupAdults"),
		groupTeens: formData.get("groupTeens"),
		groupKids: formData.get("groupKids"),
		groupInfants: formData.get("groupInfants"),
		distributionLabel: formData.get("distributionType")?.toString(),
		groupNotes: formData.get("groupNotes"),
		isVehicleChecked: (formData.get("vehicle") as string | null) === "on",
		vehicleItems: Array.from({ length: 6 }, (_, i) => {
			const type = formData.get(`vehicleType${i + 1}`) as string | null;
			const plate = formData.get(`vehiclePlate${i + 1}`) as string | null;
			return type ? { type, plate: plate || undefined } : null;
		}).filter(Boolean) as { type: string; plate?: string }[],
	});
}
// ============== Re-export helpers para src/services/messages/notifications.ts ==============

/**
 * Formato compartido de reserva para canales de notificación multi-canal.
 * Ahora vive en el adapter para centralizar la lógica de mensajes.
 *
 * @param data — Datos de la reserva en formato plano
 * @returns Mensaje formateado para Telegram + Email
 */
export function buildBookingNotificationMessage(data: {
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
}): string {
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
	if (data.breakfast)
		lines.push(`🍳 Desayuno: ${data.breakfast === "true" ? "Sí" : "No"}`);

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

// ============== Mensajes de Contacto (formulario contacto) ==============

/**
 * Datos del formulario de contacto.
 * Coincide con ContactFormData en notifications.ts.
 */
export interface ContactFormData {
	name: string;
	email: string;
	phone: string;
	subject: string;
	message: string;
}

/**
 * Formatea el mensaje de contacto para WhatsApp (formato Markdown para WA).
 */
export function formatContactMessage(data: ContactFormData): string {
	const lines: string[] = [];
	lines.push("📧 *Nuevo mensaje de contacto — Hotel Ensueños*");
	lines.push("");
	lines.push(`👤 *Nombre:* ${data.name}`);
	lines.push(`📧 *Email:* ${data.email}`);
	lines.push(`📱 *Teléfono:* ${data.phone}`);
	lines.push(`📝 *Asunto:* ${data.subject}`);
	lines.push("");
	lines.push("💬 *Mensaje:*");
	lines.push(data.message);
	lines.push("");
	lines.push("_Enviado desde hotelensuenos.com_");
	return lines.join("\n");
}

/**
 * Formatea el mensaje de contacto para Email (texto plano).
 */
export function formatContactEmail(data: ContactFormData): string {
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
