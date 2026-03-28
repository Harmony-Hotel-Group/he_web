/**
 * src/adapters/erp/erp-sync.adapter.ts
 *
 * Adapter de sincronización para el sistema ERP.
 * Delega la obtención de datos al servicio api.ts (cache + upstream + fallback).
 *
 * Modos:
 * - mock: usa datos locales JSON (src/data/*.json) — default para desarrollo
 * - real: usa PUBLIC_ERP_BASE_URL como upstream
 *
 * Configuración vía .env:
 * - PUBLIC_ERP_BASE_URL: URL base del ERP
 * - PUBLIC_ERP_MODE: "mock" | "real"
 * - PUBLIC_ERP_TIMEOUT_MS: timeout en ms
 */

import type {
	ERPRoom,
	ERPTour,
	ERPDestination,
	ERPGastronomy,
	ERPHotelData,
	ERPConfig,
} from "@/contracts/erp.contract";
import { api } from "@/services/api";
import { logger } from "@/services/logger";

const log = logger("erp:sync");

const erpConfig: ERPConfig = {
	baseUrl: import.meta.env.PUBLIC_ERP_BASE_URL || "",
	timeout: Number(import.meta.env.PUBLIC_ERP_TIMEOUT_MS || "5000"),
	mode: (import.meta.env.PUBLIC_ERP_MODE as "mock" | "real") || "mock",
	cacheDuration: Number(import.meta.env.PUBLIC_ERP_CACHE_MS || "300000"),
};

/**
 * Obtiene habitaciones (vía api.ts con fallback local)
 */
export async function getRooms(): Promise<ERPRoom[]> {
	const data = await api.fetch<ERPRoom[]>("rooms");
	return Array.isArray(data) ? data : [];
}

/**
 * Obtiene tours (vía api.ts con fallback local)
 */
export async function getTours(): Promise<ERPTour[]> {
	const data = await api.fetch<ERPTour[]>("tours");
	return Array.isArray(data) ? data : [];
}

/**
 * Obtiene destinos (vía api.ts con fallback local)
 */
export async function getDestinations(): Promise<ERPDestination[]> {
	const data = await api.fetch<ERPDestination[]>("destinations");
	return Array.isArray(data) ? data : [];
}

/**
 * Obtiene gastronomía (vía api.ts con fallback local)
 */
export async function getGastronomy(): Promise<ERPGastronomy[]> {
	const data = await api.fetch<ERPGastronomy[]>("gastronomy");
	return Array.isArray(data) ? data : [];
}

/**
 * Obtiene todos los datos del hotel en paralelo
 */
export async function getAllHotelData(): Promise<ERPHotelData> {
	const [rooms, tours, destinations, gastronomy] = await Promise.all([
		getRooms(),
		getTours(),
		getDestinations(),
		getGastronomy(),
	]);

	return {
		rooms,
		tours,
		destinations,
		gastronomy,
		metadata: {
			lastSync: new Date().toISOString(),
			version: "1.0.0",
			totalRecords:
				rooms.length + tours.length + destinations.length + gastronomy.length,
		},
	};
}

/**
 * Estado de la configuración ERP
 */
export function getSyncStatus() {
	return {
		mode: erpConfig.mode,
		baseUrl: erpConfig.baseUrl || "(not configured)",
	};
}
