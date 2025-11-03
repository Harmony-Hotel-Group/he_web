import node from "@astrojs/node";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

const isDevEnvironment = process.env.NODE_ENV === "development";

export default defineConfig({
	site: "https://www.hotelensueños.com",
	i18n: {
		locales: ["en", "es"],
		defaultLocale: "es",
		routing: {
			prefixDefaultLocale: true,
		},
	},
	integrations: [
		tailwindcss(),
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
});
