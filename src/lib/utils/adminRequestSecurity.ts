import { ADMIN_CSRF_COOKIE } from "@/lib/utils/adminSession";

type CookieStore = {
  get: (name: string) => { value: string } | undefined;
};

export const getClientIp = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
};

export const hasValidSameOrigin = (request: Request) => {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const origin = request.headers.get("origin");

  if (!host || !origin) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};

export const hasValidCsrfToken = (request: Request, cookieStore: CookieStore) => {
  const csrfFromHeader = request.headers.get("x-csrf-token");
  const csrfFromCookie = cookieStore.get(ADMIN_CSRF_COOKIE)?.value;

  if (!csrfFromHeader || !csrfFromCookie) return false;
  return csrfFromHeader === csrfFromCookie;
};
