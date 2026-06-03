import type { APIContext } from "astro";

export const prerender = false;

export async function GET(_ctx: APIContext) {
	return new Response(JSON.stringify({ status: "ok" }), {
		status: 200,
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Cache-Control": "no-store",
		},
	});
}
