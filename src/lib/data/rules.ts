import { getCloudflareContext } from '../context';
import type { Rule } from '../types';

export async function updateRuleLastTriggered(id: string, ts: number) {
  try {
    const { env } = await getCloudflareContext();
    const db = env.DB as D1Database;
    if (!db) return;

    await db
      .prepare('UPDATE rules SET lastTriggeredAt = ? WHERE id = ?')
      .bind(ts, id)
      .run();
  } catch (e) {
    console.error('Failed to update rule lastTriggeredAt:', e);
  }
}

export async function getRules(): Promise<Rule[]> {
  let db: D1Database | null = null;

  try {
    const { env } = await getCloudflareContext();
    db = env.DB as D1Database;
  } catch (e) {
    console.warn('Failed to get Cloudflare context:', e);
  }

  if (!db) {
    return [];
  }

  try {
    const { results } = await db
      .prepare('SELECT * FROM rules ORDER BY createdAt DESC')
      .all<any>();

    return results.map((r) => ({
      ...r,
      params: JSON.parse(r.params),
    }));
  } catch (e) {
    console.error('Failed to fetch rules:', e);
    return [];
  }
}
