import type { Rule, PriceTick } from '@/lib/types';

export interface AlertContext {
  rule: Rule;
  tick: PriceTick;
  instrumentName: string; // Add instrument name
  formattedTime: string;
  formattedPrice: string;
}

export interface WebhookAdapter {
  buildPayload(context: AlertContext): Record<string, any>;
}

export class DingTalkAdapter implements WebhookAdapter {
  buildPayload(context: AlertContext): Record<string, any> {
    const { rule, instrumentName, formattedPrice, formattedTime } = context;
    return {
      msgtype: 'markdown',
      markdown: {
        title: `金价告警: ${rule.name}`,
        text: `### 🔔 ${rule.name} 触发\n\n- **标的**: ${instrumentName}\n- **价格**: **${formattedPrice}**\n- **时间**: ${formattedTime}`,
      },
    };
  }
}

export class WeComAdapter implements WebhookAdapter {
  buildPayload(context: AlertContext): Record<string, any> {
    const { rule, instrumentName, formattedPrice, formattedTime } = context;
    return {
      msgtype: 'markdown',
      markdown: {
        content: `### 🔔 ${rule.name} 触发\n> **标的**: ${instrumentName}\n> **价格**: <font color="warning">${formattedPrice}</font>\n> **时间**: ${formattedTime}`,
      },
    };
  }
}

export class FeishuAdapter implements WebhookAdapter {
  buildPayload(context: AlertContext): Record<string, any> {
    const { rule, instrumentName, formattedPrice, formattedTime } = context;
    return {
      msg_type: 'text',
      content: {
        text: `🔔 ${rule.name} 触发\n\n标的: ${instrumentName}\n价格: ${formattedPrice}\n时间: ${formattedTime}`,
      },
    };
  }
}

export class WebhookAdapterFactory {
  static getAdapter(type: string): WebhookAdapter {
    switch (type) {
      case 'dingtalk':
        return new DingTalkAdapter();
      case 'wecom':
        return new WeComAdapter();
      case 'feishu':
      default:
        return new FeishuAdapter();
    }
  }
}
