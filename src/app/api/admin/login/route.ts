import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_SESSION_COOKIE = "admin_session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password.trim() : "";
    const expectedPassword = process.env.ADMIN_PASSWORD?.trim();

    if (!expectedPassword) {
      return NextResponse.json(
        { success: false, message: "Missing ADMIN_PASSWORD in server environment" },
        { status: 500 }
      );
    }

    if (!password || password !== expectedPassword) {
      return NextResponse.json(
        { success: false, message: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_SESSION_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request payload" },
      { status: 400 }
    );
  }
}
