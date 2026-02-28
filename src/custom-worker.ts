// @ts-ignore `.open-next/worker.ts` is generated at build time
import { default as handler } from '../.open-next/worker.js';
import { collectAndNotify } from './lib/services/collector.js';

export default {
  fetch: handler.fetch,

  async scheduled(controller: any, env: CloudflareEnv, ctx: ExecutionContext) {
    try {
      const result = await collectAndNotify(env, ctx);
      if (!result.tick) return;
    } catch (e) {
      console.error('Cron collect error:', e);
    }
  },
} satisfies ExportedHandler<CloudflareEnv>;

// The re-export is only required if your app uses the DO Queue and DO Tag Cache
// See https://opennext.js.org/cloudflare/caching for details
// @ts-ignore `.open-next/worker.ts` is generated at build time
export { DOQueueHandler, DOShardedTagCache } from './.open-next/worker.js';
