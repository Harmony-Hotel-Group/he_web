import type { ImageSource } from "./image";

/**
 * Representa un tour o experiencia en el sitio.
 * Se mueve de types/resources.ts a un archivo propio para evitar acoplamiento.
 */
export interface Tour {
	id: string;
	name: string;
	description: string;
	price?: number;
	image: ImageSource;
	active: boolean;
}
