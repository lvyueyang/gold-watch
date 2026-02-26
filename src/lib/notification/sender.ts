import { Rule, PriceTick } from '@/lib/types';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { WebhookAdapterFactory } from './adapters';
import { shouldThrottle } from './throttler';
import { getInstrumentConfig } from '@/lib/sources/registry';
import { updateRuleLastTriggered } from '@/lib/data/rules';

async function getWebhookUrl(id: string): Promise<string | undefined> {
  try {
    // 尝试从环境变量获取
    if (process.env.WEBHOOK_FEISHU && id === 'feishu') return process.env.WEBHOOK_FEISHU;
    if (process.env.WEBHOOK_DINGTALK && id === 'dingtalk') return process.env.WEBHOOK_DINGTALK;
    if (process.env.WEBHOOK_WECOM && id === 'wecom') return process.env.WEBHOOK_WECOM;

    // 尝试从 Cloudflare Context 获取 (Edge Runtime)
    const { env } = await getCloudflareContext();
    if (env) {
      const e = env as any;
      if (id === 'feishu') return e.WEBHOOK_FEISHU;
      if (id === 'dingtalk') return e.WEBHOOK_DINGTALK;
      if (id === 'wecom') return e.WEBHOOK_WECOM;
    }
  } catch (e) {
    console.error('Failed to get webhook config:', e);
  }
  return undefined;
}

export async function sendWebhook(rule: Rule, tick: PriceTick) {
  if (!rule.webhook) return;

  // 检查防抖 (默认 5 分钟冷却)
  if (await shouldThrottle(rule.id)) {
    console.log(`Alert throttled for rule ${rule.id}`);
    return;
  }

  const url = await getWebhookUrl(rule.webhook);
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
