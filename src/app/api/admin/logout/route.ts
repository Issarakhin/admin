import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_CSRF_COOKIE, ADMIN_SESSION_COOKIE } from "@/lib/utils/adminSession";
import {
  hasValidCsrfToken,
  hasValidSameOrigin,
} from "@/lib/utils/adminRequestSecurity";

export async function POST(request: Request) {
  if (!hasValidSameOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Invalid request origin" },
      { status: 403 }
    );
  }

  const cookieStore = await cookies();

  if (!hasValidCsrfToken(request, cookieStore)) {
    return NextResponse.json(
      { success: false, message: "CSRF validation failed" },
      { status: 403 }
    );
  }

  cookieStore.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  cookieStore.set(ADMIN_CSRF_COOKIE, "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
