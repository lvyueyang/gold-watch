import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getKV } from '../kv';

export interface WebhookStatus {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  url: string;
  envKey: string;
}

// 辅助函数：对敏感 URL 进行脱敏处理
function maskUrl(url: string | undefined): string {
  if (!url) return '未配置';
  try {
    if (!url.startsWith('http')) return '配置无效';
    const len = url.length;
    if (len < 10) return '******';
    return url.substring(0, 8) + '******' + url.substring(len - 4);
  } catch {
    return '配置无效';
  }
}

export async function getWebhooks(): Promise<WebhookStatus[]> {
  // 在 Cloudflare Workers 中，环境变量位于 process.env 或 context.env
  // 为了安全起见，我们只暴露特定的已知 Key
  const config = {
    feishu: process.env.WEBHOOK_FEISHU,
    dingtalk: process.env.WEBHOOK_DINGTALK,
    wecom: process.env.WEBHOOK_WECOM,
  };

  // 如果在 Worker 中运行，且 process.env 为空，则尝试从 context 获取
  // 注意：OpenNext 通常会填充 process.env，但为了保险起见，这里做了兼容
  try {
    const { env } = await getCloudflareContext();
    if (env) {
      const e = env as any;
      if (!config.feishu) config.feishu = e.WEBHOOK_FEISHU;
      if (!config.dingtalk) config.dingtalk = e.WEBHOOK_DINGTALK;
      if (!config.wecom) config.wecom = e.WEBHOOK_WECOM;
    }
  } catch (e) {
    // 忽略上下文错误（本地开发或构建时）
  }

  // 生产环境优先从 KV 获取配置
  if (process.env.NODE_ENV === 'production') {
    try {
      const kv = await getKV();
      if (kv) {
        const kFeishu = await kv.get('WEBHOOK_FEISHU');
        const kDingtalk = await kv.get('WEBHOOK_DINGTALK');
        const kWecom = await kv.get('WEBHOOK_WECOM');

        if (kFeishu) config.feishu = kFeishu;
        if (kDingtalk) config.dingtalk = kDingtalk;
        if (kWecom) config.wecom = kWecom;
      }
    } catch (e) {
      console.error('Failed to fetch webhooks from KV:', e);
    }
  }

  return [
    {
      id: 'feishu',
      name: '飞书 (Feishu)',
      status: config.feishu ? 'active' : 'inactive',
      url: maskUrl(config.feishu),
      envKey: 'WEBHOOK_FEISHU',
    },
    {
      id: 'dingtalk',
      name: '钉钉 (DingTalk)',
      status: config.dingtalk ? 'active' : 'inactive',
      url: maskUrl(config.dingtalk),
      envKey: 'WEBHOOK_DINGTALK',
    },
    {
      id: 'wecom',
      name: '企业微信 (WeCom)',
      status: config.wecom ? 'active' : 'inactive',
      url: maskUrl(config.wecom),
      envKey: 'WEBHOOK_WECOM',
    },
  ];
}
