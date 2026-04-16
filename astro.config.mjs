// astro.config.mjs

import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";

const isDevEnvironment = process.env.NODE_ENV === "development";

export default defineConfig({
	site: "https://www.hotelensueños.com",
	vite: {
		plugins: [tailwindcss()],
		assetsInclude: ["**/*.lottie"],
		resolve: {
			alias: {
				picocolors: "/src/polyfills/picocolors.js",
			},
		},
	},
	// Configurar i18n
	i18n: {
		defaultLocale: "es",
		locales: ["es", "en", "fr"],
		routing: {
			prefixDefaultLocale: false,
		},
	},
	integrations: [
		preact(),
		sitemap(),
		icon({ iconSets: [{ name: "astro", svg: { dir: "src/icons" } }] }),
	],
	...(isDevEnvironment
		? {}
		: {
				adapter: vercel({
					webAnalytics: { enabled: true },
				}),
			}),
	output: "server",
});
