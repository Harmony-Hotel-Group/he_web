import { describe, it, expect } from "vitest";
import { useBookingOptions } from "./useBookingOptions";

// Mock de Translations
function mockTranslations(overrides: Record<string, string> = {}): any {
	return (key: string, params?: Record<string, any>): string => {
		const base: Record<string, string> = {
			"booking.dropdown.optGroup": "Grupo (+10)",
			"booking.dropdown.optAdults": "{{i}} Adultos",
			"booking.dropdown.optAdults_one": "1 Adulto",
			"booking.dropdown.optChildren": "{{i}} Niños",
			"booking.dropdown.optChildren_one": "1 Niño",
			"booking.dropdown.optChildren_none": "Sin niños",
			"booking.dropdown.optRooms": "{{i}} Habitaciones",
			"booking.dropdown.optRooms_one": "1 Habitación",
			...overrides,
		};
		let text = base[key] || key;
		if (params) {
			Object.entries(params).forEach(([k, v]) => {
				text = text.replace(new RegExp(`{{${k}}}`, "g"), String(v));
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
		expect(adultsOptions[0]).toEqual({ value: "1", label: "1 Adulto" });
		expect(adultsOptions[1]).toEqual({ value: "2", label: "2 Adultos" });
		expect(adultsOptions[8]).toEqual({ value: "group", label: "Grupo (+10)" });
	});

	it("genera 9 opciones de niños (0–8) por autoAjust de range", () => {
		const t = mockTranslations();
		const { childrenOptions } = useBookingOptions(t);

		expect(childrenOptions).toHaveLength(9);
		expect(childrenOptions[0]).toEqual({ value: "0", label: "Sin niños" });
		expect(childrenOptions[1]).toEqual({ value: "1", label: "1 Niño" });
		expect(childrenOptions[3]).toEqual({ value: "3", label: "3 Niños" });
		expect(childrenOptions[8]).toEqual({ value: "8", label: "8 Niños" });
	});

	it("genera 4 opciones de habitaciones (1–4)", () => {
		const t = mockTranslations();
		const { roomsOptions } = useBookingOptions(t);

		expect(roomsOptions).toHaveLength(5);
		expect(roomsOptions[0]).toEqual({ value: "1", label: "1 Habitación" });
		expect(roomsOptions[1]).toEqual({ value: "2", label: "2 Habitaciones" });
		expect(roomsOptions[4]).toEqual({ value: "5", label: "5 Habitaciones" });
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
