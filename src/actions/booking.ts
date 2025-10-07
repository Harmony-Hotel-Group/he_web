// src/actions/booking.ts
import { defineAction } from "astro:actions";
import { z } from "astro:schema";

export const booking = defineAction({
    accept: "form",
    input: z.object({
        dateRange: z.string().min(1),
    //     to: z.string(),
    //     children: z.string().optional(),
    //     rooms: z.string().optional(),
    //     breakfast: z.string().optional(),
    //     vehicle: z.string().optional(),
    }),
    handler: async (input) => {
        console.log("Booking data:", input);
        return { success: true };
    },
});
