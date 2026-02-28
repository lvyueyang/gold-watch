import { getEvent } from "vinxi/http";

export function getCloudflareContext() {
	try {
		const event = getEvent();
		return event.context.cloudflare || { env: {} };
	} catch (e) {
		return { env: {} };
	}
}

export function getEnv(key: string): string | undefined {
	try {
		const context = getCloudflareContext();
		return context.env?.[key] || process.env[key];
	} catch (e) {
		return process.env[key];
	}
}
