import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Rule } from '@/lib/types';

// export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const db = env.DB as D1Database;

    if (!db) {
      console.error('D1 Database binding (DB) not found');
      return NextResponse.json({ rules: [] });
    }

    const { results } = await db.prepare('SELECT * FROM rules ORDER BY createdAt DESC').all<any>();

    const rules = results.map((r) => {
      try {
        return {
          ...r,
          params: JSON.parse(r.params),
        };
      } catch (e) {
        console.warn(`Failed to parse params for rule ${r.id}:`, e);
        return {
          ...r,
          params: {}, // Fallback
        };
      }
    });

    return NextResponse.json(rules);
  } catch (e) {
    console.error('GET /api/rules error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const db = env.DB as D1Database;

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const body = (await req.json()) as Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>;

    const id = crypto.randomUUID();
    const now = Date.now();

    await db
      .prepare(
        `INSERT INTO rules (id, name, instrumentId, type, params, webhook, status, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        body.name,
        body.instrumentId,
        body.type,
        JSON.stringify(body.params),
        body.webhook,
        body.status,
        now,
        now,
      )
      .run();

    return NextResponse.json({ success: true, id });
  } catch (e) {
    console.error('POST /api/rules error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const db = env.DB as D1Database;

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const body = (await req.json()) as Rule;

    await db
      .prepare(
        `UPDATE rules 
      SET name = ?, instrumentId = ?, type = ?, params = ?, webhook = ?, updatedAt = ?
      WHERE id = ?`,
      )
      .bind(body.name, body.instrumentId, body.type, JSON.stringify(body.params), body.webhook, Date.now(), body.id)
      .run();

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('PUT /api/rules error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const db = env.DB as D1Database;

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const body = (await req.json()) as { id: string; status: 'active' | 'inactive' };

    await db
      .prepare(`UPDATE rules SET status = ?, updatedAt = ? WHERE id = ?`)
      .bind(body.status, Date.now(), body.id)
      .run();

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('PATCH /api/rules error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const db = env.DB as D1Database;

    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    await db.prepare(`DELETE FROM rules WHERE id = ?`).bind(id).run();

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/rules error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
