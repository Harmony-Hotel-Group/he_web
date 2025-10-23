/**
 * Utilidades para envío de mensajes de reservas
 * @module utils/send
 */

import config from "@/data/config.json";

/**
 * Información de contacto desde configuración
 */
const CONTACT_INFO = {
	whatsapp: config.contactInfo?.whatsapp || "+593978888020",
	email: config.contactInfo?.email || "reservas@hotelensueños.com",
};

/**
 * Tipos de reserva soportados
 */
export type BookingType = "normal" | "group" | "vehicle";

/**
 * Datos procesados de una reserva
 */
export interface ProcessedBookingData {
	checkin?: string;
	checkout?: string;
	nights?: string;
	adults?: string;
	children?: string;
	rooms?: string;
	breakfast?: string;
	vehicle?: string;
	// Campos específicos de grupos
	groupAdults?: string;
	groupTeens?: string;
	groupKids?: string;
	groupInfants?: string;
	groupNotes?: string;
	// Campos específicos de vehículos
	vehicleCount?: number;
	vehicles?: Array<{
		type: string;
		plate: string;
	}>;
	vehicleNotes?: string;
}

/**
 * Función principal para enviar mensajes de reserva
 * @param formData - Datos del formulario
 * @param type - Tipo de reserva ('normal', 'group', 'vehicle')
 * @returns Promise que se resuelve cuando se completa el envío
 */
export async function sendBookingMessage(
	formData: FormData,
	type: BookingType,
): Promise<void> {
	try {
		// Procesar datos según el tipo
		const processedData = await processBookingData(formData, type);

		// Generar mensaje formateado
		const message = formatBookingMessage(processedData, type);

		// Enviar por WhatsApp
		await sendWhatsApp(message);

		// También enviar por email (opcional)
		// await sendEmail(processedData, type);

		console.log(`Mensaje de ${type} enviado exitosamente`);
	} catch (error) {
		console.error(`Error enviando mensaje de ${type}:`, error);
		throw new Error(`Error al enviar mensaje: ${error.message}`);
	}
}

/**
 * Procesa los datos del formulario según el tipo de reserva
 * @param formData - Datos del formulario
 * @param type - Tipo de reserva
 * @returns Datos procesados
 */
async function processBookingData(
	formData: FormData,
	type: BookingType,
): Promise<ProcessedBookingData> {
	const data: ProcessedBookingData = {};

	switch (type) {
		case "normal":
			data.checkin = formData.get("checkin") as string;
			data.checkout = formData.get("checkout") as string;
			data.nights = formData.get("nights") as string;
			data.adults = formData.get("adults") as string;
			data.children = formData.get("children") as string;
			data.rooms = formData.get("rooms") as string;
			data.breakfast = formData.get("breakfast") as string;
			data.vehicle = formData.get("vehicle") as string;
			break;

		case "group":
			data.checkin = formData.get("checkin") as string;
			data.checkout = formData.get("checkout") as string;
			data.nights = formData.get("nights") as string;
			data.groupAdults = formData.get("groupAdults") as string;
			data.groupTeens = formData.get("groupTeens") as string;
			data.groupKids = formData.get("groupKids") as string;
			data.groupInfants = formData.get("groupInfants") as string;
			data.groupNotes = formData.get("groupNotes") as string;
			data.breakfast = formData.get("breakfast") as string;
			data.vehicle = formData.get("vehicle") as string;

			// Procesar vehículos si están incluidos
			if (data.vehicle === "true") {
				data.vehicleCount = getVehicleCount(formData);
				data.vehicles = getVehiclesData(formData, data.vehicleCount);
			}
			break;

		case "vehicle":
			data.vehicleCount = getVehicleCount(formData);
			data.vehicles = getVehiclesData(formData, data.vehicleCount);
			data.vehicleNotes = formData.get("vehicleNotes") as string;
			break;
	}

	return data;
}

/**
 * Formatea el mensaje de reserva según el tipo
 * @param data - Datos procesados de la reserva
 * @param type - Tipo de reserva
 * @returns Mensaje formateado
 */
