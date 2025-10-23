// src/utils/apiService.js
import fs from "node:fs";
import path from "node:path";

let lastStatusCheckTime = 0;
const lastApiDataCache = {}; // Cache for the last successfully fetched API data
const lastDataUpdateTime = {};
const STATUS_CHECK_INTERVAL =
	parseInt(import.meta.env.STATUS_CHECK_INTERVAL_MINUTES || "5") * 60 * 1000;
const DATA_UPDATE_INTERVAL = 60 * 60 * 1000; // 1 hora para actualizar data

const API_BASE_URL = import.meta.env.API_BASE_URL;
const MAILGUN_API_KEY = import.meta.env.MAILGUN_API_KEY;
const ADMIN_EMAIL = import.meta.env.ADMIN_EMAIL;
const SENDER_EMAIL = import.meta.env.SENDER_EMAIL || "no-reply@yourdomain.com";
const MAILGUN_DOMAIN = import.meta.env.MAILGUN_DOMAIN; // Nueva variable de entorno
const IS_DEBUG_MODE = false;

async function sendAdminNotification(subject, text) {
	if (IS_DEBUG_MODE) {
		console.log("DEBUG MODE: Skipping Mailgun notification.");
		console.log("Notification details:", { subject, text });
		return;
	}

	if (!MAILGUN_API_KEY || !ADMIN_EMAIL || !SENDER_EMAIL || !MAILGUN_DOMAIN) {
		console.warn(
			"Mailgun API key, Admin Email, Sender Email or Mailgun Domain not configured. Skipping notification.",
		);
		return;
	}

	const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;

	try {
		const response = await fetch(mailgunUrl, {
			method: "POST",
			headers: {
				Authorization: `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				from: `Admin <${SENDER_EMAIL}>`,
				to: ADMIN_EMAIL,
				subject: subject,
				text: text,
			}).toString(),
		});

		if (!response.ok) {
			console.error(
				"Failed to send admin notification:",
				response.status,
				response.statusText,
			);
		} else {
			console.log("Admin notification sent successfully.");
		}
	} catch (error) {
		console.error("Error sending admin notification:", error);
	}
}

async function checkApiStatus() {
	const now = Date.now();
	if (now - lastStatusCheckTime < STATUS_CHECK_INTERVAL) {
		return true; // Asumir OK si está en el intervalo de throttling
	}

	try {
		const response = await fetch(`${API_BASE_URL}/status`);

		lastStatusCheckTime = now;
		if (response.ok) {
			console.log("API Status: OK");
			return true;
		} else {
			console.error("API Status: Error", response.status);
			await sendAdminNotification(
				"Alerta: API de Servicio Caída",
				`El endpoint /status de la API (${API_BASE_URL}/status) devolvió un código ${response.status}. Por favor, investiga.`,
			);
			return false;
		}
	} catch (error) {
		console.error("API Status: Network Error", error);
		await sendAdminNotification(
			"Alerta: Error de Red con la API",
			`No se pudo conectar con el endpoint /status de la API (${API_BASE_URL}/status). Error: ${error.message}. Por favor, investiga.`,
		);
		return false;
	}
}

// Helper function to fetch local JSON data dynamically
async function getLocalData(dataType) {
	// Convert slashes to hyphens for local file naming
	const localFileName = dataType.replace(/\//g, "-");
	// const localFilePath = `http://localhost:4321/data/${localFileName}.json`;
	const localFilePath = path.join(
		process.cwd(),
		"src",
		"data",
		`${localFileName}.json`,
	);

	try {
		const content = fs.readFileSync(localFilePath, "utf-8");
		const data = JSON.parse(content);

		return data;
	} catch (error) {
		console.error(`❌ Error leyendo ${dataType} en ${localFilePath}:`, error);
		return null;
	}
}

async function fetchData(dataType) {
	// const apiIsUp = await checkApiStatus();
	// const now = Date.now();

	// if (apiIsUp) {
		// Si la API está activa, intentamos obtener la data de la API
		// y la actualizamos si ha pasado el tiempo
		// if (now - (lastDataUpdateTime[dataType] || 0) > DATA_UPDATE_INTERVAL) {
		// 	try {
		// 		const response = await fetch(`${API_BASE_URL}/${dataType}`);
		// 		if (response.ok) {
		// 			const apiData = await response.json();
		// 			lastApiDataCache[dataType] = apiData; // Cache the successful API data
		// 			lastDataUpdateTime[dataType] = now;
		// 			return apiData;
		// 		} else {
		// 			console.warn(
		// 				`Failed to fetch ${dataType} from API (${response.status}). Falling back to cached API data or local data.`,
		// 			);
		// 			// Si la petición a la API falla, intenta devolver la última data de la API en caché, si no, la data local
		// 			return lastApiDataCache[dataType] || (await getLocalData(dataType));
		// 		}
		// 	} catch (error) {
		// 		console.error(
		// 			`Error fetching ${dataType} from API. Falling back to cached API data or local data.`,
		// 			error,
		// 		);
		// 		// Si la petición a la API falla, intenta devolver la última data de la API en caché, si no, la data local
		// 		return lastApiDataCache[dataType] || (await getLocalData(dataType));
		// 	}
		// } else {
		// 	// La API está activa, pero dentro del intervalo de actualización. Devuelve la data de la API en caché si está disponible, si no, la data local.
		// 	return lastApiDataCache[dataType] || (await getLocalData(dataType));
		// }
	// } else {
	// 	// Si la API está caída, siempre servimos la data local desde el endpoint
	// 	console.warn(`API is down. Serving local ${dataType} data.`);
	// }
	return await getLocalData(dataType);
}

export { fetchData };
