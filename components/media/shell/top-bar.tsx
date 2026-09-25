import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { MessageCircle, Search, Wallet } from "lucide-react";
import { LabelText } from "@/components/brand/kandari-wordmark";
import { LABEL_TEXT } from "@/data/logo-text";
import { CURRENT_USER_HANDLE, currentUser } from "@/data/media/users";
import { mediaButton } from "../ui/button-styles";
import { PersonAvatar } from "../ui/person";
import { MobileMenu, NumeralsToggle } from "./nav";
import { SearchBox, UnreadBubble } from "./search-box";
import type { UnreadSeed } from "./unread";

export function TopBar({ unreadSeed }: { unreadSeed: UnreadSeed }) {
  return (
    <header className="sticky top-0 z-40 border-b border-card-border bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/85">
      <div className="mx-auto flex h-16 max-w-350 items-center gap-2 px-3 sm:gap-3 lg:px-6">
        <MobileMenu unreadSeed={unreadSeed} me={CURRENT_USER_HANDLE} />
        <Link href="/media" className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-bd-green">
          <Image src="/logo/logo.png" alt="" width={1432} height={2000} className="h-8 w-auto sm:h-9" priority />
          <span className="flex flex-col leading-none">
            <span className="text-[18px] text-bd-green sm:text-[21px]">
              <LabelText text={LABEL_TEXT.media} />
            </span>
            <span className="mt-1 hidden text-[11px] font-semibold text-text-muted sm:block">দক্ষতা · প্রমাণ · সুযোগ</span>
          </span>
        </Link>

        <Suspense fallback={<div className="mx-auto hidden h-10 w-full max-w-md rounded-full border border-card-border bg-slate-50 md:block" />}>
          <SearchBox />
        </Suspense>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <NumeralsToggle className="hidden sm:inline-flex" />
          <Link href="/media/search" className={mediaButton({ variant: "ghost", size: "icon", className: "md:hidden" })}>
            <Search aria-hidden />
            <span className="sr-only">খুঁজুন</span>
          </Link>
          <Link href="/media/messages" className={mediaButton({ variant: "ghost", size: "icon", className: "relative" })}>
            <MessageCircle aria-hidden />
            <span className="sr-only">বার্তা</span>
            <UnreadBubble seed={unreadSeed} />
          </Link>
          <Link href="/media/wallet" className={mediaButton({ variant: "ghost", size: "icon", className: "hidden sm:inline-flex" })}>
            <Wallet aria-hidden />
            <span className="sr-only">ওয়ালেট</span>
          </Link>
          <Link href="/media/me" className="ml-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bd-green">
            <PersonAvatar person={currentUser} size="sm" />
            <span className="sr-only">আমার প্রোফাইল</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
