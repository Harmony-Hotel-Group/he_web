// src/utils/availability.ts
/**
 * Sistema de disponibilidad de habitaciones
 * Implementación básica en memoria (para producción usar base de datos)
 */

import { logger } from "@/services/logger";

const log = logger("Availability");

// Tipo para reservas almacenadas
export interface Booking {
	id: string;
	bookingNumber: string;
	roomId: string;
	checkin: string; // YYYY-MM-DD
	checkout: string; // YYYY-MM-DD
	nights?: number;
	adults?: number;
	children?: number;
	rooms?: number;
	status: "confirmed" | "pending" | "cancelled";
	totalPrice?: number;
	guestName?: string;
	guestEmail?: string;
	createdAt: Date;
}

// Almacenamiento en memoria (para producción usar DB)
const bookingsStore = new Map<string, Booking>();

/**
 * Verifica si una habitación está disponible para un rango de fechas
 * @param roomId - ID de la habitación
 * @param checkin - Fecha de check-in
 * @param checkout - Fecha de check-out
 * @returns true si está disponible
 */
export function isRoomAvailable(
	roomId: string,
	checkin: string,
	checkout: string,
	excludeBookingId?: string,
): boolean {
	const checkinDate = new Date(checkin);
	const checkoutDate = new Date(checkout);

	// Verificar todas las reservas
	for (const booking of bookingsStore.values()) {
		// Saltar la reserva actual si se está modificando
		if (excludeBookingId && booking.id === excludeBookingId) {
			continue;
		}

		// Solo verificar reservas confirmadas o pendientes
		if (booking.status === "cancelled") {
			continue;
		}

		// Solo verificar la misma habitación
		if (booking.roomId !== roomId) {
			continue;
		}

		const bookingCheckin = new Date(booking.checkin);
		const bookingCheckout = new Date(booking.checkout);

		// Verificar superposición de fechas
		// Hay superposición si: (checkin < bookingCheckout) Y (checkout > bookingCheckin)
		const hasOverlap =
			checkinDate < bookingCheckout && checkoutDate > bookingCheckin;

		if (hasOverlap) {
			log.warn(
				`Room ${roomId} not available: overlaps with booking ${booking.bookingNumber}`,
			);
			return false;
		}
	}

	log.info(`Room ${roomId} is available for ${checkin} to ${checkout}`);
	return true;
}

/**
 * Obtiene todas las reservas para una habitación en un rango de fechas
 * @param roomId - ID de la habitación
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns Array de reservas
 */
export function getBookingsForRoom(
	roomId: string,
	startDate: string,
	endDate: string,
): Booking[] {
	const start = new Date(startDate);
	const end = new Date(endDate);

	const result: Booking[] = [];

	for (const booking of bookingsStore.values()) {
		if (booking.roomId !== roomId) {
			continue;
		}

		if (booking.status === "cancelled") {
			continue;
		}

		const bookingCheckin = new Date(booking.checkin);
		const bookingCheckout = new Date(booking.checkout);

		// Verificar si la reserva está dentro del rango
		if (bookingCheckin <= end && bookingCheckout >= start) {
			result.push(booking);
		}
	}

	return result;
}

/**
 * Agrega una reserva al sistema
 * @param booking - Datos de la reserva
 * @returns true si se agregó correctamente
 */
export function addBooking(booking: Booking): boolean {
	// Verificar disponibilidad antes de agregar
	const available = isRoomAvailable(
		booking.roomId,
		booking.checkin,
		booking.checkout,
	);

	if (!available) {
		log.warn(`Cannot add booking ${booking.bookingNumber}: room not available`);
		return false;
	}

	bookingsStore.set(booking.id, booking);
	log.info(`Booking ${booking.bookingNumber} added successfully`);
	return true;
}

/**
 * Actualiza una reserva existente
 * @param bookingId - ID de la reserva
 * @param updates - Datos a actualizar
 * @returns true si se actualizó correctamente
 */
export function updateBooking(
	bookingId: string,
	updates: Partial<Booking>,
): boolean {
	const existing = bookingsStore.get(bookingId);

	if (!existing) {
		log.warn(`Cannot update booking ${bookingId}: not found`);
		return false;
	}

	// Si se actualizan fechas, verificar disponibilidad
	if (updates.checkin || updates.checkout) {
		const newCheckin = updates.checkin || existing.checkin;
		const newCheckout = updates.checkout || existing.checkout;

		const available = isRoomAvailable(
			existing.roomId,
			newCheckin,
			newCheckout,
			bookingId,
		);

		if (!available) {
			log.warn(
				`Cannot update booking ${bookingId}: room not available for new dates`,
			);
			return false;
		}
	}

	const updated: Booking = { ...existing, ...updates };
	bookingsStore.set(bookingId, updated);
	log.info(`Booking ${bookingId} updated successfully`);
	return true;
}

/**
 * Cancela una reserva
 * @param bookingId - ID de la reserva
 * @returns true si se canceló correctamente
 */
export function cancelBooking(bookingId: string): boolean {
	const existing = bookingsStore.get(bookingId);

	if (!existing) {
		log.warn(`Cannot cancel booking ${bookingId}: not found`);
		return false;
	}

	existing.status = "cancelled";
	bookingsStore.set(bookingId, existing);
	log.info(`Booking ${bookingId} cancelled successfully`);
	return true;
}

/**
 * Obtiene una reserva por su ID
 * @param bookingId - ID de la reserva
 * @returns La reserva o undefined
 */
export function getBookingById(bookingId: string): Booking | undefined {
	return bookingsStore.get(bookingId);
}

/**
 * Obtiene una reserva por su número
 * @param bookingNumber - Número de reserva
 * @returns La reserva o undefined
 */
export function getBookingByNumber(bookingNumber: string): Booking | undefined {
	for (const booking of bookingsStore.values()) {
		if (booking.bookingNumber === bookingNumber) {
			return booking;
		}
	}
	return undefined;
}

/**
 * Obtiene todas las reservas
 * @param status - Filtrar por estado (opcional)
 * @returns Array de reservas
 */
export function getAllBookings(status?: Booking["status"]): Booking[] {
	const all = Array.from(bookingsStore.values());

	if (status) {
		return all.filter((b) => b.status === status);
	}

	return all;
}

/**
 * Obtiene fechas bloqueadas para una habitación en un rango
 * @param roomId - ID de la habitación
 * @param startDate - Fecha de inicio del rango
 * @param endDate - Fecha de fin del rango
 * @returns Array de fechas bloqueadas (checkins y checkouts)
 */
export function getBlockedDates(
	roomId: string,
	startDate: string,
	endDate: string,
): { checkin: string; checkout: string; bookingNumber: string }[] {
	const bookings = getBookingsForRoom(roomId, startDate, endDate);

	return bookings.map((b) => ({
		checkin: b.checkin,
		checkout: b.checkout,
		bookingNumber: b.bookingNumber,
	}));
}

/**
 * Limpia reservas canceladas antiguas (más de 30 días)
 */
export function cleanupOldBookings(): void {
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	for (const [id, booking] of bookingsStore.entries()) {
		if (
			booking.status === "cancelled" &&
			new Date(booking.createdAt) < thirtyDaysAgo
		) {
			bookingsStore.delete(id);
			log.info(`Cleaned up old cancelled booking ${booking.bookingNumber}`);
		}
	}
}

// Ejecutar limpieza cada 24 horas
if (typeof setInterval !== "undefined") {
	setInterval(cleanupOldBookings, 24 * 60 * 60 * 1000);
}
