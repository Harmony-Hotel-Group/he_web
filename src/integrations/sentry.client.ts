// src/integrations/sentry.client.ts
// Inicializa Sentry una sola vez por sesión de navegador.
import * as Sentry from "@sentry/astro";

const SENTRY_DSN = "" as string | undefined;

if (SENTRY_DSN) {
	Sentry.init({
		dsn: SENTRY_DSN,
		environment: import.meta.env.PROD ? "production" : "development",
		tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,
		integrations: [Sentry.replayIntegration({})],
	});
}
