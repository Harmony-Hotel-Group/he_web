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
    }),
    handler: async (input) => {
        const {dateRange, ...rest} = input; // extrae dateRange y guarda el resto de propiedades

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

        return {
            success: true,
            processing: {
                checkin,
                checkout,
                nights,
                ...rest,
            },
        };
    }
})