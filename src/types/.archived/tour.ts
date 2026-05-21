import type { ImageSource } from "./image";

export interface Tour {
	id: string;
	name: string;
	description: string;
	price?: number;
	image: ImageSource;
	active: boolean;
}
