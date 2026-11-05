"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/client";

/**
 * Guard for actions that need an account (like, comment, hire, buy, join).
 * Browsing stays open to everyone; acting asks a signed-out visitor to sign
 * in and brings them back to the same page afterwards.
 *
 *   const ensure = useRequireAccount();
 *   onClick={() => ensure("লাইক দিতে") && toggleKey("liked", id)}
 */
export function useRequireAccount(): (doing?: string) => boolean {
  const { account } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  return useCallback(
    (doing?: string) => {
      if (account) return true;
      const next = pathname + window.location.search;
      toast("সাইন ইন করুন", {
        id: "require-account",
        description: `${doing ? `${doing} ` : "এটি করতে "}একটি কাণ্ডারী অ্যাকাউন্ট লাগবে — বিনামূল্যে, দুই মিনিটে।`,
        action: { label: "সাইন ইন", onClick: () => router.push(`/login?next=${encodeURIComponent(next)}`) },
      });
      return false;
    },
    [account, router, pathname],
  );
}
