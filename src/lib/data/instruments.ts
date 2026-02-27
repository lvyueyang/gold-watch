import { Instrument } from '@/lib/types';
import { getAllQuotes, getPausedInstruments } from '@/lib/kv';
import { AVAILABLE_INSTRUMENTS } from '@/lib/sources/registry';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface InstrumentWithRules extends Instrument {
  rulesCount: number;
  lastPrice: number;
  updatedAt: string;
}

async function getRuleCounts(): Promise<Record<string, number>> {
  try {
    const { env } = await getCloudflareContext();
    const db = env.DB as D1Database;

    if (!db) return {};

    const { results } = await db
      .prepare("SELECT instrumentId, COUNT(*) as count FROM rules WHERE status = 'active' GROUP BY instrumentId")
      .all<{ instrumentId: string; count: number }>();

    const counts: Record<string, number> = {};
    results.forEach((row) => {
      counts[row.instrumentId] = row.count;
    });
    return counts;
  } catch (e) {
    console.warn('Failed to get rule counts:', e);
    return {};
  }
}

export async function getInstruments(): Promise<InstrumentWithRules[]> {
  try {
    // 从 KV 获取最新价格以确保实时性
    const quotesPromise = getAllQuotes();
    // 从 D1 获取规则数量
    const ruleCountsPromise = getRuleCounts();
    // 获取暂停的标的列表
    const pausedPromise = getPausedInstruments();

    const [quotes, ruleCounts, pausedList] = await Promise.all([quotesPromise, ruleCountsPromise, pausedPromise]);
    const pausedSet = new Set(pausedList);

    const quoteMap = new Map(quotes.map((q) => [q.instrumentId, q]));

    // 将代码定义的标的与 KV 数据合并
    return AVAILABLE_INSTRUMENTS.map((inst) => {
      const quote = quoteMap.get(inst.id);
      const isPaused = pausedSet.has(inst.id);

      return {
        ...inst,
        status: isPaused ? 'paused' : 'active',
        rulesCount: ruleCounts[inst.id] || 0,
        lastPrice: quote ? quote.price : 0,
        updatedAt: quote ? new Date(quote.ts).toLocaleString('zh-CN') : new Date().toLocaleString('zh-CN'),
      };
    });
  } catch (e) {
    console.error('Failed to fetch instruments data:', e);
    // Fallback: 返回基础标的列表，状态设为默认值
    return AVAILABLE_INSTRUMENTS.map((inst) => ({
      ...inst,
      status: 'active',
      rulesCount: 0,
      lastPrice: 0,
      updatedAt: '暂无数据',
    }));
  }
}
