export function truncate(text: string, max = 100): string {
	return text.length > max ? text.slice(0, max) + "…" : text;
}
