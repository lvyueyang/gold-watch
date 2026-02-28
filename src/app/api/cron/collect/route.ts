import { NextRequest, NextResponse } from 'next/server';
import { fetchJdGold } from '@/lib/sources/jd';
import { saveQuote, updateSystemHealth } from '@/lib/kv';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Rule } from '@/lib/types';
import { matchRules } from '@/lib/engine/matcher';
import { sendWebhook } from '@/lib/notification/sender';

// export const runtime = 'edge';
export const maxDuration = 60; // 允许最长执行 60 秒

async function collectOnce() {
  // 1. 获取数据
  const tick = await fetchJdGold();
  if (!tick) return null;

  // 2. 存入 KV (供 UI 展示)
  await saveQuote(tick);

  // 3. 从 D1 获取规则
  let rules: Rule[] = [];
  try {
    const { env } = await getCloudflareContext();
    const db = env.DB as D1Database;

    if (db) {
      const { results } = await db
        .prepare("SELECT * FROM rules WHERE status = 'active' AND instrumentId = ?")
        .bind(tick.instrumentId)
        .all<any>();

      // 解析 JSON 参数
      rules = results.map((r) => ({
        ...r,
        params: JSON.parse(r.params),
      }));
    }
  } catch (e) {
    console.warn('Failed to load rules:', e);
  }

  // 4. 匹配规则
  const triggeredRules = matchRules(tick, rules);

  // 5. 通知 (即发即弃)
  // 在真实的 Worker 环境中，这里应该使用 ctx.waitUntil()

  triggeredRules.forEach((rule) => {
    // 待办: 检查冷却时间
    sendWebhook(rule, tick);
  });

  return { tick, matched: triggeredRules.length };
}

export async function GET(req: NextRequest) {
  let count = 0;
  let lastResult = null;

  try {
    lastResult = await collectOnce();
    if (lastResult) count = 1;
  } catch (e) {
    console.error('Collect error:', e);
  }

  // 记录心跳
  await updateSystemHealth({
    lastCollect: {
      ts: Date.now(),
      success: count > 0,
      executions: count,
      matched: lastResult?.matched || 0,
    },
  });

  return NextResponse.json({
    success: true,
    executions: count,
    lastTick: lastResult?.tick,
  });
}
