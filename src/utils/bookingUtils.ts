// src/utils/bookingUtils.ts
/**
 * Utilidades para gestión de reservas
 */

import { logger } from "@/services/logger";

const log = logger("BookingUtils");

/**
 * Genera un número de reserva único
 * Formato: RES-YYYYMMDD-XXXX (ej: RES-20260401-A3F7)
 *
 * @param date - Fecha de generación (default: ahora)
 * @returns Número de reserva único
 */
export function generateBookingNumber(date: Date = new Date()): string {
	// Formato de fecha
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const datePart = `${year}${month}${day}`;

	// Generar código aleatorio de 4 caracteres usando Math.random
	const code = Math.random().toString(16).substring(2, 6).toUpperCase();

	const bookingNumber = `RES-${datePart}-${code}`;

	log.info(`Número de reserva generado: ${bookingNumber}`);

	return bookingNumber;
}

/**
 * Calcula el número de noches entre dos fechas
 * @param checkin - Fecha de check-in
 * @param checkout - Fecha de check-out
 * @returns Número de noches
 */
export function calculateNights(checkin: string, checkout: string): number {
	const checkinDate = new Date(checkin);
	const checkoutDate = new Date(checkout);

	const diffTime = Math.abs(checkoutDate.getTime() - checkinDate.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	return diffDays;
}

/**
 * Calcula el precio total de una reserva
 * @param pricePerNight - Precio por noche
 * @param nights - Número de noches
 * @param includeBreakfast - Si incluye desayuno
 * @param breakfastPrice - Precio del desayuno (default: 15)
 * @param adults - Número de adultos
 * @returns Precio total
 */
export function calculateTotalPrice(
	pricePerNight: number,
	nights: number,
	includeBreakfast: boolean = false,
	breakfastPrice: number = 15,
	adults: number = 2,
): number {
	const roomTotal = pricePerNight * nights;
	const breakfastTotal = includeBreakfast
		? breakfastPrice * adults * nights
		: 0;

	return roomTotal + breakfastTotal;
}

/**
 * Formatea un precio para mostrar
 * @param amount - Cantidad en USD
 * @param locale - Locale (default: es-EC)
 * @returns Precio formateado
 */
export function formatPrice(amount: number, locale: string = "es-EC"): string {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
}

/**
 * Valida si una fecha es válida para reserva
 * @param date - Fecha a validar
 * @returns true si es válida
 */
export function isValidDate(date: string): boolean {
	const parsed = new Date(date);
	return !isNaN(parsed.getTime()) && parsed >= new Date();
}

/**
 * Genera un resumen de reserva para email
 */
export interface BookingSummary {
	bookingNumber: string;
	checkin: string;
	checkout: string;
	nights: number;
	adults: number;
	children: number;
	rooms: number;
	roomType?: string;
	pricePerNight: number;
	totalPrice: number;
	breakfast: boolean;
	guestName?: string;
	guestEmail?: string;
	guestPhone?: string;
	specialRequests?: string;
}

/**
 * Genera contenido de email para confirmación de reserva
 * @param summary - Resumen de la reserva
 * @param lang - Idioma (es/en)
 * @returns Contenido del email
 */
export function generateBookingEmailContent(
	summary: BookingSummary,
	lang: string = "es",
): { subject: string; html: string; text: string } {
	const texts = {
		es: {
			subject: `Confirmación de Reserva #${summary.bookingNumber}`,
			greeting: "¡Gracias por tu reserva!",
			bookingNumber: "Número de Reserva",
			details: "Detalles de tu Reserva",
			checkin: "Fecha de Llegada",
			checkout: "Fecha de Salida",
			nights: "Noches",
			guests: "Huéspedes",
			adults: "Adultos",
			children: "Niños",
			rooms: "Habitaciones",
			roomType: "Tipo de Habitación",
			pricePerNight: "Precio por Noche",
			breakfast: "Desayuno",
			yes: "Sí",
			no: "No",
			totalPrice: "Precio Total",
			specialRequests: "Peticiones Especiales",
			none: "Ninguna",
			nextSteps: "Próximos Pasos",
			nextStepsText:
				"Nos pondremos en contacto contigo dentro de las próximas 24 horas para confirmar la disponibilidad y procesar tu reserva.",
			contact: "Si tienes alguna pregunta, no dudes en contactarnos:",
			phone: "Teléfono",
			email: "Email",
			footer: "Este es un correo automático, por favor no respondas.",
		},
		en: {
			subject: `Booking Confirmation #${summary.bookingNumber}`,
			greeting: "Thank you for your booking!",
			bookingNumber: "Booking Number",
			details: "Booking Details",
			checkin: "Check-in Date",
			checkout: "Check-out Date",
			nights: "Nights",
			guests: "Guests",
			adults: "Adults",
			children: "Children",
			rooms: "Rooms",
			roomType: "Room Type",
			pricePerNight: "Price per Night",
			breakfast: "Breakfast",
			yes: "Yes",
			no: "No",
			totalPrice: "Total Price",
			specialRequests: "Special Requests",
			none: "None",
			nextSteps: "Next Steps",
			nextStepsText:
				"We will contact you within the next 24 hours to confirm availability and process your booking.",
			contact: "If you have any questions, feel free to contact us:",
			phone: "Phone",
			email: "Email",
			footer: "This is an automated email, please do not reply.",
		},
	};

	const t = texts[lang as "es" | "en"] || texts.es;

	const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; text-align: center; }
        .booking-number { font-size: 24px; font-weight: bold; margin-top: 10px; }
        .content { padding: 30px 20px; background: #f9f9f9; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #666; }
        .value { color: #1a1a2e; }
        .total { font-size: 18px; font-weight: bold; color: #d97706; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
        .button { display: inline-block; background: #d97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏨 Hotel Ensueños</h1>
            <p>${t.greeting}</p>
            <div class="booking-number">${t.bookingNumber}: ${summary.bookingNumber}</div>
        </div>
        
        <div class="content">
            <h2>${t.details}</h2>
            
            <div class="details">
                <div class="detail-row">
                    <span class="label">${t.checkin}:</span>
                    <span class="value">${summary.checkin}</span>
                </div>
                <div class="detail-row">
                    <span class="label">${t.checkout}:</span>
                    <span class="value">${summary.checkout}</span>
                </div>
                <div class="detail-row">
                    <span class="label">${t.nights}:</span>
                    <span class="value">${summary.nights}</span>
                </div>
                <div class="detail-row">
                    <span class="label">${t.guests}:</span>
                    <span class="value">${t.adults}: ${summary.adults}${summary.children > 0 ? ` | ${t.children}: ${summary.children}` : ""}</span>
                </div>
                <div class="detail-row">
                    <span class="label">${t.rooms}:</span>
                    <span class="value">${summary.rooms}</span>
                </div>
                ${
									summary.roomType
										? `
                <div class="detail-row">
                    <span class="label">${t.roomType}:</span>
                    <span class="value">${summary.roomType}</span>
                </div>
                `
										: ""
								}
                <div class="detail-row">
                    <span class="label">${t.breakfast}:</span>
                    <span class="value">${summary.breakfast ? t.yes : t.no}</span>
                </div>
                <div class="detail-row">
                    <span class="label">${t.pricePerNight}:</span>
                    <span class="value">${formatPrice(summary.pricePerNight)}</span>
                </div>
                ${
									summary.specialRequests
										? `
                <div class="detail-row">
                    <span class="label">${t.specialRequests}:</span>
                    <span class="value">${summary.specialRequests}</span>
                </div>
                `
										: ""
								}
                <div class="detail-row total">
                    <span class="label">${t.totalPrice}:</span>
                    <span class="value">${formatPrice(summary.totalPrice)}</span>
                </div>
            </div>
            
            <h3>${t.nextSteps}</h3>
            <p>${t.nextStepsText}</p>
            
            <a href="https://hotelensuenos.com/booking" class="button">Ver mi reserva</a>
            
            <h3>${t.contact}</h3>
            <p>📞 ${t.phone}: +593 97 888 8020</p>
            <p>📧 ${t.email}: reservas@hotelensuenos.com</p>
        </div>
        
        <div class="footer">
            <p>${t.footer}</p>
            <p>© ${new Date().getFullYear()} Hotel Ensueños. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
    `.trim();

	const text = `
${t.greeting}

${t.bookingNumber}: ${summary.bookingNumber}

${t.details}
${t.checkin}: ${summary.checkin}
${t.checkout}: ${summary.checkout}
${t.nights}: ${summary.nights}
${t.guests}: ${t.adults}: ${summary.adults}${summary.children > 0 ? ` | ${t.children}: ${summary.children}` : ""}
${t.rooms}: ${summary.rooms}
${summary.roomType ? `${t.roomType}: ${summary.roomType}` : ""}
${t.breakfast}: ${summary.breakfast ? t.yes : t.no}
${t.pricePerNight}: ${formatPrice(summary.pricePerNight)}
${summary.specialRequests ? `${t.specialRequests}: ${summary.specialRequests}` : ""}
${t.totalPrice}: ${formatPrice(summary.totalPrice)}

${t.nextSteps}
${t.nextStepsText}

${t.contact}
📞 ${t.phone}: +593 97 888 8020
📧 ${t.email}: reservas@hotelensuenos.com

${t.footer}
© ${new Date().getFullYear()} Hotel Ensueños
    `.trim();

	return {
		subject: t.subject,
		html,
		text,
	};
}
