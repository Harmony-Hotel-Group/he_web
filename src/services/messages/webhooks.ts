// src/services/messages/webhooks.ts
// Generic webhook sender with timeout and optional headers.

interface WebhookOptions {
	headers?: Record<string, string>;
	timeoutMs?: number;
}

export async function postWebhook(
	url: string,
	payload: any,
	options: WebhookOptions = {},
) {
	const { headers, timeoutMs = 8000 } = options;
	const controller = new AbortController();
	const id = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				...(headers || {}),
			},
			body: JSON.stringify(payload),
			signal: controller.signal,
		});
		clearTimeout(id);
		const text = await res.text().catch(() => "");
		return { ok: res.ok, status: res.status, body: text } as const;
	} catch (e: any) {
		clearTimeout(id);
		return { ok: false, error: e?.message || String(e) } as const;
	}
}
