/// <reference types="astro/client" />

declare module "*.astro" {
	import type { AstroComponentFactory } from "astro/runtime/server";
	const component: AstroComponentFactory;
	export default component;
}

interface ImportMetaEnv {
	readonly DEBUG: boolean;
	readonly API_BASE_URL: string;

	readonly STATUS_CHECK_INTERVAL_MINUTES: string;

	readonly MAILGUN_API_KEY: string;
	readonly ADMIN_EMAIL: string;
	readonly SENDER_EMAIL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
