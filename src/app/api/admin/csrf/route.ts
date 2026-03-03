import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_CSRF_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createCsrfToken,
} from "@/lib/utils/adminSession";

export async function GET() {
  const csrfToken = createCsrfToken();
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ csrfToken });
}
