import { NextRequest, NextResponse } from 'next/server';
import { fetchJdGold } from '@/lib/sources/jd';
import { saveQuote, getFetchInterval, updateSystemHealth } from '@/lib/kv';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Rule } from '@/lib/types';
import { matchRules } from '@/lib/engine/matcher';
import { sendWebhook } from '@/lib/notification/sender';

export const runtime = 'edge';
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
  // 获取配置的间隔
  const interval = await getFetchInterval();
  const safeInterval = Math.max(5, interval); // 最小 5 秒，防止过频

  // 计算在一分钟内可以执行多少次
  // 留出最后 2 秒缓冲
  const maxExecutionTime = 58 * 1000;
  const startTime = Date.now();
  let count = 0;
  let lastResult = null;

  while (Date.now() - startTime < maxExecutionTime) {
    const loopStart = Date.now();

    // 执行一次采集
    try {
      lastResult = await collectOnce();
      count++;
    } catch (e) {
      console.error('Collect error:', e);
    }

    // 计算下次执行时间
    const elapsed = Date.now() - loopStart;
    const remaining = safeInterval * 1000 - elapsed;

    // 如果剩余时间太短，就不等待了，直接下一轮（或者结束）
    // 如果还有时间，就等待
    if (remaining > 0) {
      // 检查等待后是否会超时
      if (Date.now() + remaining - startTime > maxExecutionTime) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }
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
    interval: safeInterval,
    lastTick: lastResult?.tick,
  });
}
