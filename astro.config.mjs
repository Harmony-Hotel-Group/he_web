import node from "@astrojs/node";
import preact from "@astrojs/preact";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

import icon from "astro-icon";

const isDevEnvironment = process.env.NODE_ENV === "development";

export default defineConfig({
	site: "https://www.hotelensueños.com",
	build: { partialBuild: true },
	i18n: {
		locales: ["en", "es"],
		defaultLocale: "es",
		routing: {
			prefixDefaultLocale: true,
		},
	},
	integrations: [
		preact({ compat: true }),
		tailwind(),
		icon({ iconSets: [{ name: "astro", svg: { dir: "src/icons" } }] }),
	],
	adapter: isDevEnvironment
		? node({
				mode: "server",
			})
		: vercel({
				webAnalytics: { enabled: true },
			}),
	output: "server",
	server: {
		host: true,
	},
});
