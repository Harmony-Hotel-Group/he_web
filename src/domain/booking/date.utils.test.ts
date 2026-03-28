/**
 * Tests para src/domain/booking/date.utils.ts
 */
import { describe, it, expect } from 'vitest';
import {
  calculateNights,
  isValidDateRange,
  isValidCheckin,
  parseDateRange,
  formatDate,
  formatDateRange,
  validateDates,
  getToday,
  DATE_REGEX,
  DATE_RANGE_REGEX,
} from '@/domain/booking/date.utils';

describe('date.utils', () => {
  describe('calculateNights', () => {
    it('debería calcular correctamente las noches', () => {
      expect(calculateNights('2024-12-01', '2024-12-05')).toBe(4);
      expect(calculateNights('2024-12-01', '2024-12-01')).toBe(0);
      expect(calculateNights('2024-12-01', '2024-12-02')).toBe(1);
    });

    it('debería manejar fechas inválidas', () => {
      expect(calculateNights('invalid', '2024-12-05')).toBe(0);
      expect(calculateNights('2024-12-01', 'invalid')).toBe(0);
    });
  });

  describe('isValidDateRange', () => {
    it('debería validar rangos de fechas correctos', () => {
      expect(isValidDateRange('2024-12-01', '2024-12-05')).toBe(true);
    });

    it('debería rechazar check-out antes de check-in', () => {
      expect(isValidDateRange('2024-12-05', '2024-12-01')).toBe(false);
    });

    it('debería rechazar fechas inválidas', () => {
      expect(isValidDateRange('invalid', '2024-12-05')).toBe(false);
    });

    it('debería rechazar menos de 1 noche', () => {
      expect(isValidDateRange('2024-12-01', '2024-12-01')).toBe(false);
    });
  });

  describe('isValidCheckin', () => {
    it('debería aceptar fechas futuras o de hoy', () => {
      const today = getToday();
      expect(isValidCheckin(today)).toBe(true);
      expect(isValidCheckin('2030-01-01')).toBe(true);
    });

    it('debería rechazar fechas pasadas', () => {
      expect(isValidCheckin('2020-01-01')).toBe(false);
    });
  });

  describe('parseDateRange', () => {
    it('debería parsear formato correcto', () => {
      const result = parseDateRange('2024/12/01 ➜ 2024/12/05 (4 noches)');
      expect(result).not.toBeNull();
      expect(result?.checkin).toBe('2024-12-01');
      expect(result?.checkout).toBe('2024-12-05');
      expect(result?.nights).toBe(4);
    });

    it('debería manejar separador -', () => {
      const result = parseDateRange('2024-12-01 ➜ 2024-12-05 (4 noches)');
      expect(result).not.toBeNull();
      expect(result?.checkin).toBe('2024-12-01');
    });

    it('debería retornar null para formato inválido', () => {
      expect(parseDateRange('formato-invalido')).toBeNull();
    });
  });

  describe('validateDates', () => {
    it('debería retornar array vacío para fechas válidas', () => {
      const futureCheckin = new Date();
      futureCheckin.setDate(futureCheckin.getDate() + 30);
      const futureCheckout = new Date();
      futureCheckout.setDate(futureCheckout.getDate() + 34);
      const checkin = futureCheckin.toISOString().split('T')[0];
      const checkout = futureCheckout.toISOString().split('T')[0];
      const errors = validateDates(checkin, checkout);
      expect(errors).toHaveLength(0);
    });

    it('debería validar fechas requeridas', () => {
      expect(validateDates('', '')).toContain('La fecha de check-in es requerida');
      expect(validateDates('2024-12-01', '')).toContain('La fecha de checkout es requerida');
    });
  });

  describe('formatDate', () => {
    it('debería formatear fecha correctamente', () => {
      const formatted = formatDate('2024-12-01', 'es-EC');
      expect(formatted).toContain('dic');
      expect(formatted).toContain('2024');
    });
  });

  describe('formatDateRange', () => {
    it('debería formatear rango correctamente', () => {
      const formatted = formatDateRange('2024-12-01', '2024-12-05', 4);
      expect(formatted).toContain('2024-12-01');
      expect(formatted).toContain('2024-12-05');
      expect(formatted).toContain('4 noches');
    });

    it('debería usar "noche" para 1 noche', () => {
      const formatted = formatDateRange('2024-12-01', '2024-12-02', 1);
      expect(formatted).toContain('1 noche');
    });
  });
});
