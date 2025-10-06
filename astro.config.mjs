import {defineConfig} from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import icon from "astro-icon";
import node from '@astrojs/node'
import vercel from '@astrojs/vercel'

const isDevEnvironment = process.env.NODE_ENV === "development";

export default defineConfig({
    site: 'https://www.hotelensueños.com',
    build: {partialBuild: true},
    integrations: [tailwind(), preact(), icon({iconSets: [{name: "astro", svg: {dir: "src/icons"}}]})],
    adapter: isDevEnvironment
        ? node({
            mode: "server",
        })
        : vercel({
            webAnalytics: {enabled: true},
        }),
    output: "server"
});
