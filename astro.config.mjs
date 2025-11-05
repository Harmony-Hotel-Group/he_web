import node from "@astrojs/node";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import icon from "astro-icon";

const isDevEnvironment = process.env.NODE_ENV === "development";

export default defineConfig({
	site: "https://www.hotelensueños.com",
	// Configurar i18n
	i18n: {
		defaultLocale: "es",
		locales: ["es", "en"],
		routing: {
			prefixDefaultLocale: false, // /es/ no aparecerá
		},
	},
	integrations: [
		tailwindcss(),
		icon({ iconSets: [{ name: "astro", svg: { dir: "src/icons" } }] }),
	],
	adapter: isDevEnvironment
		? node({
				mode: "static",
			})
		: vercel({
				webAnalytics: { enabled: true },
			}),
	output: "static",
	build: {
		format: "directory", // Genera /about/index.html en lugar de /about.html
	},
});
