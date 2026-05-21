// src/composables/useWhatsAppButton.ts
/**
 * Composable: lógica de construcción de URL de WhatsApp para WhatsAppButton.
 *
 * Extrae la lógica de:
 *   - Limpieza del número de teléfono
 *   - Construcción del mensaje de contacto
 *   - Construcción de la URL wa.me
 *
 * Uso:
 *   const { whatsappUrl, phoneNumber, message } = useWhatsAppButton({ config });
 */

import {
	buildContactMessage,
	buildWhatsAppUrl,
} from "@/adapters/booking/whatsapp.adapter";
import type { SiteConfig } from "@/types/config";

export interface UseWhatsAppButtonOptions {
	config: SiteConfig;
}

/**
 * Construye los datos necesarios para renderizar el botón de WhatsApp.
 *
 * @param opts.opts — Configuración del sitio (contactInfo.whatsapp)
 * @returns Objeto con `phoneNumber`, `message` y `whatsappUrl`
 */
export function useWhatsAppButton(opts: UseWhatsAppButtonOptions) {
	const { whatsapp } = opts.config.contactInfo;
	const phoneNumber = whatsapp.replace(/\+/g, "");
	const message = buildContactMessage();
	const whatsappUrl = buildWhatsAppUrl(phoneNumber, message);

	return { phoneNumber, message, whatsappUrl };
}
