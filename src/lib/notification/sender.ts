import type { Rule, PriceTick } from '@/lib/types';
import { WebhookAdapterFactory } from './adapters';
import { shouldThrottle } from './throttler';
import { getInstrumentConfig } from '@/lib/sources/registry';
import { updateRuleLastTriggered } from '@/lib/data/rules';
import { getKV } from '@/lib/kv';

async function getWebhookUrl(id: string, env?: CloudflareEnv): Promise<string | undefined> {
  const key =
    id === 'feishu'
      ? 'WEBHOOK_FEISHU'
      : id === 'dingtalk'
      ? 'WEBHOOK_DINGTALK'
      : id === 'wecom'
      ? 'WEBHOOK_WECOM'
      : undefined;
  if (!key) return undefined;

  try {
    let kv: KVNamespace | null = null;
    if (env && (env as any).KV_QUOTES) {
      kv = (env as any).KV_QUOTES as KVNamespace;
    } else {
      kv = await getKV();
    }
    if (!kv) return undefined;
    const url = await kv.get(key);
    return url || undefined;
  } catch (e) {
    console.error('Failed to get webhook URL from KV:', e);
    return undefined;
  }
}

export async function sendWebhook(rule: Rule, tick: PriceTick, env?: CloudflareEnv) {
  if (!rule.webhook) return;

  // 检查防抖 (默认 5 分钟冷却)
  if (await shouldThrottle(rule.id)) {
    console.log(`Alert throttled for rule ${rule.id}`);
    return;
  }

  const url = await getWebhookUrl(rule.webhook, env);
  if (!url) {
    console.error(`Webhook URL not found for channel: ${rule.webhook}`);
    return;
  }

  // 格式化时间 (使用 Asia/Shanghai 时区)
  const time = new Date(tick.ts).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  const price = tick.price.toFixed(2);
  const instrument = getInstrumentConfig(tick.instrumentId);
  const instrumentName = instrument ? instrument.name : tick.instrumentId;

  // 使用工厂模式获取对应的适配器
  const adapter = WebhookAdapterFactory.getAdapter(rule.webhook);
  const payload = adapter.buildPayload({
    rule,
    tick,
    instrumentName,
    formattedTime: time,
    formattedPrice: price,
  });

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(`Webhook failed for rule ${rule.id}: ${res.status} ${res.statusText}`);
    } else {
      console.log(`Webhook sent for rule ${rule.id}`);
      // 更新规则的最后触发时间
      await updateRuleLastTriggered(rule.id, Date.now());
    }
  } catch (e) {
    console.error(`Webhook error for rule ${rule.id}:`, e);
  }
}
