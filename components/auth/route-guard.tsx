"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isProtected } from "@/data/auth";
import { justSignedOutHere, signOut, useAuth } from "@/lib/auth/client";

/**
 * Renders protected pages only for a signed-in account. proxy.ts already
 * redirects on the server using the marker cookie; this is the check
 * against the real (browser-held) session. If the cookie was stale it is
 * cleared before redirecting, so proxy and guard cannot bounce each other.
 */
export function RouteGuard({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, account } = useAuth();
  const guarded = isProtected(pathname);
  const blocked = guarded && (!ready || !account);

  useEffect(() => {
    if (!guarded || !ready || account || justSignedOutHere()) return;
    signOut(); // clears a stale marker cookie
    router.replace(`/login?next=${encodeURIComponent(pathname + window.location.search)}`);
  }, [guarded, ready, account, pathname, router]);

  if (blocked) return fallback ?? <GuardFallback />;
  return children;
}

function GuardFallback() {
  return (
    <div role="status" className="flex min-h-[50dvh] flex-col items-center justify-center gap-space-md">
      <span className="size-9 animate-spin rounded-full border-4 border-bd-green/20 border-t-bd-green motion-reduce:animate-none" aria-hidden />
      <span className="font-sans text-body-sm text-text-muted">অ্যাকাউন্ট যাচাই হচ্ছে…</span>
    </div>
  );
}