function formatBookingMessage(
	data: ProcessedBookingData,
	type: BookingType,
): string {
	const baseMessage = `*Estimado Hotel Ensueños, necesito ayuda con una reserva:*\n\n`;

	switch (type) {
		case "normal":
			return formatNormalBookingMessage(data);

		case "group":
			return formatGroupBookingMessage(data);

		case "vehicle":
			return formatVehicleBookingMessage(data);

		default:
			throw new Error(`Tipo de reserva no soportado: ${type}`);
	}
}

/**
 * Formatea mensaje para reserva normal
 */
function formatNormalBookingMessage(data: ProcessedBookingData): string {
	let message = `*Estimado Hotel Ensueños, necesito ayuda con una reserva:*\n\n`;

	if (data.checkin && data.checkout) {
		message += `➢ Check In: ${data.checkin}\n`;
		message += `➢ Check Out: ${data.checkout}\n`;
		if (data.nights) {
			message += `➢ Cantidad de Noches: ${data.nights}\n`;
		}
	}

	message += `➢ Adultos: ${data.adults || "No especificado"}\n`;
	message += `➢ Niños: ${data.children || "No especificado"}\n`;
	message += `➢ Habitaciones: ${data.rooms || "No especificado"}\n`;
	message += `➢ Desayuno incluido: ${data.breakfast === "true" ? "Sí" : "No"}\n`;

	if (data.vehicle === "true") {
		message += `\n➢ *Vehículos:*\n`;
		if (data.vehicles) {
			data.vehicles.forEach((vehicle, index) => {
				message += `   ${index + 1}. Tipo: ${vehicle.type}, Placa: ${vehicle.plate || "No especificada"}\n`;
			});
		}
	}

	message += `\n\nSi hace falta información adicional, por favor responder a este mensaje.`;

	return message;
}

/**
 * Formatea mensaje para reserva grupal
 */
function formatGroupBookingMessage(data: ProcessedBookingData): string {
	let message = `*Estimado Hotel Ensueños, necesito ayuda con una RESERVA GRUPAL:*\n\n`;

	if (data.checkin && data.checkout) {
		message += `➢ Check In: ${data.checkin}\n`;
		message += `➢ Check Out: ${data.checkout}\n`;
		if (data.nights) {
			message += `➢ Cantidad de Noches: ${data.nights}\n`;
		}
	}

	message += `➢ *Grupo:*\n`;
	message += `   • Adultos: ${data.groupAdults || "No especificado"}\n`;
	message += `   • Adolescentes (12-17 años): ${data.groupTeens || "0"}\n`;
	message += `   • Niños (5-11 años): ${data.groupKids || "0"}\n`;
	message += `   • Infantes (< 5 años): ${data.groupInfants || "0"}\n`;

	if (data.groupNotes) {
		message += `➢ Notas adicionales: ${data.groupNotes}\n`;
	}

	message += `➢ Desayuno incluido: ${data.breakfast === "true" ? "Sí" : "No"}\n`;

	if (data.vehicle === "true" && data.vehicles) {
		message += `\n➢ *Vehículos:*\n`;
		data.vehicles.forEach((vehicle, index) => {
			message += `   ${index + 1}. Tipo: ${vehicle.type}, Placa: ${vehicle.plate || "No especificada"}\n`;
		});
	}

	message += `\n\nSi hace falta información adicional, por favor responder a este mensaje.`;

	return message;
}

/**
 * Formatea mensaje para información de vehículos
 */
function formatVehicleBookingMessage(data: ProcessedBookingData): string {
	let message = `*Estimado Hotel Ensueños, información adicional de vehículos:*\n\n`;

	if (data.vehicles && data.vehicles.length > 0) {
		message += `➢ *Vehículos:*\n`;
		data.vehicles.forEach((vehicle, index) => {
			message += `   ${index + 1}. Tipo: ${vehicle.type}, Placa: ${vehicle.plate || "No especificada"}\n`;
		});
	}

	if (data.vehicleNotes) {
		message += `➢ Notas adicionales: ${data.vehicleNotes}\n`;
	}

	message += `\n\nGracias por la información.`;

	return message;
}

