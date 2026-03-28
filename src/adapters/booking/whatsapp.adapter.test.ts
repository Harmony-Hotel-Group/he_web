/**
 * Tests para src/adapters/booking/whatsapp.adapter.ts
 */
import { describe, it, expect } from 'vitest';
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  validateBookingData,
} from '@/adapters/booking/whatsapp.adapter';

describe('whatsapp.adapter', () => {
  describe('buildWhatsAppMessage', () => {
    const baseData = {
      guestName: 'Juan Pérez',
      checkin: '2024-12-01',
      checkout: '2024-12-05',
      rooms: 2,
      adults: 4,
      children: 1,
      breakfast: true,
    };

    it('debería crear mensaje de reservación estándar', () => {
      const message = buildWhatsAppMessage({
        type: 'standard',
        data: baseData,
      });

      expect(message).toContain('NUEVA RESERVACIÓN');
      expect(message).toContain('Juan Pérez');
      expect(message).toContain('*Noches:* 4');
      expect(message).toContain('*Habitaciones:* 2');
    });

    it('debería crear mensaje grupal', () => {
      const message = buildWhatsAppMessage({
        type: 'group',
        data: baseData,
      });

      expect(message).toContain('RESERVACIÓN GRUPAL');
    });

    it('debería crear mensaje con vehículo', () => {
      const message = buildWhatsAppMessage({
        type: 'vehicle',
        data: {
          ...baseData,
          vehicleType: 'Sedan',
          vehiclePlate: 'ABC-1234',
        },
        vehicleCount: 1,
      });

      expect(message).toContain('VEHÍCULO');
      expect(message).toContain('ABC-1234');
    });
  });

  describe('buildWhatsAppUrl', () => {
    it('debería construir URL correctamente', () => {
      const url = buildWhatsAppUrl('593999999999', 'Hola');
      expect(url).toContain('wa.me/593999999999');
      expect(url).toContain('Hola');
    });

    it('debería codificar mensaje', () => {
      const url = buildWhatsAppUrl('593999999999', 'Hola Mundo');
      expect(url).toContain('Hola%20Mundo');
    });
  });

  describe('validateBookingData', () => {
    it('debería validar datos correctos', () => {
      const validData = {
        guestName: 'Juan',
        checkin: '2024-12-01',
        checkout: '2024-12-05',
        rooms: 1,
        adults: 2,
      };

      expect(validateBookingData(validData)).toBe(true);
    });

    it('debería rechazar nombre vacío', () => {
      const invalidData = {
        guestName: '',
        checkin: '2024-12-01',
        checkout: '2024-12-05',
        rooms: 1,
        adults: 2,
      };

      expect(validateBookingData(invalidData)).toBe(false);
    });

    it('debería rechazar fechas inválidas', () => {
      const invalidData = {
        guestName: 'Juan',
        checkin: 'fecha-invalida',
        checkout: '2024-12-05',
        rooms: 1,
        adults: 2,
      };

      expect(validateBookingData(invalidData)).toBe(false);
    });

    it('debería rechazar habitaciones < 1', () => {
      const invalidData = {
        guestName: 'Juan',
        checkin: '2024-12-01',
        checkout: '2024-12-05',
        rooms: 0,
        adults: 2,
      };

      expect(validateBookingData(invalidData)).toBe(false);
    });
  });
});
