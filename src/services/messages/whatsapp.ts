// src/services/messages/whatsapp.ts
// WhatsApp Cloud API sender (safe no-op if not configured).
// This is a minimal helper; adapt template and phone_id to your app's requirements.

interface WhatsAppOptions {
	token?: string; // Meta Graph API token
	phoneId?: string; // WhatsApp Business phone number ID
}

const ENV = {
	WHATSAPP_TOKEN: import.meta.env.WHATSAPP_TOKEN as string | undefined,
	WHATSAPP_PHONE_ID: import.meta.env.WHATSAPP_PHONE_ID as string | undefined,
	DEV: import.meta.env.DEV as boolean,
};

export async function sendWhatsappMessage(
	toE164: string,
	bodyText: string,
	options: WhatsAppOptions = {},
) {
	const token = options.token ?? ENV.WHATSAPP_TOKEN;
	const phoneId = options.phoneId ?? ENV.WHATSAPP_PHONE_ID;
	if (!token || !phoneId) {
		if (ENV.DEV)
			console.warn(
				"[messages/whatsapp] Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_ID; skipping",
			);
		return { ok: false, skipped: true } as const;
	}

	const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;
	const payload = {
		messaging_product: "whatsapp",
		to: toE164,
		type: "text",
		text: { body: bodyText },
	};

	try {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});
		const text = await res.text().catch(() => "");
		return { ok: res.ok, status: res.status, body: text } as const;
	} catch (e) {
		const error = e instanceof Error ? e.message : String(e);
		return { ok: false, error } as const;
	}
}
