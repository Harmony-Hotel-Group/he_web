// src/types/config-destinations.ts
// Tipos de destinos turísticos

import type { LocalizedText } from "./i18n";

export interface Destination {
	id: string;
	name: LocalizedText;
	description: LocalizedText;
	location: LocalizedText;
	images: string[];
	category: LocalizedText;
}
