import type { Tour } from "@/types/tour";
import { adaptImageSource } from "./image/image.adapter";

export function adaptTour(raw: any): Tour {
	return {
		id: String(raw.id),
		name: raw.name ?? "Tour sin nombre",
		description: raw.description ?? "",
		price: raw.price ? Number(raw.price) : undefined,
		image: adaptImageSource(raw.image),
		active: Boolean(raw.active),
	};
}
