"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { HandHeart, Trophy, UsersRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type View = "teams" | "events" | "challenges";

export const VIEWS: { key: View; label: string; Icon: LucideIcon }[] = [
  { key: "teams", label: "টিম ও গ্রুপ", Icon: UsersRound },
  { key: "events", label: "উদ্যোগ", Icon: HandHeart },
  { key: "challenges", label: "চ্যালেঞ্জ", Icon: Trophy },
];

/** The page's three parts, one sticky row; the gold pill springs to the one open. */
export function Switcher({ view }: { view: View }) {
  const reduce = useReducedMotion();
  return (
    <nav id="parts" aria-label="একসাথে — অংশ" className="sticky top-[var(--sticky-top,4rem)] z-30 -mx-3 scroll-mt-20 bg-black/85 px-3 py-2 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:px-2">
      <ul className="grid grid-cols-3 gap-1">
        {VIEWS.map(({ key, label, Icon }) => {
          const on = view === key;
          return (
            <li key={key}>
              <Link
                href={`/media/together?v=${key}`}
                scroll={false}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "relative isolate flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-sm font-bold whitespace-nowrap [-webkit-tap-highlight-color:transparent] transition-[color,scale] duration-200 active:scale-95 sm:text-base",
                  on ? "text-text-primary" : "text-white/75 hover:text-white",
                )}
              >
                {on && (
                  <motion.span
                    layoutId="together-tab"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40, mass: 0.7 }}
                    className="absolute inset-0 -z-10 rounded-xl bg-signal-orange shadow-[0_10px_24px_-14px_var(--color-signal-orange)]"
                    aria-hidden
                  />
                )}
                <Icon className="size-4.5 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
