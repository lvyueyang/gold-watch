import { createServerFn } from "@tanstack/react-start";
import { getCloudflareContext } from "../lib/context";
import type { Rule } from "../lib/types";

export const getRulesFn = createServerFn({ method: "GET" }).handler(
	async () => {
		try {
			const { env } = await getCloudflareContext();
			const db = env?.DB as D1Database;
			if (!db) return [];

			const { results } = await db
				.prepare("SELECT * FROM rules ORDER BY createdAt DESC")
				.all<any>();

			return results.map((r) => {
				try {
					return {
						...r,
						params: JSON.parse(r.params),
					};
				} catch (e) {
					return {
						...r,
						params: {},
					};
				}
			});
		} catch (e) {
			console.error("GET rules error:", e);
			return [];
		}
	},
);

export const createRuleFn = createServerFn({ method: "POST" }).handler(
	async (ctx: any) => {
		const data = ctx.data;
		const { env } = await getCloudflareContext();
		const db = env?.DB as D1Database;
		if (!db) throw new Error("Database not available");

		const id = crypto.randomUUID();
		const now = Date.now();

		await db
			.prepare(
				`INSERT INTO rules (id, name, instrumentId, type, params, webhook, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			)
			.bind(
				id,
				data.name,
				data.instrumentId,
				data.type,
				JSON.stringify(data.params),
				data.webhook,
				data.status,
				now,
				now,
			)
			.run();

		return { success: true, id };
	},
);

export const updateRuleFn = createServerFn({ method: "POST" }).handler(
	async (ctx: any) => {
		const data = ctx.data;
		const { env } = await getCloudflareContext();
		const db = env?.DB as D1Database;
		if (!db) throw new Error("Database not available");

		await db
			.prepare(
				`UPDATE rules 
      SET name = ?, instrumentId = ?, type = ?, params = ?, webhook = ?, updatedAt = ?
      WHERE id = ?`,
			)
			.bind(
				data.name,
				data.instrumentId,
				data.type,
				JSON.stringify(data.params),
				data.webhook,
				Date.now(),
				data.id,
			)
			.run();

		return { success: true };
	},
);

export const updateRuleStatusFn = createServerFn({ method: "POST" }).handler(
	async (ctx: any) => {
		const data = ctx.data;
		const { env } = await getCloudflareContext();
		const db = env?.DB as D1Database;
		if (!db) throw new Error("Database not available");

		await db
			.prepare(`UPDATE rules SET status = ?, updatedAt = ? WHERE id = ?`)
			.bind(data.status, Date.now(), data.id)
			.run();

		return { success: true };
	},
);

export const deleteRuleFn = createServerFn({ method: "POST" }).handler(
	async (ctx: any) => {
		const data = ctx.data;
		const { env } = await getCloudflareContext();
		const db = env?.DB as D1Database;
		if (!db) throw new Error("Database not available");

		await db.prepare(`DELETE FROM rules WHERE id = ?`).bind(data.id).run();

		return { success: true };
	},
);
