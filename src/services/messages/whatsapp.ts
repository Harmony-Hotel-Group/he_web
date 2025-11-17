// src/services/messages/whatsapp.ts
import { logger } from "@/services/logger";

const log = logger("messages:whatsapp");

interface WhatsAppOptions {
  token?: string; // Meta Graph API token
  phoneId?: string; // WhatsApp Business phone number ID
}

const ENV = {
  WHATSAPP_TOKEN: import.meta.env.WHATSAPP_TOKEN as string | undefined,
  WHATSAPP_PHONE_ID: import.meta.env.WHATSAPP_PHONE_ID as string | undefined,
  WHATSAPP_DESTINATION_PHONE: import.meta.env.WHATSAPP_DESTINATION_PHONE as string | undefined,
  DEV: import.meta.env.DEV as boolean,
};

/**
 * Formats the booking data from a FormData object into a readable string.
 * @param formData The form data from the booking modal.
 * @param bookingType The type of booking ('group' or 'vehicle').
 * @returns A formatted string ready to be sent as a message.
 */
function formatBookingMessage(
  formData: FormData,
  bookingType: "group" | "vehicle",
): string {
  let message = "Nueva solicitud de reserva:\n\n";

  // --- Detalles del Grupo ---
  message += "👤 *Detalles del Grupo*\n";
  message += `  - *Fechas:* ${formData.get("dateRangeGroup") || "No especificado"}\n`;
  message += `  - *Adultos:* ${formData.get("groupAdults") || "0"}\n`;

  const teens = Number(formData.get("groupTeens"));
  if (teens > 0) {
    message += `  - *Adolescentes:* ${teens}\n`;
  }
  const kids = Number(formData.get("groupKids"));
  if (kids > 0) {
    message += `  - *Niños:* ${kids}\n`;
  }
  const infants = Number(formData.get("groupInfants"));
  if (infants > 0) {
    message += `  - *Infantes:* ${infants}\n`;
  }

  message += `  - *Desayuno incluido:* ${formData.get("breakfast") === "true" ? "Sí" : "No"}\n`;

  const groupNotes = formData.get("groupNotes");
  if (groupNotes) {
    message += `  - *Notas (grupo):* ${groupNotes}\n`;
  }

  // --- Detalles de Vehículos (si aplica) ---
  if (bookingType === "vehicle") {
    message += "\n🚗 *Detalles de Vehículos*\n";
    const vehicles: string[] = [];
    for (let i = 1; i <= 6; i++) {
      const type = formData.get(`vehicleType${i}`) as string;
      const plate = formData.get(`vehiclePlate${i}`) as string;
      if (type) {
        vehicles.push(
          `  - *Vehículo ${i}:* ${type}, Placa: ${plate?.toUpperCase() || "No especificada"}`,
        );
      }
    }

    if (vehicles.length > 0) {
      message += vehicles.join("\n") + "\n";
    } else {
      message += "  - No se agregaron vehículos.\n";
    }

    const vehicleNotes = formData.get("vehicleNotes");
    if (vehicleNotes) {
      message += `  - *Notas (vehículos):* ${vehicleNotes}\n`;
    }
  }

  message += "\n_Mensaje generado automáticamente desde el sitio web._";

  return message;
}

/**
 * Sends a WhatsApp message with booking information.
 * It reads configuration from environment variables.
 *
 * @param formData The FormData object from the booking form.
 * @param bookingType The type of booking, 'group' or 'vehicle'.
 * @param options Optional configuration for WhatsApp token and phone ID.
 * @returns A promise that resolves with the result of the API call.
 */
export async function sendWhatsappMessage(
  formData: FormData,
  bookingType: "group" | "vehicle",
  options: WhatsAppOptions = {},
) {
  const token = options.token ?? ENV.WHATSAPP_TOKEN;
  const phoneId = options.phoneId ?? ENV.WHATSAPP_PHONE_ID;
  const toE164 = ENV.WHATSAPP_DESTINATION_PHONE;

  if (!token || !phoneId || !toE164) {
    const missing = [
      !token && "WHATSAPP_TOKEN",
      !phoneId && "WHATSAPP_PHONE_ID",
      !toE164 && "WHATSAPP_DESTINATION_PHONE",
    ].filter(Boolean).join(", ");

    log.warn(`Faltan variables de entorno (${missing}); omitiendo envío de WhatsApp.`);
    
    if (ENV.DEV) {
        console.warn(`[messages/whatsapp] Missing environment variables: ${missing}. Skipping WhatsApp message.`);
        // En DEV, mostramos el mensaje en consola para depuración
        console.log("------- WHATSAPP MESSAGE PREVIEW -------");
        console.log(formatBookingMessage(formData, bookingType));
        console.log("--------------------------------------");
    }

    return { ok: false, skipped: true } as const;
  }

  const bodyText = formatBookingMessage(formData, bookingType);
  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    to: toE164,
    type: "text",
    text: { body: bodyText },
  };

  try {
    log.info(`Enviando mensaje de reserva a ${toE164}`);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseBody = await res.text().catch(() => "");
    
    if (res.ok) {
        log.info("Mensaje de WhatsApp enviado con éxito.", { status: res.status, body: responseBody });
        return { ok: true, status: res.status, body: responseBody } as const;
    } else {
        log.error("Error al enviar mensaje de WhatsApp.", { status: res.status, body: responseBody });
        return { ok: false, status: res.status, body: responseBody } as const;
    }

  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    log.error("Excepción al enviar mensaje de WhatsApp.", { error });
    return { ok: false, error } as const;
  }
}