/**
 * Envía mensaje por WhatsApp
 * @param message - Mensaje a enviar
 */
export async function sendWhatsApp(message: string): Promise<void> {
	const encodedMessage = encodeURIComponent(message.trim());

	if (CONTACT_INFO.whatsapp && CONTACT_INFO.whatsapp !== "") {
		const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodedMessage}`;
		window.open(whatsappUrl, "_blank");

		// Recargar la página después de un breve delay
		setTimeout(() => {
			window.location.reload();
		}, 1000);
	} else {
		throw new Error("Número de WhatsApp no configurado");
	}
}

/**
 * Envía email con plantilla HTML
 * @param data - Datos procesados de la reserva
 * @param type - Tipo de reserva
 */
export async function sendEmail(
	data: ProcessedBookingData,
	type: BookingType,
): Promise<void> {
	try {
		const subject = getEmailSubject(type);
		const htmlContent = generateEmailTemplate(data, type);
		const textContent = generateTextTemplate(data, type);

		// Aquí implementarías el envío real del email
		// Por ahora solo mostramos en consola
		console.log("Email enviado:");
		console.log("Subject:", subject);
		console.log("HTML:", htmlContent);
		console.log("Text:", textContent);

		// Ejemplo de implementación básica (necesitaría un servicio de email)
		/*
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                to: CONTACT_INFO.email,
                subject,
                html: htmlContent,
                text: textContent
            })
        });

        if (!response.ok) {
            throw new Error('Error al enviar email');
        }
        */
	} catch (error) {
		console.error("Error enviando email:", error);
		throw error;
	}
}

/**
 * Genera asunto del email según el tipo de reserva
 */
function getEmailSubject(type: BookingType): string {
	switch (type) {
		case "normal":
			return "Nueva Reserva - Hotel Ensueños";
		case "group":
			return "Nueva Reserva Grupal - Hotel Ensueños";
		case "vehicle":
			return "Información de Vehículos - Hotel Ensueños";
		default:
			return "Consulta - Hotel Ensueños";
	}
}

/**
 * Genera plantilla HTML para email
 */
function generateEmailTemplate(
	data: ProcessedBookingData,
	type: BookingType,
): string {
	const currentDate = new Date().toLocaleDateString("es-ES");

	return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nueva Reserva - Hotel Ensueños</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; margin-bottom: 20px; }
                .content { background-color: #ffffff; padding: 20px; border-radius: 5px; border: 1px solid #dee2e6; }
                .footer { margin-top: 20px; text-align: center; color: #6c757d; font-size: 12px; }
                table { width: 100%; border-collapse: collapse; }
                td { padding: 8px; border-bottom: 1px solid #dee2e6; }
                .label { font-weight: bold; color: #495057; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Hotel Ensueños</h1>
                    <p>Nueva ${type === "normal" ? "reserva" : type === "group" ? "reserva grupal" : "información de vehículos"}</p>
                </div>

                <div class="content">
                    ${getEmailContent(data, type)}
                </div>

                <div class="footer">
                    <p>Este mensaje fue generado automáticamente el ${currentDate}</p>
                    <p>Por favor, responder directamente al cliente para cualquier consulta.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

/**
 * Genera contenido del email según el tipo
 */
function getEmailContent(
	data: ProcessedBookingData,
	type: BookingType,
): string {
	switch (type) {
		case "normal":
			return `
                <h2>Detalles de la Reserva</h2>
                <table>
                    <tr><td class="label">Check In:</td><td>${data.checkin || "No especificado"}</td></tr>
                    <tr><td class="label">Check Out:</td><td>${data.checkout || "No especificado"}</td></tr>
                    <tr><td class="label">Noches:</td><td>${data.nights || "No especificado"}</td></tr>
                    <tr><td class="label">Adultos:</td><td>${data.adults || "No especificado"}</td></tr>
                    <tr><td class="label">Niños:</td><td>${data.children || "No especificado"}</td></tr>
                    <tr><td class="label">Habitaciones:</td><td>${data.rooms || "No especificado"}</td></tr>
                    <tr><td class="label">Desayuno:</td><td>${data.breakfast === "true" ? "Sí" : "No"}</td></tr>
                </table>
                ${data.vehicles ? getVehiclesEmailTable(data.vehicles) : ""}
            `;

		case "group":
			return `
                <h2>Detalles de la Reserva Grupal</h2>
                <table>
                    <tr><td class="label">Check In:</td><td>${data.checkin || "No especificado"}</td></tr>
                    <tr><td class="label">Check Out:</td><td>${data.checkout || "No especificado"}</td></tr>
                    <tr><td class="label">Noches:</td><td>${data.nights || "No especificado"}</td></tr>
                    <tr><td class="label">Adultos:</td><td>${data.groupAdults || "No especificado"}</td></tr>
                    <tr><td class="label">Adolescentes (12-17):</td><td>${data.groupTeens || "0"}</td></tr>
                    <tr><td class="label">Niños (5-11):</td><td>${data.groupKids || "0"}</td></tr>
                    <tr><td class="label">Infantes (<5):</td><td>${data.groupInfants || "0"}</td></tr>
                    <tr><td class="label">Desayuno:</td><td>${data.breakfast === "true" ? "Sí" : "No"}</td></tr>
                </table>
                ${data.groupNotes ? `<p><strong>Notas:</strong> ${data.groupNotes}</p>` : ""}
                ${data.vehicles ? getVehiclesEmailTable(data.vehicles) : ""}
            `;

		case "vehicle":
			return `
                <h2>Información de Vehículos</h2>
                ${data.vehicles ? getVehiclesEmailTable(data.vehicles) : "<p>No se especificaron vehículos.</p>"}
                ${data.vehicleNotes ? `<p><strong>Notas:</strong> ${data.vehicleNotes}</p>` : ""}
            `;

		default:
			return "<p>Tipo de reserva no reconocido.</p>";
	}
}

/**
 * Genera tabla HTML para vehículos
 */
function getVehiclesEmailTable(
	vehicles: Array<{ type: string; plate: string }>,
): string {
	return `
        <h3>Vehículos</h3>
        <table>
            <thead>
                <tr>
                    <th style="text-align: left; padding: 8px; border-bottom: 2px solid #dee2e6;">#</th>
                    <th style="text-align: left; padding: 8px; border-bottom: 2px solid #dee2e6;">Tipo</th>
                    <th style="text-align: left; padding: 8px; border-bottom: 2px solid #dee2e6;">Placa</th>
                </tr>
            </thead>
            <tbody>
                ${vehicles
									.map(
										(vehicle, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${vehicle.type}</td>
                        <td>${vehicle.plate || "No especificada"}</td>
                    </tr>
                `,
									)
									.join("")}
            </tbody>
        </table>
    `;
}

/**
 * Genera plantilla de texto plano para email
 */
function generateTextTemplate(
	data: ProcessedBookingData,
	type: BookingType,
): string {
	const currentDate = new Date().toLocaleDateString("es-ES");

	let content = `Nueva ${type === "normal" ? "reserva" : type === "group" ? "reserva grupal" : "información de vehículos"} - Hotel Ensueños\n\n`;
	content += `Fecha: ${currentDate}\n`;
	content += "=".repeat(50) + "\n\n";

	content += getTextContent(data, type);
	content += "\n\n" + "=".repeat(50);
	content += "\nEste mensaje fue generado automáticamente.";
	content +=
		"\nPor favor, responder directamente al cliente para cualquier consulta.";

	return content;
}

/**
 * Genera contenido de texto según el tipo
 */
function getTextContent(data: ProcessedBookingData, type: BookingType): string {
	switch (type) {
		case "normal":
			return `
Detalles de la Reserva:
- Check In: ${data.checkin || "No especificado"}
- Check Out: ${data.checkout || "No especificado"}
- Noches: ${data.nights || "No especificado"}
- Adultos: ${data.adults || "No especificado"}
- Niños: ${data.children || "No especificado"}
- Habitaciones: ${data.rooms || "No especificado"}
- Desayuno: ${data.breakfast === "true" ? "Sí" : "No"}
${data.vehicles ? getVehiclesTextList(data.vehicles) : ""}
            `.trim();

		case "group":
			return `
Detalles de la Reserva Grupal:
- Check In: ${data.checkin || "No especificado"}
- Check Out: ${data.checkout || "No especificado"}
- Noches: ${data.nights || "No especificado"}
- Adultos: ${data.groupAdults || "No especificado"}
- Adolescentes (12-17): ${data.groupTeens || "0"}
- Niños (5-11): ${data.groupKids || "0"}
- Infantes (<5): ${data.groupInfants || "0"}
- Desayuno: ${data.breakfast === "true" ? "Sí" : "No"}
${data.groupNotes ? `- Notas: ${data.groupNotes}` : ""}
${data.vehicles ? getVehiclesTextList(data.vehicles) : ""}
            `.trim();

		case "vehicle":
			return `
Información de Vehículos:
${data.vehicles ? getVehiclesTextList(data.vehicles) : "No se especificaron vehículos."}
${data.vehicleNotes ? `Notas: ${data.vehicleNotes}` : ""}
            `.trim();

		default:
			return "Tipo de reserva no reconocido.";
	}
}

/**
 * Genera lista de vehículos en formato texto
 */
function getVehiclesTextList(
	vehicles: Array<{ type: string; plate: string }>,
): string {
	if (!vehicles || vehicles.length === 0) return "";

	return (
		"\n\nVehículos:\n" +
		vehicles
			.map(
				(vehicle, index) =>
					`  ${index + 1}. Tipo: ${vehicle.type}, Placa: ${vehicle.plate || "No especificada"}`,
			)
			.join("\n")
	);
}

/**
 * Cuenta la cantidad de vehículos en el formulario
 */
function getVehicleCount(formData: FormData): number {
	let count = 1;
	while (formData.has(`vehicleType${count}`)) {
		count++;
	}
	return count - 1;
}

/**
 * Obtiene datos de vehículos del formulario
 */
function getVehiclesData(
	formData: FormData,
	count: number,
): Array<{ type: string; plate: string }> {
	const vehicles = [];

	for (let i = 1; i <= count; i++) {
		const type = formData.get(`vehicleType${i}`) as string;
		const plate = formData.get(`vehiclePlate${i}`) as string;

		if (type) {
			vehicles.push({ type, plate: plate || "" });
		}
	}

	return vehicles;
}

/**
 * Valida los datos del formulario
 * @param formData - Datos del formulario
 * @param type - Tipo de reserva
 * @returns Array de errores de validación
 */
export function validateBookingData(
	formData: FormData,
	type: BookingType,
): string[] {
	const errors: string[] = [];

	switch (type) {
		case "normal":
			if (!formData.get("dateRange")) {
				errors.push("Fecha de reserva es requerida");
			}
			if (!formData.get("adults")) {
				errors.push("Número de adultos es requerido");
			}
			if (!formData.get("rooms")) {
				errors.push("Número de habitaciones es requerido");
			}
			break;

		case "group": {
			if (!formData.get("dateRangeGroup")) {
				errors.push("Fecha de reserva es requerida");
			}
			const groupAdults = formData.get("groupAdults");
			if (!groupAdults || parseInt(groupAdults as string) < 1) {
				errors.push("Debe especificar al menos 1 adulto");
			}
			break;
		}

		case "vehicle": {
			const vehicleCount = getVehicleCount(formData);
			if (vehicleCount === 0) {
				errors.push("Debe especificar al menos un vehículo");
			}
			break;
		}
	}

	return errors;
}
