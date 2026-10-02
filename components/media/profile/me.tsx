"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SealCheck } from "@phosphor-icons/react/ssr";
import { MapPin, PenLine, Settings } from "lucide-react";
import { AccountAvatar } from "@/components/auth/account-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/client";
import { useHydrated, useMediaState } from "@/lib/media/store";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";

/**
 * "আমি" — the signed-in account's own profile. Accounts linked to a demo
 * member open that member's public page; a new account shows the profile
 * it built in onboarding, or is sent to onboarding to build one.
 */
export function MyProfile({ handles, categoryNames }: { handles: string[]; categoryNames: Record<string, string> }) {
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
        body="পরিচয় যাচাই, দক্ষতার বিভাগ আর এক লাইনের পরিচয় — তিন ধাপে প্রোফাইল তৈরি হবে। তারপর পোস্ট, রেটিং আর কাজ।"
        action={
          <Link href="/media/onboarding" className={mediaButton({ variant: "primary" })}>
            প্রোফাইল খুলুন
          </Link>
        }
      />
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-white/12 bg-text-primary">
      <div className="h-24 bg-linear-to-r from-bd-green to-emerald-700" />
      <div className="px-5 pb-6 sm:px-8">
        <AccountAvatar name={profile.displayName} className="-mt-10 size-20 border-4 border-white text-3xl" />
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
              {profile.displayName}
              <SealCheck size={24} weight="duotone" className="text-signal-orange" aria-label="পরিচয় যাচাইকৃত" />
            </h1>
            <p className="text-sm text-white/65">@{profile.handle}</p>
          </div>
          <Link href="/media/settings" className={mediaButton({ variant: "quiet", size: "sm" })}>
            <Settings aria-hidden /> সেটিংস
          </Link>
        </div>
        {profile.headline ? <p className="mt-3 font-semibold text-white">{profile.headline}</p> : null}
        <p className="mt-1 flex items-center gap-1 text-sm text-white/80">
          <MapPin className="size-4 text-signal-orange" aria-hidden /> {profile.district}
        </p>
        {profile.bio ? <p className="mt-3 max-w-prose text-[15px] leading-relaxed whitespace-pre-line text-white/80">{profile.bio}</p> : null}
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="দক্ষতার বিভাগ">
          {profile.categories.map((c) => (
            <li key={c} className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-signal-orange">
              {categoryNames[c] ?? c}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/media/post/new" className={mediaButton({ variant: "primary" })}>
            <PenLine aria-hidden /> দক্ষতার প্রমাণ পোস্ট করুন
          </Link>
          <Link href="/account" className={mediaButton({ variant: "quiet" })}>
            কাণ্ডারী অ্যাকাউন্ট
          </Link>
        </div>
      </div>
    </article>
  );
}
