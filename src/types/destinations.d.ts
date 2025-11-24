import type { Resource } from "./resource";

export interface Destination {
    id: string;
    name: LocalizedText;
    description: LocalizedText;
    location: LocalizedText;
    images: string[];
    category: LocalizedText;
}
