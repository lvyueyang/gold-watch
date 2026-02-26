import { getCloudflareContext } from '@opennextjs/cloudflare';
import { PriceTick } from '@/lib/types';

export const KV_QUOTES = 'KV_QUOTES';

async function getKV(): Promise<KVNamespace | null> {
  try {
    const { env } = await getCloudflareContext();
    return env[KV_QUOTES] as KVNamespace;
  } catch (e) {
    console.warn('Failed to get Cloudflare context:', e);
    return null;
  }
}

export async function saveQuote(tick: PriceTick) {
  const kv = await getKV();
  if (!kv) {
    console.warn('KV_QUOTES 绑定未找到');
    return;
  }

  const key = `quote:${tick.instrumentId}`;
  await kv.put(key, JSON.stringify(tick), {
    expirationTtl: 86400, // 24 小时
  });
}

export async function getQuote(instrumentId: string): Promise<PriceTick | null> {
  const kv = await getKV();
  if (!kv) return null;

  const key = `quote:${instrumentId}`;
  const data = await kv.get(key, 'json');
  return data as PriceTick | null;
}

export async function getAllQuotes(): Promise<PriceTick[]> {
  const kv = await getKV();
  if (!kv) return [];

  const list = await kv.list({ prefix: 'quote:' });
  const ticks: PriceTick[] = [];

  for (const key of list.keys) {
    const data = await kv.get(key.name, 'json');
    if (data) {
      ticks.push(data as PriceTick);
    }
  }

  return ticks;
}

// 配置助手函数
const CONFIG_KEY_INTERVAL = 'config:interval';

export async function getFetchInterval(): Promise<number> {
  const kv = await getKV();
  if (!kv) return 20; // 如果没有 KV，默认为 20 秒

  const val = await kv.get(CONFIG_KEY_INTERVAL);
  return val ? parseInt(val) : 20;
}

export async function setFetchInterval(seconds: number) {
  const kv = await getKV();
  if (!kv) return;

  await kv.put(CONFIG_KEY_INTERVAL, seconds.toString());
}

// 标的暂停配置
const CONFIG_KEY_PAUSED_INSTRUMENTS = 'config:paused_instruments';

export async function getPausedInstruments(): Promise<string[]> {
  const kv = await getKV();
  if (!kv) return [];

  const val = await kv.get(CONFIG_KEY_PAUSED_INSTRUMENTS, 'json');
  return (val as string[]) || [];
}

export async function setPausedInstruments(ids: string[]) {
  const kv = await getKV();
  if (!kv) return;

  await kv.put(CONFIG_KEY_PAUSED_INSTRUMENTS, JSON.stringify(ids));
}

export async function toggleInstrumentStatus(id: string, active: boolean) {
  const paused = await getPausedInstruments();
  const set = new Set(paused);

  if (active) {
    set.delete(id); // 如果要激活，就从暂停列表中移除
  } else {
    set.add(id); // 如果要暂停，就加入暂停列表
  }

  await setPausedInstruments(Array.from(set));
}

// 系统健康状态
const SYSTEM_HEALTH_KEY = 'system:health';

export interface SystemHealth {
  lastCollect: {
    ts: number;
    success: boolean;
    executions: number;
    matched: number;
  };
  sources?: Record<
    string,
    {
      total: number;
      success: number;
      lastStatus: 'success' | 'failed';
      lastRun: number;
    }
  >;
}

export async function updateSourceHealth(source: string, success: boolean) {
  const kv = await getKV();
  if (!kv) return;

  const current = ((await kv.get(SYSTEM_HEALTH_KEY, 'json')) as SystemHealth) || {};
  const sources = current.sources || {};

  const sourceStats = sources[source] || { total: 0, success: 0, lastStatus: 'success', lastRun: 0 };

  sourceStats.total += 1;
  if (success) sourceStats.success += 1;
  sourceStats.lastStatus = success ? 'success' : 'failed';
  sourceStats.lastRun = Date.now();

  sources[source] = sourceStats;
  current.sources = sources;

  await kv.put(SYSTEM_HEALTH_KEY, JSON.stringify(current));
}

export async function updateSystemHealth(health: Partial<SystemHealth>) {
  const kv = await getKV();
  if (!kv) return;

  const current = ((await kv.get(SYSTEM_HEALTH_KEY, 'json')) as SystemHealth) || {};
  const updated = { ...current, ...health };

  await kv.put(SYSTEM_HEALTH_KEY, JSON.stringify(updated));
}

export async function getSystemHealth(): Promise<SystemHealth | null> {
  const kv = await getKV();
  if (!kv) return null;
  return await kv.get(SYSTEM_HEALTH_KEY, 'json');
}
