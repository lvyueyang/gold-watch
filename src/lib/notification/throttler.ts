import { getCloudflareContext } from "../context";

const THROTTLE_PREFIX = "throttle:";

async function getKV(): Promise<KVNamespace | null> {
	try {
		const { env } = await getCloudflareContext();
		// 优先使用 KV_DEDUP，如果没有则降级到 KV_QUOTES
		return (env.KV_DEDUP || env.KV_QUOTES) as KVNamespace;
	} catch (e) {
		console.warn("Failed to get Cloudflare context:", e);
		return null;
	}
}

/**
 * Check if an alert should be throttled.
 * Returns true if it should be throttled (i.e., NOT sent).
 * Returns false if it should be sent.
 * @param ruleId The unique ID of the rule.
 * @param cooldownSeconds The cooldown period in seconds.
 */
export async function shouldThrottle(
	ruleId: string,
	cooldownSeconds: number = 300,
): Promise<boolean> {
	const kv = await getKV();
	if (!kv) return false; // Fail open if KV is missing

	const key = `${THROTTLE_PREFIX}${ruleId}`;
	const lastSent = await kv.get(key);

	if (lastSent) {
		return true; // Already sent recently
	}

	// Mark as sent
	await kv.put(key, Date.now().toString(), {
		expirationTtl: cooldownSeconds,
	});

	return false;
}

/**
 * Manually reset throttle for a rule (optional, for future use)
 */
export async function resetThrottle(ruleId: string) {
	const kv = await getKV();
	if (!kv) return;
	const key = `${THROTTLE_PREFIX}${ruleId}`;
	await kv.delete(key);
}
