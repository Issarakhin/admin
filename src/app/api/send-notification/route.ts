import { NextRequest, NextResponse } from 'next/server';
import { getMessaging } from '@/lib/utils/firebaseAdmin';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/utils/adminSession';
import { hasValidCsrfToken, hasValidSameOrigin } from '@/lib/utils/adminRequestSecurity';

const MAX_REQUESTS_PER_MINUTE = 30;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const requestBuckets = new Map<string, RateLimitEntry>();

const getClientIp = (request: NextRequest) => {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
};

const isRateLimited = (key: string) => {
  const now = Date.now();
  const current = requestBuckets.get(key);
  if (!current || now >= current.resetAt) {
    requestBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  if (current.count >= MAX_REQUESTS_PER_MINUTE) {
    return true;
  }

  current.count += 1;
  requestBuckets.set(key, current);
  return false;
};

const isValidDataPayload = (data: unknown) => {
  if (data === undefined) return true;
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return false;

  return Object.entries(data).every(
    ([key, value]) =>
      typeof key === 'string' &&
      typeof value === 'string' &&
      key.length <= 100 &&
      value.length <= 1000
  );
};

export async function POST(req: NextRequest) {
  if (!hasValidSameOrigin(req)) {
    return NextResponse.json(
      { success: false, error: 'Invalid request origin' },
      { status: 403 }
    );
  }

  if (!hasValidCsrfToken(req, req.cookies)) {
    return NextResponse.json(
      { success: false, error: 'CSRF validation failed' },
      { status: 403 }
    );
  }

  const sessionToken = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!sessionToken || !sessionSecret) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const isValidSession = await verifyAdminSessionToken(sessionToken, sessionSecret);
  if (!isValidSession) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { message } = await req.json();
    const token = typeof message?.to === 'string' ? message.to.trim() : '';
    const title = typeof message?.title === 'string' ? message.title.trim() : '';
    const body = typeof message?.body === 'string' ? message.body.trim() : '';

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Missing FCM token' },
        { status: 400 }
      );
    }
    if (!title || !body) {
      return NextResponse.json(
        { success: false, error: 'Missing notification title or body' },
        { status: 400 }
      );
    }
    if (token.length < 100 || token.length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Invalid FCM token format' },
        { status: 400 }
      );
    }
    if (!isValidDataPayload(message?.data)) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification data payload' },
        { status: 400 }
      );
    }

    const messaging = getMessaging();

    await messaging.send({
      token,
      notification: { title, body },
      android: { priority: 'high' }, // heads-up
      apns: {
        headers: { 'apns-priority': '10' },
        payload: {
          aps: {
            sound: message.ios?.sound ? 'default' : undefined,
            badge: message.ios?.badge,
          },
        },
      },
      data: message.data,
    });

    return NextResponse.json({ success: true });
  } catch {

    const errorMessage = 'FCM send failed';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
