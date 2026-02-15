import type { Resource } from "@/types/resource";

export interface Destination {
    id: string;
    name: LocalizedText;
    description: LocalizedText;
    location: LocalizedText;
    images: string[];
    category: LocalizedText;
}
