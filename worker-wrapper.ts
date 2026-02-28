import app from './.open-next/worker.js'
import { collectAndNotify } from './src/lib/services/collector'

export default {
  async fetch(request: Request, env: CloudflareEnv, ctx: ExecutionContext) {
    // @ts-ignore
    return app.fetch(request, env, ctx)
  },
  async scheduled(controller: ScheduledEvent, env: CloudflareEnv, ctx: ExecutionContext) {
    await collectAndNotify(env, ctx)
  },
}
