/**
 * src/contracts/erp.contract.ts
 * 
 * Contratos de tipo para la integración con el sistema ERP.
 * Define las interfaces que el ERP debe implementar.
 */

// ============== Tipos de Habitaciones ==============

export interface ERPRoom {
  id: string;
  name: string;
  slug: string;
  description: string;
  maxOccupancy: number;
  bedType: 'single' | 'double' | 'queen' | 'king' | 'multiple';
  amenities: string[];
  images: string[];
  basePrice: number;
  currency: 'USD' | 'EUR';
  availability: ERPAvailability;
}

export interface ERPAvailability {
  totalRooms: number;
  availableRooms: number;
  nextAvailable: string; // ISO date
}

// ============== Tipos de Tours ==============

export interface ERPTour {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: string;
  category: 'city' | 'nature' | 'adventure' | 'cultural';
  location: ERPLocation;
  included: string[];
  notIncluded: string[];
  images: string[];
  price: number;
  currency: 'USD' | 'EUR';
  schedule: ERPSchedule[];
}

export interface ERPLocation {
  address: string;
  city: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ERPSchedule {
  day: string;
  time: string;
  available: boolean;
}

// ============== Tipos de Destinos ==============

export interface ERPDestination {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'beach' | 'mountain' | 'city' | 'nature_reserve';
  location: ERPLocation;
  images: string[];
  attractions: string[];
}

// ============== Tipos de Gastronomía ==============

export interface ERPGastronomy {
  id: string;
  name: string;
  description: string;
  category: 'main_course' | 'dessert' | 'drink' | 'breakfast';
  price: number;
  currency: 'USD' | 'EUR';
  images: string[];
  available: boolean;
}

// ============== Tipos de Respuesta ERP ==============

export interface ERPResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  cacheValidUntil?: string;
}

export interface ERPMetadata {
  lastSync: string;
  version: string;
  totalRecords: number;
}

// ============== Tipos de Configuración ==============

export interface ERPConfig {
  baseUrl: string;
  timeout: number;
  apiKey?: string;
  mode: 'mock' | 'real';
  cacheDuration: number;
}

// ============== Endpoints del ERP ==============

export type ERPEndpoint = 
  | 'rooms'
  | 'room/:slug'
  | 'tours'
  | 'tour/:slug'
  | 'destinations'
  | 'destination/:slug'
  | 'gastronomy'
  | 'availability/:roomId/:date'
  | 'prices/:roomId';

// ============== Utilidades de Tipos ==============

/**
 * Verifica si la respuesta del ERP es exitosa
 */
export function isERPResponseSuccess<T>(response: ERPResponse<T>): boolean {
  return response.success && response.data !== undefined;
}

/**
 * Tipo para datos del hotel completos
 */
export interface ERPHotelData {
  rooms: ERPRoom[];
  tours: ERPTour[];
  destinations: ERPDestination[];
  gastronomy: ERPGastronomy[];
  metadata: ERPMetadata;
}
