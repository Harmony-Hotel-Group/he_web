/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly PROD: boolean;
	readonly DEV: boolean;
	readonly VERCEL_URL?: string;
	readonly PUBLIC_API_BASE_URL?: string;
	readonly PUBLIC_MIXPANEL_TOKEN?: string;
	readonly BASE_URL?: string;
	readonly SESSION_SECRET?: string;
	readonly ADMIN_USER?: string;
	readonly ADMIN_PASS?: string;
	readonly MAILGUN_API_KEY?: string;
	readonly MAILGUN_DOMAIN?: string;
	readonly SENDER_EMAIL?: string;
	readonly ADMIN_EMAIL?: string;
	readonly TELEGRAM_BOT_TOKEN?: string;
	readonly TELEGRAM_CHAT_ID?: string;
	readonly WHATSAPP_TOKEN?: string;
	readonly WHATSAPP_PHONE_ID?: string;
	readonly WHATSAPP_DESTINATION_PHONE?: string;
	readonly ERP_API_URL?: string;
	readonly ERP_API_KEY?: string;
	readonly ERP_SYNC_INTERVAL?: string;
	readonly FORCE_HTTPS?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
