"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import { CircleUserRound, Gamepad2, LogIn, LogOut, PencilLine, UserPlus, UsersRound } from "lucide-react";
import { ROLES } from "@/data/auth";
import { signOut, useAuth } from "@/lib/auth/client";
import { formatPhone, initialsOf } from "@/lib/auth/validate";
import { cn } from "@/lib/utils";

/** Items on the gold menu: ink text, an ink field under the pointer. */
const itemClass =
  "flex min-h-11 cursor-pointer items-center gap-space-sm rounded-xl px-space-sm font-sans text-body-sm font-semibold text-text-primary outline-none select-none transition-[background-color,color,scale] duration-150 active:scale-[0.98] data-highlighted:bg-text-primary data-highlighted:text-signal-orange";

/** Where "sign in" should bring the visitor back to. */
function loginHref(pathname: string) {
  return pathname === "/" || pathname === "/login" || pathname === "/signup" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`;
}

/**
 * The account's round face: the uploaded picture (or a demo account's seeded
 * portrait) when there is one, otherwise the placeholder — the name's first
 * letter on bottle green.
 */
export function AccountAvatar({
  name,
  photo,
  className,
  sizes = "80px",
}: {
  name: string;
  photo?: string | null;
  className?: string;
  sizes?: string;
}) {
  return (
    <span aria-hidden className={cn("relative flex items-center justify-center overflow-hidden rounded-full bg-bd-green font-bengali font-bold text-white", className)}>
      {photo ? (
        <Image src={photo} alt="" fill sizes={sizes} unoptimized={photo.startsWith("data:")} className="object-cover object-top" />
      ) : (
        initialsOf(name)
      )}
    </span>
  );
}

/**
 * The account control in a header: a sign-in link when signed out, an
 * avatar with a menu when signed in. Before the browser session has been
 * read it renders the signed-out look at the same size, so nothing shifts.
 */
export function AccountMenu({ variant = "site", className }: { variant?: "site" | "media"; className?: string }) {
  const { ready, account } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const size = variant === "site" ? "size-10" : "size-9";

  if (!ready || !account) {
    return variant === "site" ? (
      <Link
        href={loginHref(pathname)}
        aria-label="সাইন ইন — Kandari Profile"
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-full bg-text-primary text-signal-orange shadow-ink [-webkit-tap-highlight-color:transparent] transition-[background-color,scale] duration-200 hover:scale-105 hover:bg-bd-green-dark focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-90",
          className,
        )}
      >
        <CircleUserRound className="size-5" strokeWidth={1.8} aria-hidden />
      </Link>
    ) : (
      <Link
        href={loginHref(pathname)}
        className={cn("inline-flex h-9 items-center gap-1.5 rounded-xl bg-bd-green px-3 text-sm font-semibold text-white transition-colors hover:bg-bd-green-dark focus-visible:ring-3 focus-visible:ring-bd-green/35 focus-visible:outline-none", className)}
      >
        <LogIn className="size-4" aria-hidden />
        সাইন ইন
      </Link>
    );
  }

  const role = ROLES.find((r) => r.id === account.role);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn("relative shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-bd-green focus-visible:ring-offset-2 focus-visible:outline-none", className)}
        aria-label={`অ্যাকাউন্ট মেনু — ${account.name}`}
      >
        <AccountAvatar
          name={account.name}
          photo={account.photo}
          sizes="48px"
          className={cn(size, "text-base transition-[scale] duration-200 hover:scale-105 active:scale-95", variant === "site" ? "ring-2 ring-text-primary" : "ring-2 ring-white")}
        />
        <span className={cn("absolute right-0 bottom-0 size-2.5 rounded-full bg-emerald-500 ring-2", variant === "site" ? "ring-signal-orange" : "ring-white")} aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="menu-pop z-60 w-[min(19rem,calc(100vw-1rem))] rounded-3xl bg-signal-orange p-2 text-text-primary shadow-[0_28px_60px_-18px_rgb(0_0_0/0.7)] ring-1 ring-text-primary/15"
        >
          {/* Who is signed in — an ink card with the picture. */}
          <div className="flex items-center gap-space-sm rounded-2xl bg-text-primary p-space-sm text-white">
            <AccountAvatar name={account.name} photo={account.photo} sizes="56px" className="size-12 shrink-0 text-lg ring-2 ring-signal-orange" />
            <div className="min-w-0 font-sans">
              <p className="truncate font-bengali text-body-md font-bold">{account.name}</p>
              <p className="truncate text-xs text-white/75">
                {role?.bn} · {formatPhone(account.phone)}
              </p>
            </div>
          </div>
          <DropdownMenu.Item asChild className={cn(itemClass, "mt-2 justify-center bg-text-primary text-signal-orange data-highlighted:bg-bd-green data-highlighted:text-white")}>
            <Link href="/account?edit=1">
              <PencilLine className="size-4" aria-hidden /> প্রোফাইল সম্পাদনা
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1.5 h-px bg-text-primary/15" />
          <DropdownMenu.Item asChild className={itemClass}>
            <Link href="/account">
              <CircleUserRound className="size-4" aria-hidden /> আমার অ্যাকাউন্ট
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={itemClass}>
            <Link href="/media/me">
              <UsersRound className="size-4" aria-hidden /> শিক্ষিতদের মিডিয়া প্রোফাইল
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={itemClass}>
            <Link href="/cholo-bangladesh-gori/profile">
              <Gamepad2 className="size-4" aria-hidden /> চলো বাংলাদেশ গড়ি — অগ্রগতি
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1.5 h-px bg-text-primary/15" />
          <DropdownMenu.Item
            className={cn(itemClass, "data-highlighted:bg-national-crimson data-highlighted:text-white")}
            onSelect={() => {
              signOut();
              router.push("/");
            }}
          >
            <LogOut className="size-4" aria-hidden /> সাইন আউট
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

/** Account links for a mobile menu sheet. `wrap` lets the sheet close on tap. */
export function AccountSheetLinks({ wrap = (n) => n, onGold = false }: { wrap?: (node: React.ReactElement) => React.ReactNode; onGold?: boolean }) {
  const { ready, account } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const base = "flex min-h-11 items-center justify-center gap-space-xs rounded-lg px-space-md font-sans text-sm font-bold transition-colors";

  if (!ready || !account) {
    return (
      <div className="mt-space-sm grid grid-cols-2 gap-space-xs">
        {wrap(
          <Link href={loginHref(pathname)} className={cn(base, "bg-bdgreen-900 text-white hover:bg-bdgreen-800")}>
            <LogIn className="size-4" aria-hidden /> সাইন ইন
          </Link>,
        )}
        {wrap(
          <Link href="/signup" className={cn(base, onGold ? "text-text-primary ring-1 ring-text-primary/45 hover:bg-text-primary/10" : "border border-bd-green/30 text-bd-green hover:bg-mint-subtle")}>
            <UserPlus className="size-4" aria-hidden /> অ্যাকাউন্ট খুলুন
          </Link>,
        )}
      </div>
    );
  }

  return (
    <div className="mt-space-sm grid gap-space-xs">
      {wrap(
        <Link href="/account" className={cn(base, "justify-start bg-text-primary text-white hover:bg-bdgreen-900")}>
          <AccountAvatar name={account.name} photo={account.photo} sizes="32px" className="size-7 text-sm ring-1 ring-white/40" />
          <span className="truncate">{account.name}</span>
          <span className="ml-auto text-xs font-semibold text-white/80">অ্যাকাউন্ট →</span>
        </Link>,
      )}
      {wrap(
        <button
          type="button"
          onClick={() => {
            signOut();
            router.push("/");
          }}
          className={cn(base, onGold ? "text-text-primary ring-1 ring-text-primary/45 hover:bg-text-primary/10" : "border border-red-200 text-national-crimson hover:bg-red-50")}
        >
          <LogOut className="size-4" aria-hidden /> সাইন আউট
        </button>,
      )}
    </div>
  );
}
