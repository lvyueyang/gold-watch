import { NextRequest, NextResponse } from "next/server";
import { signSession, verifyCredentials, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!verifyCredentials(username, password)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signSession({ username });
    
    const response = NextResponse.json({ success: true });
    
    // Set HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
