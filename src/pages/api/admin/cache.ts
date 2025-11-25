import type { APIContext } from "astro";
import { configureCacheControl } from "@/utils/apiHelpers";
import { logger } from "@/services/logger";

export const prerender = false;

const log = logger("ApiAdminCache");

export async function POST({ request }: APIContext) {
    const authHeader = request.headers.get("Authorization");
    const privateKey = import.meta.env.CACHE_PRIVATE_KEY;

    if (!privateKey || authHeader !== `Bearer ${privateKey}`) {
        log.warn("Unauthorized attempt to access cache control API.");
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const body = await request.json();
        const { action, targets, duration, count } = body;

        if (!action || (action !== "flush" && action !== "disable")) {
            return new Response(JSON.stringify({ error: "Invalid action" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const result = configureCacheControl({
            action,
            targets,
            duration,
            count,
        });

        if (!result.success) {
            if (result.missingKeys) {
                return new Response(
                    JSON.stringify({
                        error: `Cache not configured for keys: ${result.missingKeys.join(", ")}`,
                    }),
                    {
                        status: 400,
                        headers: { "Content-Type": "application/json" },
                    },
                );
            }
            return new Response(JSON.stringify({ error: "Operation failed" }), {
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }

        log.info(`Cache control action '${action}' executed successfully.`, {
            targets,
            duration,
            count,
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (e) {
        log.error("Error processing cache control request:", e);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
