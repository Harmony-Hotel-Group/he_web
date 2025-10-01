import {defineConfig} from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';
import node from '@astrojs/node'
import vercel from '@astrojs/vercel'

const isVercel = process.env.VERCEL === '1'

export default defineConfig({
    output: 'server', // Habilitar el modo SSR
    adapter: isVercel ? vercel() : node({
        mode: 'server'
    }),
    integrations: [tailwind(), preact()]
});
