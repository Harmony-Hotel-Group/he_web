export interface Booking {
    id: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalPrice: number;
    currency: string;
    status: 'pending' | 'confirmed' | 'cancelled';
}
