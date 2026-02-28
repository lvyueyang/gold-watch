import { createServerFn } from '@tanstack/react-start';
import { getWebhooks } from '../lib/data/webhooks';

export const getWebhooksFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    return await getWebhooks();
  });
