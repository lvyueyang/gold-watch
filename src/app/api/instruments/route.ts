import { NextRequest, NextResponse } from 'next/server';
import { toggleInstrumentStatus } from '@/lib/kv';

// export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { id: string; active: boolean };

    if (!body.id || typeof body.active !== 'boolean') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    await toggleInstrumentStatus(body.id, body.active);

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
