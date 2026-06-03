// src/types/config-site.ts
// Tipos de configuración del sitio: SiteConfig y auxiliares directos

import type { CarouselResource, ImageResource } from "./config-resource";
import type { LocalizedText } from "./i18n";

export type Currency = {
	code: string;
	symbol: string;
	image: string;
	exchangeRate?: number;
};

export type TranslationFunction = (
	key: string,
	params?: Record<string, unknown>,
) => string;

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
	vehicleTypeOptions?: Array<
		{
			value: string;
		} & LocalizedText
	>;
	rooms?: Category[];
	destinations?: Category[];
	gastronomies?: Category[];
	tours?: Category[];
	supportedLanguages?: Array<{
		code: string;
		name: string;
	}>;
	supportedCurrencies?: Array<Currency>;
	[key: string]: unknown;
}

export interface Category {
	id: string;
	src: string;
	name: LocalizedText;
	title?: LocalizedText;
	description?: LocalizedText;
	tags?: LocalizedText;
	category?: LocalizedText;
	value?: number;
	valueLabel?: string;
}
