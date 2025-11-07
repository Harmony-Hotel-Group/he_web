// src/services/messages/telegram.ts
// Telegram Bot API sender (safe no-op if not configured)

const ENV = {
	TELEGRAM_BOT_TOKEN: import.meta.env.TELEGRAM_BOT_TOKEN as string | undefined,
	TELEGRAM_CHAT_ID: import.meta.env.TELEGRAM_CHAT_ID as string | undefined,
	DEV: import.meta.env.DEV as boolean,
};

export async function sendTelegramMessage(text: string, chatId?: string) {
	const token = ENV.TELEGRAM_BOT_TOKEN;
	const chat = chatId ?? ENV.TELEGRAM_CHAT_ID;
	if (!token || !chat) {
		if (ENV.DEV)
			console.warn(
				"[messages/telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID; skipping",
			);
		return { ok: false, skipped: true } as const;
	}

	const url = `https://api.telegram.org/bot${token}/sendMessage`;
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ chat_id: chat, text }),
		});
		return { ok: res.ok, status: res.status } as const;
	} catch (e) {
		const error = e instanceof Error ? e.message : String(e);
		return { ok: false, error } as const;
	}
}
