import { createServerFn } from "@tanstack/react-start";
import { collectAndNotify } from "@/lib/services/collector";

export const collectDataFn = createServerFn({ method: "POST" }).handler(
	async () => {
		try {
			const result = await collectAndNotify();
			return { success: true, data: result };
		} catch (e) {
			console.error("Manual collect error:", e);
			return { success: false, error: String(e) };
		}
	},
);
