import type { ImageMetadata } from "astro";

export type ImageSource =
	| string // URL remota o path local
	| ImageMetadata // Astro image import
	| null; // Imagen opcional

export interface ImageProps {
	src: ImageSource;
	alt: string;
	width?: number;
	height?: number;
	loading?: "lazy" | "eager";
	class?: string;
}
