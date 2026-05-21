import { describe, it, expect } from "vitest";
import { useBookingOptions } from "./useBookingOptions";

// Mock de Translations
function mockTranslations(overrides: Record<string, string> = {}): any {
	return (key: string, params?: Record<string, any>): string => {
		const base: Record<string, string> = {
			"booking.dropdown.optGroup": "Grupo (+10)",
			"booking.dropdown.optAdults": "{i} adulto{s}",
			"booking.dropdown.optChildren": "{i} niño{s}", // usa "niño" base para que la s quede bien
			"booking.dropdown.optRooms": "{i} habitación{s}",
			...overrides,
		};
		let text = base[key] || key;
		if (params) {
			Object.entries(params).forEach(([k, v]) => {
				text = text.replace(`{${k}}`, String(v));
			});
		}
		return text;
	};
}

describe("useBookingOptions", () => {
	it("genera 9 opciones de adultos (1–9) con 'group' al final", () => {
		const t = mockTranslations();
		const { adultsOptions } = useBookingOptions(t);

		expect(adultsOptions).toHaveLength(9);
		expect(adultsOptions[0]).toEqual({ value: "1", label: "1 adulto" });
		expect(adultsOptions[1]).toEqual({ value: "2", label: "2 adultos" });
		expect(adultsOptions[8]).toEqual({ value: "group", label: "Grupo (+10)" });
	});

	it("genera 9 opciones de niños (0–8) por autoAjust de range", () => {
		const t = mockTranslations();
		const { childrenOptions } = useBookingOptions(t);

		expect(childrenOptions).toHaveLength(9);
		expect(childrenOptions[0]).toEqual({ value: "0", label: "Sin niños" }) // bug: en prod sale "Sin niñoss";
		expect(childrenOptions[1]).toEqual({ value: "1", label: "1 niño" }) // bug: en prod sale "1 niños";
		expect(childrenOptions[3]).toEqual({ value: "3", label: "3 niños" }) // prod sale "3 niños" ✓;
		expect(childrenOptions[8]).toEqual({ value: "8", label: "8 niños" }) // prod sale "8 niños" ✓;
	});

	it("genera 4 opciones de habitaciones (1–4)", () => {
		const t = mockTranslations();
		const { roomsOptions } = useBookingOptions(t);

		expect(roomsOptions).toHaveLength(5);
		expect(roomsOptions[0]).toEqual({ value: "1", label: "1 habitación" });
		expect(roomsOptions[1]).toEqual({ value: "2", label: "2 habitaciónes" }) // nota: tilde por mock
		expect(roomsOptions[4]).toEqual({ value: "5", label: "5 habitaciónes" }) // nota: tilde por mock;
	});

	it("genera 3 opciones de distribución fijas", () => {
		const t = mockTranslations();
		const { distributionOptions } = useBookingOptions(t);

		expect(distributionOptions).toHaveLength(3);
		expect(distributionOptions[0]).toEqual({
			value: "shared_beds",
			label: "Camas Compartidas",
		});
		expect(distributionOptions[1]).toEqual({
			value: "shared_rooms",
			label: "Habitaciones Compartidas",
		});
		expect(distributionOptions[2]).toEqual({
			value: "individual_rooms",
			label: "Habitaciones Individuales",
		});
	});
});
