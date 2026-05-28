import { describe, it, expect, vi, beforeEach } from "vitest";
import {
	calculateNights,
	formatDateRange,
	isValidDateString,
} from "@/domain/date.utils";

describe("Date Range Picker utilities", () => {
	describe("calculateNights", () => {
		it("calcula noches correctamente entre dos fechas", () => {
			expect(calculateNights("2025-06-01", "2025-06-03")).toBe(2);
			expect(calculateNights("2025-06-01", "2025-06-02")).toBe(1);
			expect(calculateNights("2025-06-01", "2025-06-30")).toBe(29);
		});

		it("retorna 0 para fechas inválidas", () => {
			expect(calculateNights("invalid", "2025-06-03")).toBe(0);
			expect(calculateNights("2025-06-03", "invalid")).toBe(0);
		});

		it("funciona con formato YYYY/MM/DD", () => {
			expect(calculateNights("2025/06/01", "2025/06/03")).toBe(2);
		});
	});

	describe("formatDateRange", () => {
		it("formatea el rango con noches", () => {
			const result = formatDateRange("2025-06-01", "2025-06-03", 2);
			expect(result).toBe("2025-06-01 ➜ 2025-06-03 (2 noches)");
		});

		it("maneja singular 'noche'", () => {
			const result = formatDateRange("2025-06-01", "2025-06-02", 1);
			expect(result).toBe("2025-06-01 ➜ 2025-06-02 (1 noche)");
		});
	});

	describe("isValidDateString", () => {
		it("acepta fechas YYYY-MM-DD válidas", () => {
			expect(isValidDateString("2025-06-01")).toBe(true);
			expect(isValidDateString("2025-12-31")).toBe(true);
		});

		it("rechaza fechas inválidas", () => {
			expect(isValidDateString("2025/06/01")).toBe(false);
			expect(isValidDateString("invalid")).toBe(false);
			expect(isValidDateString("")).toBe(false);
		});
	});
});