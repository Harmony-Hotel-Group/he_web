export interface RoomImage {
    src: string;
    frontpage?: boolean;
    alt: LocalizedText;
}

export interface Room {
    id: string;
    name: LocalizedText;
    type: LocalizedText;
    description: LocalizedText;
    pricePerNight: number;
    currency: string;
    images: RoomImage[];
    amenities: {
        es: string[];
        en: string[];
        [lang: string]: string[];
    };
    category: LocalizedText;
}
