export interface GastronomyItem {
    id: string;
    name: LocalizedText;
    description: LocalizedText;
    category: LocalizedText;
    price: number;
    currency: string;
    images: string[];
}
