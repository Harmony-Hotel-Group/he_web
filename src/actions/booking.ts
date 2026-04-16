// src/actions/booking.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { logger } from "@/services/logger";
import {
	sendAdminEmail,
	sendBookingConfirmationEmail,
} from "@/services/messages/email";
import { notifyAllChannels } from "@/services/messages/notifications";
import {
	calculateTotalPrice,
	generateBookingEmailContent,
	generateBookingNumber,
} from "@/utils/bookingUtils";
import { validateCSRFInAction } from "@/utils/csrf";
import { applyRateLimit, presets } from "@/utils/rateLimit";
import {
	bookingFormSchema,
	sanitizeText,
	validateFormData,
} from "@/utils/validation";

const log = logger("Booking");

export const booking = defineAction({
	accept: "form",
	input: z.object({
		_csrf: z.string().min(1, "Token CSRF requerido"),
		dateRange: z.string(),
		adults: z.string(),
		children: z.string(),
		rooms: z.string(),
		breakfast: z.string(),
		vehicle: z.string(),
		// Campos de contacto del huésped
		guestName: z.string().min(2, "Nombre requerido"),
		guestEmail: z.string().email("Email inválido"),
		guestPhone: z.string().optional(),
		// Campos opcionales de grupos (por si se envían desde el formulario principal)
		groupAdults: z.string().optional(),
		groupTeens: z.string().optional(),
		groupKids: z.string().optional(),
		groupInfants: z.string().optional(),
		groupNotes: z.string().optional(),
		// Campos opcionales de vehículos
		vehicleType1: z.string().optional(),
		vehiclePlate1: z.string().optional(),
		vehicleType2: z.string().optional(),
		vehiclePlate2: z.string().optional(),
		vehicleType3: z.string().optional(),
		vehiclePlate3: z.string().optional(),
		vehicleType4: z.string().optional(),
		vehiclePlate4: z.string().optional(),
		vehicleType5: z.string().optional(),
		vehiclePlate5: z.string().optional(),
		vehicleNotes: z.string().optional(),
	}),
	handler: async (input, context) => {
		// Aplicar rate limiting (3 peticiones por minuto para bookings)
		try {
			await applyRateLimit(context.request, "booking", presets.booking);
		} catch (error) {
			log.warn(`Rate limit excedido para booking: ${error}`);
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

		// Validar datos con schema
		const validation = await validateFormData(bookingFormSchema, {
			dateRange: input.dateRange,
			adults: input.adults,
			children: input.children,
			rooms: input.rooms,
			breakfast: input.breakfast,
			vehicle: input.vehicle,
			groupAdults: input.groupAdults,
			groupTeens: input.groupTeens,
			groupKids: input.groupKids,
			groupInfants: input.groupInfants,
			groupNotes: input.groupNotes,
		});

		if (!validation.success) {
			log.warn(
				`Validación de booking fallida: ${JSON.stringify(validation.errors)}`,
			);
			return {
				success: false,
				error: {
					message: "Datos de reserva inválidos",
					fields: validation.errors,
				},
			};
		}

		// Sanitizar datos de contacto
		const guestName = sanitizeText(input.guestName);
		const guestEmail = sanitizeText(input.guestEmail);
		const guestPhone = input.guestPhone
			? sanitizeText(input.guestPhone)
			: undefined;

		const {
			dateRange,
			groupAdults,
			groupTeens,
			groupKids,
			groupInfants,
			groupNotes,
			vehicle,
			...rest
		} = validation.data;

		// vehicleNotes viene del input original, no del validation
		const vehicleNotes = input.vehicleNotes;

		// Expresión regular para capturar las partes
		// Acepta tanto / como - como separadores de fecha (YYYY/MM/DD o YYYY-MM-DD)
		const regex =
			/(\d{4}[-/]\d{2}[-/]\d{2})\s*➜\s*(\d{4}[-/]\d{2}[-/]\d{2})\s*\(([^)]+)\)/;

		// Ejecutamos el match
		const match = dateRange?.match(regex);

		let checkin: string | null = null;
		let checkout: string | null = null;
		let nights: string | null = null;

		if (match) {
			// match[0] es el string completo, los grupos capturados empiezan en match[1]
			checkin = match[1];
			checkout = match[2];
			nights = match[3];
		} else {
			log.warn("No se encontraron coincidencias en dateRange:", dateRange);
		}

		// Procesar vehículos si están incluidos
		const vehicles: { type: string; plate: string }[] = [];
		if (vehicle === "true") {
			for (let i = 1; i <= 5; i++) {
				const type: string | undefined =
					input[`vehicleType${i}` as keyof typeof input];
				const plate: string | undefined =
					input[`vehiclePlate${i}` as keyof typeof input];

				if (type) {
					vehicles.push({
						type: sanitizeText(type),
						plate: plate ? sanitizeText(plate) : "No especificada",
					});
				}
			}
		}

		// Sanitizar notas
		const sanitizedGroupNotes = groupNotes
			? sanitizeText(groupNotes)
			: undefined;
		const sanitizedVehicleNotes = vehicleNotes
			? sanitizeText(vehicleNotes)
			: undefined;

		// Generar número de reserva único
		const bookingNumber = generateBookingNumber();

		// Notificar a canales configurados (no bloqueante)
		notifyAllChannels({
			type:
				vehicles.length > 0 ? "vehicle" : groupAdults ? "group" : "standard",
			checkin,
			checkout,
			nights,
			adults: rest.adults,
			children: rest.children,
			rooms: rest.rooms,
			breakfast: rest.breakfast,
			groupAdults,
			groupTeens,
			groupKids,
			groupInfants,
			groupNotes: sanitizedGroupNotes,
			vehicles,
			vehicleNotes: sanitizedVehicleNotes,
		}).catch((err) => log.error("Error enviando notificaciones:", err));

		// Preparar datos para email de confirmación
		// Nota: En producción, obtener pricePerNight de la base de datos o ERP
		const pricePerNight = 100; // Valor por defecto, debería venir de la habitación seleccionada
		const totalPrice = calculateTotalPrice(
			pricePerNight,
			parseInt(nights || "0"),
			rest.breakfast === "true",
			15,
			parseInt(rest.adults || "2"),
		);

		// Enviar email de confirmación (no bloqueante)
		const lang = context.request.headers
			.get("accept-language")
			?.startsWith("en")
			? "en"
			: "es";
		const emailContent = generateBookingEmailContent(
			{
				bookingNumber,
				checkin: checkin || "N/A",
				checkout: checkout || "N/A",
				nights: parseInt(nights || "0"),
				adults: parseInt(rest.adults || "2"),
				children: parseInt(rest.children || "0"),
				rooms: parseInt(rest.rooms || "1"),
				pricePerNight,
				totalPrice,
				breakfast: rest.breakfast === "true",
				guestName,
				guestEmail,
			},
			lang,
		);

		// Enviar al admin
		sendAdminEmail(
			`Nueva Reserva #${bookingNumber} - ${guestName}`,
			`Reserva recibida de ${guestName} (${guestEmail})\nTel: ${guestPhone || "No proporcionado"}\n${rest.adults} adultos, ${rest.children || 0} niños.\nCheck-in: ${checkin}\nCheck-out: ${checkout}\nNoches: ${nights}`,
		).catch((err) => log.error("Error enviando email al admin:", err));

		// Enviar email de confirmación al huésped
		if (guestEmail && guestEmail.includes("@")) {
			sendBookingConfirmationEmail(
				guestEmail,
				emailContent.subject,
				emailContent.html,
				emailContent.text,
			).catch((err) =>
				log.error("Error enviando email de confirmación al huésped:", err),
			);
		}

		return {
			success: true,
			bookingNumber,
			processing: {
				checkin,
				checkout,
				nights,
				...(groupAdults && { groupAdults }),
				...(groupTeens && { groupTeens }),
				...(groupKids && { groupKids }),
				...(groupInfants && { groupInfants }),
				...(sanitizedGroupNotes && { groupNotes: sanitizedGroupNotes }),
				...(vehicles.length > 0 && { vehicles }),
				vehicleCount: vehicles.length,
				...(sanitizedVehicleNotes && { vehicleNotes: sanitizedVehicleNotes }),
				...rest,
				bookingNumber,
				totalPrice,
			},
		};
	},
});
