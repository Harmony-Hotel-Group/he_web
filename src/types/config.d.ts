// src/types/config.d.ts

import type { Resource } from "@/types/resource";



interface Category {
	id: string;
	src: string;
	name: LocalizedText;
	title: LocalizedText;
	description: LocalizedText;
	tags: LocalizedText;
}

type ImageResource = Omit<Resource, "type" | "poster">;
type CarouselResource = Omit<Resource, "poster">;

export interface SiteConfig {
	siteName?: string;
	tagline?: LocalizedText;
	contactInfo?: {
		address?: string;
		linkMap?: string;
		whatsapp?: string;
		email?: string;
		socialLinks?: Array<{
			href: string;
			label: string;
			icon: string;
		}>;
	};
	aboutUs?: {
		subtitle: LocalizedText;
		mainTitle: LocalizedText;
		welcomeParagraph: LocalizedText;
		commitmentParagraph: LocalizedText;
		images: ImageResource[];
	};
	carouselResources?: CarouselResource[];
	vehicleTypeOptions?: Array<{
		value: string;
	} & LocalizedText>;
	roomTypes?: Category[];
	destinationCategories?: Category[];
	gastronomyCategories?: Category[];
	tourCategories?: Category[];
	supportedLanguages?: Array<{
		code: string;
		name: string;
	}>;
	supportedCurrencies?: Array<{
		code: string;
		symbol: string;
		exchangeRate?: number;
	}>;
	[key: string]: unknown;
}

export type TranslationFunction = (
	key: string,
	params?: Record<string, unknown>,
) => string;
