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
 *   const { whatsappUrl } = useWhatsAppButton({ phoneNumber: config.contactInfo.whatsapp });
 */

import {
	buildContactMessage,
	buildWhatsAppUrl,
} from "@/adapters/booking/whatsapp.adapter";

export interface UseWhatsAppButtonOptions {
	phoneNumber: string;
}

/**
 * Construye los datos necesarios para renderizar el botón de WhatsApp.
 * El caller es responsable de extraer el número de config.contactInfo.whatsapp.
 *
 * @param opts.opts — phoneNumber crudo (puede incluir +)
 * @returns Objeto con `phoneNumber`, `message` y `whatsappUrl`
 */
export function useWhatsAppButton(opts: UseWhatsAppButtonOptions) {
	const phoneNumber = opts.phoneNumber.replace(/\+/g, "");
	const message = buildContactMessage();
	const whatsappUrl = buildWhatsAppUrl(phoneNumber, message);

	return { phoneNumber, message, whatsappUrl };
}
