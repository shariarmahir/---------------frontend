import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { MessageCircle, Search, UsersRound, Wallet } from "lucide-react";
import { LabelText } from "@/components/brand/kandari-wordmark";
import { LABEL_TEXT } from "@/data/logo-text";
import { SignalSeam } from "@/components/ui/section-kit";
import { AccountMenu } from "@/components/auth/account-menu";
import { CURRENT_USER_HANDLE } from "@/data/media/users";
import { NotificationBell } from "../notifications/notifications";
import { mediaButton } from "../ui/button-styles";
import { MobileMenu, NumeralsToggle } from "./nav";
import { SearchBox, UnreadBubble } from "./search-box";
import type { UnreadSeed } from "./unread";

export function TopBar({ unreadSeed }: { unreadSeed: UnreadSeed }) {
  return (
    <header className="sticky top-0 z-40 bg-signal-orange text-text-primary print:hidden">
      <div className="mx-auto flex h-16 max-w-350 items-center gap-2 px-3 sm:gap-3 lg:px-6">
        <MobileMenu unreadSeed={unreadSeed} me={CURRENT_USER_HANDLE} />
        <Link href="/media" className="flex min-w-0 items-center gap-2 rounded-lg sm:shrink-0 focus-visible:outline-2 focus-visible:outline-text-primary">
          <Image src="/logo/kandari-logo.png" alt="" width={1600} height={967} sizes="64px" className="hidden h-9 w-auto sm:block" priority />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate text-[16px] text-text-primary sm:text-[21px]">
              <LabelText text={LABEL_TEXT.media} />
            </span>
            <span className="mt-1 hidden text-[11px] font-bold text-text-primary/75 sm:block">দক্ষতা · প্রমাণ · সুযোগ</span>
          </span>
        </Link>

        <Suspense fallback={<div className="mx-auto hidden h-10 w-full max-w-md rounded-full bg-text-primary md:block" />}>
          <SearchBox />
        </Suspense>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5 md:ml-0 max-sm:[&>a]:size-9">
          <NumeralsToggle className="hidden sm:inline-flex" />
          <Link href="/media/search" className={mediaButton({ variant: "tile", size: "icon", className: "hidden sm:inline-flex md:hidden" })}>
            <Search aria-hidden />
            <span className="sr-only">খুঁজুন</span>
          </Link>
          <Link href="/media/people" title="মানুষ খুঁজুন ও অনুসরণ করুন" className={mediaButton({ variant: "tile", size: "icon" })}>
            <UsersRound aria-hidden />
            <span className="sr-only">মানুষ</span>
          </Link>
          <NotificationBell />
          <Link href="/media/messages" className={mediaButton({ variant: "tile", size: "icon", className: "relative" })}>
            <MessageCircle aria-hidden />
            <span className="sr-only">বার্তা</span>
            <UnreadBubble seed={unreadSeed} />
          </Link>
          <Link href="/media/wallet" className={mediaButton({ variant: "tile", size: "icon", className: "hidden sm:inline-flex" })}>
            <Wallet aria-hidden />
            <span className="sr-only">ওয়ালেট</span>
          </Link>
          <AccountMenu variant="media" className="ml-1" />
        </div>
      </div>
      <SignalSeam className="bottom-0 bg-text-primary/25" />
    </header>
  );
}
