// import type { ImageMetadata } from "astro";

export type ResourceType = "image" | "video" | "youtube" | "auto";

export interface Resource {
	src: string;
	// src: string | ImageMetadata;
	type?: ResourceType;
	alt: string;
	poster?: string;
}
