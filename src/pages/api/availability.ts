// src/pages/api/availability.ts

import type { APIRoute } from 'astro';
import { isRoomAvailable, getBlockedDates } from '@/utils/availability';

export const GET: APIRoute = async ({ url }) => {
    const searchParams = url.searchParams;
    const roomId = searchParams.get('roomId');
    const checkin = searchParams.get('checkin');
    const checkout = searchParams.get('checkout');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Verificar disponibilidad para fechas específicas
    if (roomId && checkin && checkout) {
        const available = isRoomAvailable(roomId, checkin, checkout);

        return new Response(
            JSON.stringify({
                available,
                roomId,
                checkin,
                checkout,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    // Obtener fechas bloqueadas para calendario
    if (roomId && startDate && endDate) {
        const blocked = getBlockedDates(roomId, startDate, endDate);

        return new Response(
            JSON.stringify({
                blocked,
                roomId,
                startDate,
                endDate,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    return new Response(
        JSON.stringify({
            error: 'Missing required parameters',
            required: 'roomId + (checkin + checkout) OR (startDate + endDate)',
        }),
        {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        }
    );
};

export const POST: APIRoute = async () => {
    // Este endpoint sería para agregar reservas desde el admin
    // Se implementará en la Fase 2.6 (Admin Dashboard)

    return new Response(
        JSON.stringify({
            error: 'Not implemented',
            message: 'Use the admin dashboard to add bookings',
        }),
        {
            status: 501,
            headers: { 'Content-Type': 'application/json' },
        }
    );
};
