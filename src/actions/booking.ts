// src/actions/booking.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const booking = defineAction({
    accept: "form",
    input: z.object({
        dateRange: z.string().optional(),
        dateRangeGroup: z.string().optional(),
        adults: z.string().optional(),
        children: z.string().optional(),
        rooms: z.string().optional(),
        breakfast: z.string().optional(),
        vehicle: z.string().optional(),
        // Campos opcionales de grupos (por si se envían desde el formulario principal)
        groupAdults: z.string().optional(),
        groupTeens: z.string().optional(),
        groupKids: z.string().optional(),
        groupInfants: z.string().optional(),
        groupNotes: z.string().optional(),
        distributionType: z.string().optional(),
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
            dateRangeGroup,
            adults,
            groupAdults,
            groupTeens,
            groupKids,
            groupInfants,
            groupNotes,
            vehicle,
            vehicleNotes,
            ...rest
        } = input; // extrae campos específicos y guarda el resto

        // Determine if we are in group mode based on the 'adults' field value
        const isGroupMode = adults === "group";

        // Select the appropriate date range
        const dateRangeToUse = (isGroupMode && dateRangeGroup) ? dateRangeGroup : dateRange;

        // Expresión regular para capturar las partes
        // Acepta tanto / como - como separadores de fecha (YYYY/MM/DD o YYYY-MM-DD)
        const regex =
            /(\d{4}[-\/]\d{2}[-\/]\d{2})\s*➜\s*(\d{4}[-\/]\d{2}[-\/]\d{2})\s*\(([^)]+)\)/;

        // Ejecutamos el match
        console.log("dateRange recibido:", dateRangeToUse);
        const match = dateRangeToUse?.match(regex);
        console.log("Match result:", match);

        let checkin: string | null = null;
        let checkout: string | null = null;
        let nights: string | null = null;

        if (match) {
            // match[0] es el string completo, los grupos capturados empiezan en match[1]
            checkin = match[1];
            checkout = match[2];
            nights = match[3];
            console.log("Fechas extraídas:", { checkin, checkout, nights });
        } else {
            console.warn("⚠️ No se encontraron coincidencias en dateRange:", dateRangeToUse);
        }

        // Procesar vehículos si están incluidos
        const vehicles: { type: string; plate: string }[] = [];
        if (vehicle === "true") {
            for (let i = 1; i <= 5; i++) {
                const type: string | undefined =
                    input[`vehicleType${i}` as keyof typeof input];
                const plate: string | undefined =
                    input[`vehiclePlate${i}` as keyof typeof input];

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
                adults,
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
    },
});