"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { Avatar } from "@/components/feed/post-header";
import { profileNav, profileUser } from "@/data/profile";
import { endSession } from "@/lib/session";
import { cn } from "@/lib/utils";

/**
 * Left rail. Collapses to an icon-only strip below xl, matching the
 * source design's 88px → 275px step.
 */
export function ProfileSidebar() {
  const router = useRouter();
  const [active, setActive] = useState("profile");

  const signOut = () => {
    endSession();
    router.replace("/login");
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-22 shrink-0 flex-col justify-between border-r border-card-border px-space-sm py-space-sm select-none md:flex xl:w-68.75 xl:px-space-md">
      <div className="flex flex-col gap-space-xs">
        {/* Brand lockup. */}
        <Link
          href="/"
          className="mb-space-xs flex w-fit items-center gap-space-sm rounded-full px-space-sm py-space-xs transition-colors hover:bg-mint-subtle"
        >
          <Image
            src="/logo/logo.png"
            alt="কাণ্ডারী-ল্যাব"
            width={1277}
            height={832}
            sizes="48px"
            // Eager, not `priority`: the mark is above the fold on desktop
            // so it should not lazy-load, but the whole rail is `hidden`
            // below md and `priority` would emit a preload link on phones
            // where it never renders ("preloaded but not used").
            loading="eager"
            className="h-8 w-auto shrink-0 object-contain"
          />
          <span className="hidden flex-col xl:flex">
            <span className="font-grotesk text-base leading-tight font-bold text-bd-green">
              Kandari-Lab
            </span>
            <span className="font-bengali text-xs text-text-muted">
              কাণ্ডারী-ল্যাব
            </span>
          </span>
        </Link>

        <nav className="flex flex-col gap-0.5">
          {profileNav.map((item) => {
            const isActive = active === item.path;
            const className = cn(
              "flex items-center gap-space-md rounded-full px-space-sm py-space-sm transition-colors xl:px-space-md",
              "max-xl:justify-center",
              isActive
                ? "bg-mint-subtle font-bold text-bd-green"
                : "text-text-primary hover:bg-mint-subtle",
            );
            const inner = (
              <>
                <Icon
                  name={item.icon}
                  className="shrink-0 text-2xl"
                  filled={isActive}
                />
                <span className="hidden font-sans text-base xl:inline">
                  {item.label}
                </span>
              </>
            );

            // Only Home leaves this screen; the rest are demo affordances.
            return item.href ? (
              <Link
                key={item.path}
                href={item.href}
                title={item.label}
                className={className}
              >
                {inner}
              </Link>
            ) : (
              <button
                key={item.path}
                type="button"
                title={item.label}
                onClick={() => setActive(item.path)}
                aria-current={isActive ? "page" : undefined}
                className={className}
              >
                {inner}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          className="mt-space-sm flex items-center justify-center gap-space-sm rounded-full bg-signal-orange px-space-md py-space-sm font-grotesk font-bold text-text-primary shadow-sm transition-all hover:bg-amber-600 hover:shadow-md active:translate-y-px"
        >
          <Icon name="edit_square" className="text-xl xl:hidden" />
          <span className="hidden xl:inline">পোস্ট করুন</span>
        </button>
      </div>

      {/* Account pill — doubles as the sign-out control. */}
      <button
        type="button"
        onClick={signOut}
        title="সাইন আউট"
        className="flex items-center justify-between gap-space-sm rounded-full border border-transparent p-space-xs transition-colors hover:border-card-border hover:bg-mint-subtle xl:p-space-sm"
      >
        <span className="flex min-w-0 items-center gap-space-sm">
          <Avatar
            initials={profileUser.initials}
            tone="mint"
            className="size-10 text-sm"
          />
          <span className="hidden min-w-0 flex-col text-left leading-tight xl:flex">
            <span className="truncate font-grotesk text-sm font-bold text-text-primary">
              {profileUser.nameBn}
            </span>
            <span className="truncate font-sans text-xs text-text-muted">
              {profileUser.handle}
            </span>
          </span>
        </span>
        <Icon
          name="logout"
          className="hidden shrink-0 text-lg text-text-muted xl:block"
        />
      </button>
    </aside>
  );
}
