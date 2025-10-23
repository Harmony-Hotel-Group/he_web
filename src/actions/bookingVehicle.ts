// src/actions/bookingVehicle.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const bookingVehicle = defineAction({
	accept: "form",
	input: z.object({
		// Campos de vehículos (mínimo 1, máximo 5)
		vehicleType1: z.string(),
		vehiclePlate1: z.string().optional(),
		vehicleType2: z.string().optional(),
		vehiclePlate2: z.string().optional(),
		vehicleType3: z.string().optional(),
		vehiclePlate3: z.string().optional(),
		vehicleType4: z.string().optional(),
		vehiclePlate4: z.string().optional(),
		vehicleType5: z.string().optional(),
		vehiclePlate5: z.string().optional(),
		// Notas adicionales
		vehicleNotes: z.string().optional(),
	}),
	handler: async (input) => {
		const { vehicleNotes, ...vehicleFields } = input;

		// Procesar vehículos
		const vehicles = [];
		let vehicleCount = 0;

		for (let i = 1; i <= 5; i++) {
			const type = vehicleFields[`vehicleType${i}`];
			const plate = vehicleFields[`vehiclePlate${i}`];

			if (type) {
				vehicles.push({
					type,
					plate: plate || "No especificada",
				});
				vehicleCount++;
			}
		}

		// Validar que al menos haya un vehículo
		if (vehicleCount === 0) {
			throw new Error("Debe especificar al menos un vehículo");
		}

		return {
			success: true,
			processing: {
				vehicles,
				vehicleCount,
				vehicleNotes,
			},
		};
	},
});
