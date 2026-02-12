import type { ImageMetadata } from "astro";
import type { ImageSource } from "@/types/image";

export function adaptImageSource(input: unknown): ImageSource {
	if (!input) return null;

	if (typeof input === "string") {
		return input;
	}

	if (typeof input === "object" && "src" in input) {
		return input as ImageMetadata;
	}

	return null;
}

export function validateImageSource(
	src: string | ImageMetadata,
): string | ImageMetadata {
	if (!src) {
		throw new Error("Image source is required");
	}

	return src;
}
