import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminPassword } from "@/lib/utils/adminPassword";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
} from "@/lib/utils/adminSession";
import {
  getClientIp,
  hasValidCsrfToken,
  hasValidSameOrigin,
} from "@/lib/utils/adminRequestSecurity";

const MAX_LOGIN_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

type AttemptState = {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
};

const loginAttempts = new Map<string, AttemptState>();

const getRetryAfterSeconds = (ip: string) => {
  const now = Date.now();
  const state = loginAttempts.get(ip);
  if (!state?.blockedUntil || state.blockedUntil <= now) return 0;
  return Math.ceil((state.blockedUntil - now) / 1000);
};

const registerFailure = (ip: string) => {
  const now = Date.now();
  const state = loginAttempts.get(ip);

  if (!state || now - state.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttemptAt: now });
    return;
  }

  state.count += 1;
  if (state.count >= MAX_LOGIN_ATTEMPTS) {
    state.blockedUntil = now + BLOCK_DURATION_MS;
  }
  loginAttempts.set(ip, state);
};

const clearFailures = (ip: string) => {
  loginAttempts.delete(ip);
};

export async function POST(request: Request) {
  const ip = getClientIp(request);

  const retryAfter = getRetryAfterSeconds(ip);
  if (retryAfter > 0) {
    return NextResponse.json(
      { success: false, message: "Too many failed attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": retryAfter.toString() } }
    );
  }

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

  try {
    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password.trim() : "";
    const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim();
    const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();

    if (!passwordHash) {
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

    if (!password || !verifyAdminPassword(password, passwordHash)) {
      registerFailure(ip);
      return NextResponse.json(
        { success: false, message: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    clearFailures(ip);
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
