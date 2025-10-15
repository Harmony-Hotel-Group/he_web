// src/actions/booking.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const booking = defineAction({
    accept: "form",
    input: z.object({
        dateRange: z.string(),
        adults: z.string(),
        children: z.string(),
        rooms: z.string(),
        breakfast: z.string(),
        vehicle: z.string(),
        // Campos opcionales de grupos (por si se envían desde el formulario principal)
        groupAdults: z.string().optional(),
        groupTeens: z.string().optional(),
        groupKids: z.string().optional(),
        groupInfants: z.string().optional(),
        groupNotes: z.string().optional(),
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
        vehicleNotes: z.string().optional(),
    }),
    handler: async (input) => {
        const {
            dateRange,
            groupAdults,
            groupTeens,
            groupKids,
            groupInfants,
            groupNotes,
            vehicle,
            vehicleNotes,
            ...rest
        } = input; // extrae campos específicos y guarda el resto

        // Expresión regular para capturar las partes
        const regex = /(\d{4}\/\d{2}\/\d{2})\s*➜\s*(\d{4}\/\d{2}\/\d{2})\s*\(([^)]+)\)/;

        // Ejecutamos el match
        const match = dateRange?.match(regex);

        let checkin = null;
        let checkout = null;
        let nights = null;

        if (match) {
            [, checkin, checkout, nights] = match;
        } else {
            console.warn("No se encontraron coincidencias en dateRange:", dateRange);
        }

        // Procesar vehículos si están incluidos
        const vehicles = [];
        if (vehicle === 'true') {
            for (let i = 1; i <= 5; i++) {
                const type = input[`vehicleType${i}` as keyof typeof input];
                const plate = input[`vehiclePlate${i}` as keyof typeof input];

                if (type) {
                    vehicles.push({
                        type,
                        plate: plate || 'No especificada'
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
                // Incluir campos de grupo si están presentes
                ...(groupAdults && { groupAdults }),
                ...(groupTeens && { groupTeens }),
                ...(groupKids && { groupKids }),
                ...(groupInfants && { groupInfants }),
                ...(groupNotes && { groupNotes }),
                // Incluir información de vehículos procesada
                ...(vehicles.length > 0 && { vehicles }),
                vehicleCount: vehicles.length,
                ...(vehicleNotes && { vehicleNotes }),
                // Campos originales
                ...rest,
            },
        };
    }
})