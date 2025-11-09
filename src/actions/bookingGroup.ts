// src/actions/bookingGroup.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const bookingGroup = defineAction({
	accept: "form",
	input: z.object({
		dateRangeGroup: z.string(),
		groupAdults: z.string(),
		groupTeens: z.string(),
		groupKids: z.string(),
		groupInfants: z.string(),
		groupNotes: z.string().optional(),
		breakfast: z.string(),
		vehicle: z.string(),
		// Campos opcionales de vehículos
		vehicleType1: z.string().optional(),
		vehiclePlate1: z.string().optional(),
		vehicleType2: z.string().optional(),
		vehiclePlate2: z.string().optional(),
		vehicleType3: z.string().optional(),
		vehiclePlate3: z.string().optional(),
		vehicleType4: z.string().optional(),
		vehiclePlate4: z.string().optional(),
		vehicleType5: z.string().optional(),
		vehiclePlate5: z.string().optional(),
	}),
	handler: async (input) => {
		const {
			dateRangeGroup,
			groupAdults,
			groupTeens,
			groupKids,
			groupInfants,
			groupNotes,
			breakfast,
			vehicle,
			...vehicleFields
		} = input;

		// Procesar fecha grupal
		const regex =
			/(\d{4}\/\d{2}\/\d{2})\s*➜\s*(\d{4}\/\d{2}\/\d{2})\s*\(([^)]+)\)/;
		const match = dateRangeGroup?.match(regex);

		let checkin: string | null = null;
		let checkout: string | null = null;
		let nights: string | null = null;

		if (match) {
			[, checkin, checkout, nights] = match;
		} else {
			console.warn(
				"No se encontraron coincidencias en dateRangeGroup:",
				dateRangeGroup,
			);
		}

		// Procesar vehículos si están incluidos
		const vehicles: { type: string; plate: string }[] = [];
		if (vehicle === "true") {
			for (let i = 1; i <= 5; i++) {
				const type: string | undefined = vehicleFields[`vehicleType${i}`];
				const plate: string | undefined = vehicleFields[`vehiclePlate${i}`];

				if (type) {
					vehicles.push({
						type,
						plate: plate || "No especificada",
					});
				}
			}
		}

		return {
			success: true,
			processing: {
				checkin,
				checkout,
				nights,
				groupAdults,
				groupTeens,
				groupKids,
				groupInfants,
				groupNotes,
				breakfast,
				vehicle,
				vehicles,
				vehicleCount: vehicles.length,
			},
		};
	},
});
