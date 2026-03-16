/**
 * Tests de integración para el ERP adapter
 * 
 * Nota: Estos tests requieren que los archivos JSON locales existan
 * en src/data/
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getRooms, 
  getTours, 
  getDestinations, 
  getGastronomy,
  getAllHotelData,
  getSyncStatus,
  refreshCache 
} from '@/adapters/erp/erp-sync.adapter';
import * as fs from 'node:fs';
import path from 'node:path';

describe('erp-sync.adapter', () => {
  describe('getSyncStatus', () => {
    it('debería retornar el estado de sincronización', () => {
      const status = getSyncStatus();
      
      expect(status).toHaveProperty('mode');
      expect(status).toHaveProperty('cacheDir');
      expect(status.mode).toBeDefined();
    });
  });

  describe('getRooms', () => {
    it('debería retornar un array de habitaciones', async () => {
      const rooms = await getRooms();
      
      // Si existen datos locales, debería retornarlos
      expect(Array.isArray(rooms)).toBe(true);
    });

    it('debería tener estructura correcta si hay datos', async () => {
      const rooms = await getRooms();
      
      if (rooms.length > 0) {
        const room = rooms[0];
        expect(room).toHaveProperty('id');
        expect(room).toHaveProperty('name');
        expect(room).toHaveProperty('slug');
        expect(room).toHaveProperty('basePrice');
      }
    });
  });

  describe('getTours', () => {
    it('debería retornar un array de tours', async () => {
      const tours = await getTours();
      expect(Array.isArray(tours)).toBe(true);
    });

    it('debería tener estructura correcta si hay datos', async () => {
      const tours = await getTours();
      
      if (tours.length > 0) {
        const tour = tours[0];
        expect(tour).toHaveProperty('id');
        expect(tour).toHaveProperty('name');
        expect(tour).toHaveProperty('price');
      }
    });
  });

  describe('getDestinations', () => {
    it('debería retornar un array de destinos', async () => {
      const destinations = await getDestinations();
      expect(Array.isArray(destinations)).toBe(true);
    });

    it('debería tener estructura correcta si hay datos', async () => {
      const destinations = await getDestinations();
      
      if (destinations.length > 0) {
        const destination = destinations[0];
        expect(destination).toHaveProperty('id');
        expect(destination).toHaveProperty('name');
        expect(destination).toHaveProperty('category');
      }
    });
  });

  describe('getGastronomy', () => {
    it('debería retornar un array de opciones gastronómicas', async () => {
      const gastronomy = await getGastronomy();
      expect(Array.isArray(gastronomy)).toBe(true);
    });

    it('debería tener estructura correcta si hay datos', async () => {
      const gastronomy = await getGastronomy();
      
      if (gastronomy.length > 0) {
        const item = gastronomy[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('price');
      }
    });
  });

  describe('getAllHotelData', () => {
    it('debería retornar todos los datos del hotel', async () => {
      const hotelData = await getAllHotelData();
      
      expect(hotelData).toHaveProperty('rooms');
      expect(hotelData).toHaveProperty('tours');
      expect(hotelData).toHaveProperty('destinations');
      expect(hotelData).toHaveProperty('gastronomy');
      expect(hotelData).toHaveProperty('metadata');
    });

    it('debería incluir metadatos de sincronización', async () => {
      const hotelData = await getAllHotelData();
      
      expect(hotelData.metadata).toHaveProperty('lastSync');
      expect(hotelData.metadata).toHaveProperty('version');
      expect(hotelData.metadata).toHaveProperty('totalRecords');
    });
  });

  describe('refreshCache', () => {
    it('debería ejecutarse sin errores', async () => {
      // No debería lanzar errores aunque el ERP no esté disponible
      await expect(refreshCache()).resolves.not.toThrow();
    });
  });
});
