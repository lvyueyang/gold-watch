import { NextRequest, NextResponse } from "next/server";
import { getFetchInterval, setFetchInterval } from "@/lib/kv";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const interval = await getFetchInterval();
  return NextResponse.json({ interval });
}

export async function POST(req: NextRequest) {
  try {
    const { interval } = await req.json() as { interval: number };
    if (typeof interval !== "number" || interval < 5) {
      return NextResponse.json({ error: "Invalid interval (min 5s)" }, { status: 400 });
    }
    
    await setFetchInterval(interval);
    return NextResponse.json({ success: true, interval });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
