/**
 * src/adapters/booking/whatsapp.adapter.ts
 * 
 * Adapter centralizado para construir mensajes de WhatsApp.
 * Este módulo es la única fuente de verdad para construir mensajes de reserva.
 * 
 * Uso:
 * import { buildWhatsAppMessage } from '@/adapters/booking/whatsapp.adapter';
 * 
 * const message = buildWhatsAppMessage({
 *   type: 'booking',
 *   guestName: 'Juan Pérez',
 *   checkin: '2024-12-01',
 *   checkout: '2024-12-05',
 *   rooms: 2,
 *   adults: 4,
 *   children: 1
 * });
 */

export type BookingType = 'standard' | 'group' | 'vehicle';

export interface BookingData {
  /** Nombre del huésped */
  guestName: string;
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
  if (isNaN(date.getTime())) return dateStr;
  
  return date.toLocaleDateString('es-EC', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Calcula el número de noches entre dos fechas
 */
function calculateNights(checkin: string, checkout: string): number {
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Construye el mensaje de WhatsApp para una reservación estándar
 */
function buildStandardMessage(data: BookingData): string {
  const nights = calculateNights(data.checkin, data.checkout);
  const breakfastText = data.breakfast ? '✅ Incluido' : '❌ No incluido';
  
  let message = `🏨 *NUEVA RESERVACIÓN - Hotel Ensueños*\n\n`;
  message += `👤 *Huésped:* ${data.guestName}\n`;
  message += `📅 *Check-in:* ${formatDate(data.checkin)}\n`;
  message += `📅 *Check-out:* ${formatDate(data.checkout)}\n`;
  message += `🌙 *Noches:* ${nights}\n`;
  message += `🚪 *Habitaciones:* ${data.rooms}\n`;
  message += `👨‍👩‍👧 *Adultos:* ${data.adults}\n`;
  
  if (data.children && data.children > 0) {
    message += `👶 *Niños:* ${data.children}\n`;
  }
  
  message += `🍳 *Desayuno:* ${breakfastText}\n`;
  
  if (data.notes) {
    message += `\n📝 *Notas:* ${data.notes}\n`;
  }
  
  message += `\n_Reserva generada desde hotelensueños.com_`;
  
  return message;
}

/**
 * Construye el mensaje de WhatsApp para una reservación grupal
 */
function buildGroupMessage(data: BookingData): string {
  const nights = calculateNights(data.checkin, data.checkout);
  
  let message = `🏨 *NUEVA RESERVACIÓN GRUPAL - Hotel Ensueños*\n\n`;
  message += `👤 *Huésped:* ${data.guestName}\n`;
  message += `📅 *Check-in:* ${formatDate(data.checkin)}\n`;
  message += `📅 *Check-out:* ${formatDate(data.checkout)}\n`;
  message += `🌙 *Noches:* ${nights}\n`;
  message += `👨‍👩‍👧 *Adultos:* ${data.adults}\n`;
  
  if (data.children && data.children > 0) {
    message += `👶 *Niños:* ${data.children}\n`;
  }
  
  if (data.notes) {
    message += `\n📝 *Notas:* ${data.notes}\n`;
  }
  
  message += `\n_Reserva grupal generada desde hotelensueños.com_`;
  
  return message;
}

/**
 * Construye el mensaje de WhatsApp para reservación con vehículo
 */
function buildVehicleMessage(data: BookingData, vehicleCount: number = 1, vehicleNotes?: string): string {
  const nights = calculateNights(data.checkin, data.checkout);
  
  let message = `🏨 *NUEVA RESERVACIÓN CON VEHÍCULO - Hotel Ensueños*\n\n`;
  message += `👤 *Huésped:* ${data.guestName}\n`;
  message += `📅 *Check-in:* ${formatDate(data.checkin)}\n`;
  message += `📅 *Check-out:* ${formatDate(data.checkout)}\n`;
  message += `🌙 *Noches:* ${nights}\n`;
  message += `🚗 *Vehículos:* ${vehicleCount}\n`;
  
  if (data.vehicleType) {
    message += `🚙 *Tipo:* ${data.vehicleType}\n`;
  }
  
  if (data.vehiclePlate) {
    message += `🔖 *Placa:* ${data.vehiclePlate}\n`;
  }
  
  if (vehicleNotes) {
    message += `\n📝 *Notas de vehículos:* ${vehicleNotes}\n`;
  }
  
  message += `\n_Reserva con vehículo generada desde hotelensueños.com_`;
  
  return message;
}

/**
 * Función principal para construir mensajes de WhatsApp
 * 
 * @param options - Opciones del mensaje
 * @returns El mensaje formateado para WhatsApp
 */
export function buildWhatsAppMessage(options: WhatsAppMessageOptions): string {
  const { type, data, includeVehicle = false, vehicleCount = 0, vehicleNotes } = options;
  
  switch (type) {
    case 'group':
      return buildGroupMessage(data);
    
    case 'vehicle':
      return buildVehicleMessage(data, vehicleCount, vehicleNotes);
    
    case 'standard':
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
export function buildContactMessage(hotelName: string = "Hotel Ensueños"): string {
  return `Hola, estoy interesado en reservar una habitación en ${hotelName}.`;
}

/**
 * Valida que los datos de la reservación tengan los campos requeridos
 *
 * @param data - Datos de la reservación
 * @returns true si los datos son válidos
 */
export function validateBookingData(data: BookingData): boolean {
  if (!data.guestName || data.guestName.trim() === '') return false;
  if (!data.checkin || !data.checkout) return false;
  if (data.rooms < 1 || data.adults < 1) return false;

  // Validar formato de fecha
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(data.checkin) || !dateRegex.test(data.checkout)) return false;

  return true;
}
