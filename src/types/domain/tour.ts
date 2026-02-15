export interface Tour {
    id: string;
    name: LocalizedText;
    description: LocalizedText;
    price: number;
    currency: string;
    duration: string;
    images: string[];
}
