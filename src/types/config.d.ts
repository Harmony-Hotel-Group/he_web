// src/types/config.d.ts

interface LocalizedText {
	es: string;
	en: string;
	[lang: string]: string;
}

interface Category {
	id: string;
	src: string;
	name: LocalizedText;
	title: LocalizedText;
	description: LocalizedText;
	tags: LocalizedText;
}

interface ImageResource {
	src: string;
	alt: string;
}

interface CarouselResource {
	src: string;
	type: string;
	alt: string;
}

export interface SiteConfig {
	siteName?: string;
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
		label: string;
		[key: string]: string;
	}>;
	roomTypes?: Category[];
	destinationCategories?: Category[];
	gastronomyCategories?: Category[];
	tourCategories?: Category[];
	[key: string]: unknown;
}

export type TranslationFunction = (
	key: string,
	params?: Record<string, unknown>,
) => string;
