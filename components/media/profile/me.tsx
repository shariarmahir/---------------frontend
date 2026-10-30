"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/client";
import { personFromProfile } from "@/lib/media/my-person";
import { useHydrated, useMediaState } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { ProfileView } from "./profile-view";

/**
 * "আমি" — the signed-in account's own profile. Accounts linked to a demo
 * member open that member's page; a new account gets the same profile built
 * from what it wrote in onboarding, or is sent there to build one.
 */
export function MyProfile({ handles }: { handles: string[] }) {
  const router = useRouter();
  const { account } = useAuth();
  const hydrated = useHydrated();
  const profile = useMediaState((s) => s.profile);
  const linked = account?.mediaHandle && handles.includes(account.mediaHandle) ? account.mediaHandle : null;

  useEffect(() => {
    if (linked) router.replace(`/media/u/${linked}`);
  }, [linked, router]);

  if (!account || linked || !hydrated) return <Skeleton className="h-72 rounded-2xl" />;

  if (!profile) {
    return (
      <EmptyState
        icon="profile"
        title="আপনার দক্ষতা-প্রোফাইল এখনো খোলা হয়নি"
        body="পরিচয় যাচাই, দক্ষতার বিভাগ আর এক লাইনের পরিচয় — তিন ধাপে প্রোফাইল তৈরি হবে। তারপর পোস্ট, CV আর কাজ।"
        action={
          <Link href="/media/onboarding" className={mediaButton({ variant: "primary" })}>
            প্রোফাইল খুলুন
          </Link>
        }
      />
    );
  }

  return <ProfileView person={personFromProfile(profile)} self />;
}
