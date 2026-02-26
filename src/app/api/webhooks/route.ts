import { NextRequest, NextResponse } from "next/server";
import { getWebhooks } from "@/lib/data/webhooks";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const webhooks = await getWebhooks();
  return NextResponse.json({ webhooks });
}
