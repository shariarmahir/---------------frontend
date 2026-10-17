"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { useAuth } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

/**
 * Join Kandari Profile, laid out like shikho.com's help band: one wide
 * panel carrying the invitation and its single action, a photograph
 * melting into it on the right, and beside it two stacked cards for the
 * free ways in that need no profile decision first (the research library,
 * the community). All on solid fields: the panel gold with a navy button,
 * the cards navy and ink with gold ones. A member gets "My Profile"
 * instead of the sign-up.
 */
const WAYS_IN = [
  {
    title: "Open Research Library",
    body: "Papers and field notes on Bangladesh’s problems, free to read.",
    action: "Read Research",
    href: "/research",
    icon: "menu_book",
    card: "bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset",
    muted: "text-white/70",
    glow: "var(--color-bdnavy-400)",
  },
  {
    title: "শিক্ষিতদের মিডিয়া",
    body: "Show your skills, get verified by the community, find fair-paid work.",
    action: "Join Social",
    href: "/media",
    icon: "diversity_3",
    card: "bg-text-primary text-white ring-1 ring-white/12 ring-inset",
    muted: "text-white/70",
    glow: "var(--color-signal-orange)",
  },
];

export function KandariProfileSection() {
  const { account } = useAuth();

  return (
    <section id="kandari-profile" aria-labelledby="kandari-profile-title" className="section-band mx-auto max-w-7xl px-gutter-x">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        {/* The invitation. */}
        <div className="story-reveal relative grid overflow-hidden rounded-3xl bg-signal-orange text-text-primary sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="relative order-2 flex flex-col items-start gap-4 p-6 sm:order-1 sm:p-8 lg:p-10">
            <h2 id="kandari-profile-title" className="font-grotesk text-2xl leading-tight font-bold tracking-tight text-balance text-bdnavy-900 sm:text-3xl">
              Join Kandari Profile for breakthrough R&amp;D
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-text-primary/80 sm:text-base">
              One free profile to hear first about new research, product releases and early access to what the lab
              builds.
            </p>
            <p className="font-grotesk text-lg font-bold text-bdnavy-900">
              Free to join, always
            </p>
            <Link href={account ? "/account" : "/signup"} className={cn(btn.navy, "mt-2 px-8 py-4 text-sm sm:text-base")}>
              <Icon name={account ? "account_circle" : "person_add"} className="text-[22px] text-signal-orange" />
              {account ? "My Profile" : "Join Kandari Profile"}
            </Link>
            <p className="text-xs font-medium text-text-primary/75">* Sign up with a phone code or email *</p>
          </div>

          {/* The photograph melts into the gold at the seam, as on the team cards. */}
          <div className="relative order-1 h-48 sm:order-2 sm:h-auto">
            <Image
              src="/hero/Hero-8.jpg"
              alt="সরিষা ক্ষেতের ভেতর দিয়ে স্কুলে যাচ্ছে চার কিশোরী"
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 45vw, 100vw"
              style={{ objectPosition: "50% 40%" }}
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 -bottom-px h-1/2 bg-linear-to-t from-signal-orange to-transparent sm:inset-y-0 sm:-left-px sm:h-auto sm:w-1/2 sm:bg-linear-to-r"
            />
          </div>
        </div>

        {/* The free ways in. */}
        <ul className="flex flex-col gap-4">
          {WAYS_IN.map((way) => (
            <li key={way.href} className="story-reveal flex flex-1">
              <Link
                href={way.href}
                style={{ "--glow": way.glow } as CSSProperties}
                className={cn(
                  "group flex w-full items-center justify-between gap-4 rounded-3xl p-6 sm:p-7",
                  "transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_40px_-22px_var(--glow)]",
                  "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none",
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  way.card,
                )}
              >
                <span className="flex min-w-0 flex-col items-start gap-3">
                  <span className={cn("font-grotesk text-xl leading-tight font-bold", /[ঀ-৿]/.test(way.title) && "font-bengali")}>{way.title}</span>
                  <span className={cn("text-sm leading-snug", way.muted)}>{way.body}</span>
                  {/* Styled as a button; the whole card is the link. */}
                  <span className={cn(btn.gold, "mt-1 px-5 py-2.5 sm:py-2.5")}>{way.action}</span>
                </span>
                {/* A tilted gold tile on a solid offset shadow, straightening under the pointer. */}
                <span
                  aria-hidden
                  className="grid size-20 shrink-0 -rotate-8 place-items-center rounded-2xl bg-signal-orange text-bdnavy-900 shadow-[6px_6px_0_rgb(0_0_0/0.35)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-0 motion-reduce:transition-none sm:size-24"
                >
                  {/* `!`: Google's icon stylesheet pins every symbol at 24px and outranks the utilities. */}
                  <Icon name={way.icon} className="text-[44px]! sm:text-[52px]!" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
