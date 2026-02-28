import { collectAndNotify } from '../../../src/lib/services/collector';

export default {
  async scheduled(controller: ScheduledEvent, env: CloudflareEnv, ctx: ExecutionContext) {
    try {
      const result = await collectAndNotify(env, ctx);
      if (!result.tick) return;
    } catch (e) {
      console.error('Cron collect error:', e);
    }
  },
};
