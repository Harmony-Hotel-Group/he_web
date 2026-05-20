/**
 * Tests para el ERP adapter (consolidado)
 */
import { describe, expect, it } from "vitest";
import {
	getAllHotelData,
	getDestinations,
	getGastronomy,
	getRooms,
	getSyncStatus,
	getTours,
} from "@/adapters/erp/erp-sync.adapter";

describe("erp-sync.adapter", () => {
	describe("getSyncStatus", () => {
		it("debería retornar el estado de configuración", () => {
			const status = getSyncStatus();
			expect(status).toHaveProperty("mode");
			expect(status).toHaveProperty("baseUrl");
		});
	});

	describe("getRooms", () => {
		it("debería retornar un array", async () => {
			const rooms = await getRooms();
			expect(Array.isArray(rooms)).toBe(true);
		});
	});

	describe("getTours", () => {
		it("debería retornar un array", async () => {
			const tours = await getTours();
			expect(Array.isArray(tours)).toBe(true);
		});
	});

	describe("getDestinations", () => {
		it("debería retornar un array", async () => {
			const destinations = await getDestinations();
			expect(Array.isArray(destinations)).toBe(true);
		});
	});

	describe("getGastronomy", () => {
		it("debería retornar un array", async () => {
			const gastronomy = await getGastronomy();
			expect(Array.isArray(gastronomy)).toBe(true);
		});
	});

	describe("getAllHotelData", () => {
		it("debería retornar todos los datos del hotel con metadata", async () => {
			const hotelData = await getAllHotelData();
			expect(hotelData).toHaveProperty("rooms");
			expect(hotelData).toHaveProperty("tours");
			expect(hotelData).toHaveProperty("destinations");
			expect(hotelData).toHaveProperty("gastronomy");
			expect(hotelData).toHaveProperty("metadata");
			expect(hotelData.metadata).toHaveProperty("lastSync");
			expect(hotelData.metadata).toHaveProperty("totalRecords");
		});
	});
});
