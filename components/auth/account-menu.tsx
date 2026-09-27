"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import { CircleUserRound, Gamepad2, LogIn, LogOut, UserPlus, UsersRound } from "lucide-react";
import { ROLES } from "@/data/auth";
import { signOut, useAuth } from "@/lib/auth/client";
import { formatPhone, initialsOf } from "@/lib/auth/validate";
import { cn } from "@/lib/utils";

const itemClass =
  "flex min-h-10 cursor-pointer items-center gap-space-sm rounded-lg px-space-sm font-sans text-body-sm font-medium text-text-primary outline-none select-none data-highlighted:bg-mint-subtle data-highlighted:text-bd-green";

/** Where "sign in" should bring the visitor back to. */
function loginHref(pathname: string) {
  return pathname === "/" || pathname === "/login" || pathname === "/signup" ? "/login" : `/login?next=${encodeURIComponent(pathname)}`;
}

export function AccountAvatar({ name, className }: { name: string; className?: string }) {
  return (
    <span aria-hidden className={cn("flex items-center justify-center rounded-full bg-bd-green font-bengali font-bold text-white", className)}>
      {initialsOf(name)}
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
          "relative flex size-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100/90 text-slate-600 shadow-2xs transition-colors duration-200 hover:border-emerald-600 hover:bg-emerald-50/70 hover:text-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none",
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
        <AccountAvatar name={account.name} className={cn(size, "text-base ring-2 ring-white")} />
        <span className="absolute right-0 bottom-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white" aria-hidden />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-60 w-72 rounded-2xl border border-card-border bg-white p-space-xs shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none"
        >
          <div className="flex items-center gap-space-sm px-space-sm py-space-sm">
            <AccountAvatar name={account.name} className="size-11 shrink-0 text-lg" />
            <div className="min-w-0 font-sans">
              <p className="truncate text-body-md font-bold text-text-primary">{account.name}</p>
              <p className="truncate text-body-sm text-text-muted">
                {role?.bn} · {formatPhone(account.phone)}
              </p>
            </div>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-card-border" />
          <DropdownMenu.Item asChild className={itemClass}>
            <Link href="/account">
              <CircleUserRound className="size-4 text-bd-green" aria-hidden /> আমার অ্যাকাউন্ট
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={itemClass}>
            <Link href="/media/me">
              <UsersRound className="size-4 text-bd-green" aria-hidden /> শিক্ষিতদের মিডিয়া প্রোফাইল
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className={itemClass}>
            <Link href="/cholo-bangladesh-gori/profile">
              <Gamepad2 className="size-4 text-bd-green" aria-hidden /> চলো বাংলাদেশ গড়ি — অগ্রগতি
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-card-border" />
          <DropdownMenu.Item
            className={cn(itemClass, "text-national-crimson data-highlighted:bg-red-50 data-highlighted:text-national-crimson")}
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
export function AccountSheetLinks({ wrap = (n) => n }: { wrap?: (node: React.ReactElement) => React.ReactNode }) {
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
          <Link href="/signup" className={cn(base, "border border-bd-green/30 text-bd-green hover:bg-mint-subtle")}>
            <UserPlus className="size-4" aria-hidden /> অ্যাকাউন্ট খুলুন
          </Link>,
        )}
      </div>
    );
  }

  return (
    <div className="mt-space-sm grid gap-space-xs">
      {wrap(
        <Link href="/account" className={cn(base, "justify-start bg-bdgreen-900 text-white hover:bg-bdgreen-800")}>
          <AccountAvatar name={account.name} className="size-7 bg-white/15 text-sm" />
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
          className={cn(base, "border border-red-200 text-national-crimson hover:bg-red-50")}
        >
          <LogOut className="size-4" aria-hidden /> সাইন আউট
        </button>,
      )}
    </div>
  );
}
