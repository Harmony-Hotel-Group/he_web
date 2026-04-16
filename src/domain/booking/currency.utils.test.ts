/**
 * Tests para src/domain/booking/currency.utils.ts
 */
import { describe, expect, it } from "vitest";
import {
	CURRENCY_SYMBOLS,
	convertAndFormat,
	convertCurrency,
	formatMoney,
	formatMoneyFull,
	getExchangeRate,
	isValidAmount,
	isValidCurrency,
} from "@/domain/booking/currency.utils";

describe("currency.utils", () => {
	describe("isValidCurrency", () => {
		it("debería validar monedas correctas", () => {
			expect(isValidCurrency("USD")).toBe(true);
			expect(isValidCurrency("EUR")).toBe(true);
			expect(isValidCurrency("GBP")).toBe(true);
		});

		it("debería rechazar monedas inválidas", () => {
			expect(isValidCurrency("INVALID")).toBe(false);
			expect(isValidCurrency("")).toBe(false);
		});

		it("debería ser case insensitive", () => {
			expect(isValidCurrency("usd")).toBe(true);
			expect(isValidCurrency("Eur")).toBe(true);
		});
	});

	describe("convertCurrency", () => {
		it("debería convertir EUR a USD", () => {
			const result = convertCurrency(100, "EUR", "USD");
			expect(result).toBeCloseTo(108.7, 1);
		});

		it("debería convertir USD a EUR", () => {
			const result = convertCurrency(100, "USD", "EUR");
			expect(result).toBeCloseTo(92, 1);
		});

		it("debería retornar mismo valor para misma moneda", () => {
			expect(convertCurrency(100, "USD", "USD")).toBe(100);
		});
	});

	describe("formatMoney", () => {
		it("debería formatear USD correctamente", () => {
			expect(formatMoney(100, "USD")).toBe("$100.00");
		});

		it("debería formatear EUR correctamente", () => {
			expect(formatMoney(100, "EUR")).toBe("€100.00");
		});

		it("debería usar USD como default", () => {
			expect(formatMoney(50)).toBe("$50.00");
		});
	});

	describe("formatMoneyFull", () => {
		it("debería incluir nombre de moneda", () => {
			const result = formatMoneyFull(100, "USD");
			expect(result).toContain("$100.00");
			expect(result).toContain("Dólar estadounidense");
		});
	});

	describe("getExchangeRate", () => {
		it("debería retornar 1 para misma moneda", () => {
			expect(getExchangeRate("USD", "USD")).toBe(1);
		});

		it("debería obtener tasa de cambio correcta", () => {
			const rate = getExchangeRate("USD", "EUR");
			expect(rate).toBeCloseTo(0.92, 2);
		});
	});

	describe("convertAndFormat", () => {
		it("debería convertir y formatear", () => {
			const result = convertAndFormat(100, "EUR");
			expect(result).toContain("€");
		});
	});

	describe("isValidAmount", () => {
		it("debería validar montos numéricos", () => {
			expect(isValidAmount(100)).toBe(true);
			expect(isValidAmount(0)).toBe(true);
			expect(isValidAmount(99.99)).toBe(true);
		});

		it("debería rechazar montos inválidos", () => {
			expect(isValidAmount(NaN)).toBe(false);
			expect(isValidAmount(-1)).toBe(false);
			expect(isValidAmount("100")).toBe(false);
		});
	});

	describe("CURRENCY_SYMBOLS", () => {
		it("debería tener símbolos correctos", () => {
			expect(CURRENCY_SYMBOLS.USD).toBe("$");
			expect(CURRENCY_SYMBOLS.EUR).toBe("€");
			expect(CURRENCY_SYMBOLS.GBP).toBe("£");
		});
	});
});
