import { NextRequest, NextResponse } from 'next/server';
// 移除系统健康状态相关逻辑
import { collectAndNotify } from '@/lib/services/collector';

// export const runtime = 'edge';
export const maxDuration = 60; // 允许最长执行 60 秒

export async function GET(req: NextRequest) {
  let count = 0;
  let lastResult: { tick: any; matched: number } | null = null;

  try {
    lastResult = await collectAndNotify();
    if (lastResult) count = 1;
  } catch (e) {
    console.error('Collect error:', e);
  }

  return NextResponse.json({
    success: true,
    executions: count,
    lastTick: lastResult?.tick,
  });
}
