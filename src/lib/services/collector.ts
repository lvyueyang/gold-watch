import { getCloudflareContext } from "@/lib/context";
import { matchRules } from "@/lib/engine/matcher";
import { getKV } from "@/lib/kv";
import { sendWebhook } from "@/lib/notification/sender";
import { fetchJdGold } from "@/lib/sources/jd";
import type { PriceTick, Rule } from "@/lib/types";

export async function collectAndNotify(
	env?: CloudflareEnv,
	ctx?: ExecutionContext,
): Promise<{ tick: PriceTick | null; matched: number }> {
	const tick = await fetchJdGold();
	if (!tick) return { tick: null, matched: 0 };

	let kv: KVNamespace | null = null;
	if (env && (env as any).KV_QUOTES) {
		kv = (env as any).KV_QUOTES as KVNamespace;
	} else {
		kv = await getKV();
	}
	if (kv) {
		await kv.put(`quote:${tick.instrumentId}`, JSON.stringify(tick), {
			expirationTtl: 86400,
		});
	}

	let rules: Rule[] = [];
	try {
		let db: D1Database | null = null;
		if (env && (env as any).DB) {
			db = (env as any).DB as D1Database;
		} else {
			const { env: cenv } = await getCloudflareContext();
			db = (cenv as any).DB as D1Database;
		}
		if (db) {
			const { results } = await db
				.prepare(
					"SELECT * FROM rules WHERE status = 'active' AND instrumentId = ?",
				)
				.bind(tick.instrumentId)
				.all<any>();
			rules = results.map((r) => ({ ...r, params: JSON.parse(r.params) }));
		}
	} catch (e) {}

	const triggered = matchRules(tick, rules);
	for (const rule of triggered) {
		const p = sendWebhook(rule, tick, env);
		if (ctx) ctx.waitUntil(p);
		else await p;
	}

	return { tick, matched: triggered.length };
}
