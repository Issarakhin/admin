import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminPassword } from "@/lib/utils/adminPassword";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
} from "@/lib/utils/adminSession";
import {
  hasValidCsrfToken,
  hasValidSameOrigin,
} from "@/lib/utils/adminRequestSecurity";

export async function POST(request: Request) {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction && !hasValidSameOrigin(request)) {
    return NextResponse.json(
      { success: false, message: "Invalid request origin" },
      { status: 403 }
    );
  }

  const cookieStore = await cookies();
  if (isProduction && !hasValidCsrfToken(request, cookieStore)) {
    return NextResponse.json(
      { success: false, message: "CSRF validation failed" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password.trim() : "";
    const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
    const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
    const devPassword = process.env.ADMIN_DEV_PASSWORD?.trim() || "dgacademy$$$";

    if (isProduction && !passwordHash) {
      return NextResponse.json(
        { success: false, message: "Missing ADMIN_PASSWORD_HASH in server environment" },
        { status: 500 }
      );
    }

    if (!sessionSecret || sessionSecret.length < 32) {
      return NextResponse.json(
        { success: false, message: "Missing or weak ADMIN_SESSION_SECRET in server environment" },
        { status: 500 }
      );
    }

    const hashMatches = Boolean(passwordHash && verifyAdminPassword(password, passwordHash));
    const devPasswordMatches = !isProduction && password === devPassword;

    if (!password || (!hashMatches && !devPasswordMatches)) {
      return NextResponse.json(
        { success: false, message: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    const sessionToken = await createAdminSessionToken(sessionSecret);

    cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request payload" },
      { status: 400 }
    );
  }
}
