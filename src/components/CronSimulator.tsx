import { useEffect } from 'react'
import { collectDataFn } from '@/server/collect'

export function CronSimulator() {
  useEffect(() => {
    // 仅在开发环境且非服务端渲染时运行
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      console.log('Starting Cron Simulator (every 60s)...')
      
      const runCollect = async () => {
        console.log('[Cron Simulator] Triggering collect...')
        try {
          const res = await collectDataFn()
          console.log('[Cron Simulator] Result:', res)
        } catch (e) {
          console.error('[Cron Simulator] Error:', e)
        }
      }

      // 立即执行一次
      runCollect()

      const interval = setInterval(runCollect, 60 * 1000)
      
      return () => {
        console.log('Stopping Cron Simulator')
        clearInterval(interval)
      }
    }
  }, [])

  return null
}
