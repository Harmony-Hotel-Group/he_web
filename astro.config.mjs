import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import preact from '@astrojs/preact';

export default defineConfig({
  output: 'static',
  integrations: [
    tailwind({
      config: './tailwind.config.cjs'
    }),
    preact()
  ]
});