import { defineConfig, z } from 'astro:env/server';

export const env = defineConfig({
  schema: z.object({
    API_BASE_URL: z.string().url().optional(),
    MAILGUN_API_KEY: z.string().optional(),
    MAILGUN_DOMAIN: z.string().optional(),
    ADMIN_EMAIL: z.string().email().optional(),
    SENDER_EMAIL: z.string().email().optional(),
    DEBUG: z.string().optional(),
    STATUS_CHECK_INTERVAL_MINUTES: z.string().optional(),
  })
});
