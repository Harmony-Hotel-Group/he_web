// src/services/messages/email.ts
// Thin email sender module (Mailgun-compatible). Safe no-op when not configured.

interface SendEmailInput {
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
	from?: string;
}

const ENV = {
	MAILGUN_API_KEY: import.meta.env.MAILGUN_API_KEY as string | undefined,
	MAILGUN_DOMAIN: import.meta.env.MAILGUN_DOMAIN as string | undefined,
	SENDER_EMAIL:
		(import.meta.env.SENDER_EMAIL as string | undefined) ??
		"no-reply@yourdomain.com",
	ADMIN_EMAIL: import.meta.env.ADMIN_EMAIL as string | undefined,
	DEV: import.meta.env.DEV as boolean,
};

function getBasicAuth(apiKey: string) {
	// btoa is not available in some Node runtimes; provide fallback
	const token = Buffer.from(`api:${apiKey}`).toString("base64");
	return `Basic ${token}`;
}

async function doMailgunSend(params: URLSearchParams) {
	if (!ENV.MAILGUN_API_KEY || !ENV.MAILGUN_DOMAIN) {
		if (ENV.DEV)
			console.warn("[messages/email] Mailgun not configured, skipping send");
		return { ok: false, skipped: true } as const;
	}
	const url = `https://api.mailgun.net/v3/${ENV.MAILGUN_DOMAIN}/messages`;
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: getBasicAuth(ENV.MAILGUN_API_KEY),
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params.toString(),
	});
	return { ok: res.ok, status: res.status } as const;
}

export async function sendEmail(input: SendEmailInput) {
	const to = Array.isArray(input.to) ? input.to.join(",") : input.to;
	const from = input.from ?? `Admin <${ENV.SENDER_EMAIL}>`;

	const params = new URLSearchParams();
	params.set("from", from);
	params.set("to", to);
	params.set("subject", input.subject);
	if (input.text) params.set("text", input.text);
	if (input.html) params.set("html", input.html);

	try {
		const result = await doMailgunSend(params);
		if (ENV.DEV) console.log("[messages/email] send result:", result);
		return result;
	} catch (e: any) {
		console.error("[messages/email] send error:", e?.message || e);
		return { ok: false, error: e } as const;
	}
}

export async function sendAdminEmail(
	subject: string,
	text?: string,
	html?: string,
) {
	if (!ENV.ADMIN_EMAIL) {
		if (ENV.DEV)
			console.warn(
				"[messages/email] ADMIN_EMAIL not set, skipping admin email",
			);
		return { ok: false, skipped: true } as const;
	}
	return sendEmail({ to: ENV.ADMIN_EMAIL, subject, text, html });
}
