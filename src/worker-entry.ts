// @ts-nocheck

import {
	createStartHandler,
	defaultStreamHandler,
} from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";
import { collectAndNotify } from "./lib/services/collector";

const handler = createStartHandler({
	createRouter: defaultStreamHandler,
});

const entry = createServerEntry({
	fetch: async ({ request, context }) => {
		return handler({ request, context });
	},
});

export default {
	fetch: async (request: Request, env: any, ctx: any) => {
		return entry.fetch({
			request,
			context: { cloudflare: { env, ctx } },
		});
	},
	async scheduled(
		event: ScheduledEvent,
		env: CloudflareEnv,
		ctx: ExecutionContext,
	) {
		console.log("Scheduled event triggered:", event.cron);
		await collectAndNotify(env, ctx);
	},
};
