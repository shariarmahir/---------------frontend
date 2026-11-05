"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { useAuth } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { CardIcon } from "@/components/ui/card-icon";

/**
 * Join Kandari Profile, laid out like shikho.com's help band: one wide
 * panel carrying the invitation and its single action, the "Join Us!"
 * illustration framed on its own white ground on the right, and beside it two stacked cards for the
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
    lordicon: "book-bookmark",
    card: "bg-bdnavy-900 text-white ring-1 ring-white/12 ring-inset",
    muted: "text-white/65",
    glow: "var(--color-bdnavy-400)",
  },
  {
    title: "চেতনা",
    body: "Show your skills, get verified by the community, find fair-paid work.",
    action: "Join Social",
    href: "/media",
    icon: "diversity_3",
    lordicon: "media",
    card: "bg-text-primary text-white ring-1 ring-white/12 ring-inset",
    muted: "text-white/65",
    glow: "var(--color-signal-orange)",
  },
];

export function KandariProfileSection() {
  const { account } = useAuth();

  return (
    <section id="kandari-profile" aria-labelledby="kandari-profile-title" className="section-band mx-auto max-w-384 px-gutter-x">
      {/* From xl the invitation and the two cards stand side by side; on a small laptop (lg) the cards pair up under it. */}
      <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        {/* The invitation. */}
        <div className="story-reveal group/join relative grid overflow-hidden rounded-3xl bg-cobalt text-white sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="relative order-2 flex flex-col items-start gap-3 p-5 pt-3 sm:order-1 sm:gap-4 sm:p-8 xl:p-10">
            <h2 id="kandari-profile-title" className="font-grotesk text-2xl leading-tight font-bold tracking-tight text-balance text-signal-orange sm:text-3xl">
              Join Kandari Profile
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-white/80 sm:text-base">Hear first about new research and releases.</p>
            <p className="font-grotesk text-xl font-bold text-signal-orange">
              Free to join, always
            </p>
            {/* The section's one primary action: full width on phones. */}
            <Link href={account ? "/account" : "/signup"} className={cn(btn.gold, "mt-1 w-full sm:mt-2 sm:w-auto")}>
              <Icon name={account ? "account_circle" : "person_add"} className="text-2xl" />
              {account ? "My Profile" : "Join Kandari Profile"}
            </Link>
            <p className="text-xs font-medium text-white/80">* Sign up with a phone code or email *</p>
          </div>

          {/* The illustration in a white card cut to its own shape (1818 × 1109), so the whole picture
              shows with no empty white around it; it sits centred on the cobalt beside the words. */}
          <div className="order-1 flex items-center p-3 sm:order-2 sm:py-6 sm:pr-6 sm:pl-0">
            <div className="relative aspect-1818/1109 w-full max-sm:aspect-2/1 overflow-hidden rounded-2xl bg-white shadow-[0_18px_36px_-18px_rgb(0_0_0/0.6)]">
              <Image
                src="/about/join-us.png"
                alt="Illustration: a group of young people gathered together under the words “Join Us! Together we can make everything better.”"
                fill
                sizes="(min-width: 1024px) 440px, (min-width: 640px) 50vw, 100vw"
                className="object-cover max-sm:object-[50%_15%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/join:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover/join:scale-100"
              />
            </div>
          </div>
        </div>

        {/* The free ways in. */}
        <ul className="flex flex-col gap-3 sm:gap-4 lg:flex-row xl:flex-col">
          {WAYS_IN.map((way) => (
            <li key={way.href} className="story-reveal flex flex-1">
              <Link
                href={way.href}
                style={{ "--glow": way.glow } as CSSProperties}
                className={cn(
                  "group flex w-full items-center justify-between gap-4 rounded-3xl p-5 sm:p-7",
                  "transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[0_24px_40px_-22px_var(--glow)]",
                  "focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none",
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  way.card,
                )}
              >
                <span className="flex min-w-0 flex-col items-start gap-2 sm:gap-3">
                  <span className={cn("font-grotesk text-xl leading-tight font-bold", /[ঀ-৿]/.test(way.title) && "font-bengali")}>{way.title}</span>
                  <span className={cn("text-sm leading-snug", way.muted)}>{way.body}</span>
                  {/* Styled as a button; the whole card is the link. */}
                  <span className={cn(btn.gold, "mt-1")}>{way.action}</span>
                </span>
                {/* The icon, tilted, straightening under the pointer. */}
                <span
                  aria-hidden
                  className="grid size-16 shrink-0 -rotate-8 place-items-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:rotate-0 motion-reduce:transition-none sm:size-24"
                >
                  <CardIcon name={way.lordicon} fallback={way.icon} size={72} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
