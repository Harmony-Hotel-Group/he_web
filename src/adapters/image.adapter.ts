import type { ImageSource } from "@/types/image";
import type { ImageMetadata } from "astro";

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
