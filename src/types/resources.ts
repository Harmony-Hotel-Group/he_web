// src/types/resources.ts
// Tipos de recursos compartidos: imágenes, habitaciones, tours, gastronomía, destinos

import type { ImageMetadata } from "astro";
import type { ImageSource } from "./image";
import type { LocalizedText } from "./i18n";

// === Base Resource ===
export type ResourceType = "image" | "video" | "youtube" | "auto";

export interface Resource {
	src: string | ImageMetadata;
	type?: ResourceType;
	alt: string;
	poster?: string;
}

export type ImageResource = Omit<Resource, "type" | "poster">;
export type CarouselResource = Omit<Resource, "poster">;

// === Room ===
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
	minPersons?: number;
	maxPersons?: number;
	images: RoomImage[];
	amenities: {
		es: string[];
		en: string[];
		[lang: string]: string[];
	};
	category: LocalizedText;
}

// === Tours ===
// Tour ERP/backend (sin i18n)
export interface TourERP {
	id: string;
	name: string;
	description: string;
	price?: number;
	image: ImageSource;
	active: boolean;
}

// Tour presentación (con i18n)
export interface TourItem {
	id: string;
	name: LocalizedText;
	description: LocalizedText;
	price: number;
	currency: string;
	duration: string;
	images: string[];
}

// === Gastronomy ===
export interface GastronomyItem {
	id: string;
	name: LocalizedText;
	description: LocalizedText;
	category: LocalizedText;
	price: number;
	currency: string;
	images: string[];
}
