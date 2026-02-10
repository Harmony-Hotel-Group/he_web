import type { ImageMetadata } from "astro";

const FALLBACK_IMAGE = "/images/fallback.webp";

export async function validateImageSource(
	src?: string | ImageMetadata,
): Promise<string | ImageMetadata> {
	if (!src) return FALLBACK_IMAGE;

	// Imagen importada por Astro (ImageMetadata)
	if (typeof src === "object" && "src" in src) {
		return src;
	}

	// String
	if (typeof src === "string") {
		if (src.startsWith("http")) {
			try {
				new URL(src);
				return src;
			} catch {
				return FALLBACK_IMAGE;
			}
		}

		if (src.startsWith("/")) {
			return src;
		}
	}

	return FALLBACK_IMAGE;
}
