import { NextResponse, type NextRequest } from "next/server";
import { GUEST_ONLY, SESSION_COOKIE, isProtected } from "@/data/auth";
import { safeNext } from "@/lib/auth/validate";

/**
 * Optimistic sign-in check (Next's recommended use of proxy): the session
 * lives in the browser, so this only reads the marker cookie that
 * lib/auth/client.ts keeps in step with it. Protected pages redirect to
 * /login before rendering; components/auth/route-guard.tsx re-checks in the
 * browser and clears a stale cookie, so the two cannot loop.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // public/media/*.webp shares the /media prefix; the image optimizer fetches
  // those without cookies, so files are never gated (pages have no extension).
  if (/\.[a-z0-9]+$/i.test(pathname)) return NextResponse.next();
  const signedIn = request.cookies.get(SESSION_COOKIE)?.value === "1";

  if (!signedIn && isProtected(pathname)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (signedIn && (GUEST_ONLY as readonly string[]).includes(pathname) && !request.nextUrl.searchParams.has("token")) {
    return NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get("next")), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/signup", "/account/:path*", "/media/:path*"],
};
