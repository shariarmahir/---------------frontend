"use client";

import Link from "next/link";
import { CalendarHeart, NotebookPen, Sparkles } from "lucide-react";
import { mediaButton } from "../ui/button-styles";
import { Num } from "../ui/numerals";
import { useMinutesToday } from "../wellbeing/usage";

/**
 * The feed ends. No infinite scroll: once you've seen today's posts, the
 * platform points you back to real life.
 */
export function FeedEnd() {
  const minutes = useMinutesToday();
  return (
    <section className="rounded-2xl border border-dashed border-m-blue/35 bg-m-card px-5 py-8 text-center shadow-m-tile">
      <Sparkles className="mx-auto size-8 text-m-blue" strokeWidth={1.5} aria-hidden />
      <h2 className="mt-3 text-lg font-bold text-m-ink">আজকের জন্য এটুকুই</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-m-ink/80">
        {minutes > 0 ? (
          <>
            আজ <Num value={minutes} /> মিনিট এখানে কাটালেন।{" "}
          </>
        ) : null}
        অনলাইনে শেখা কাজে লাগে বাস্তবে — কিছু বানান, কারো সাথে দেখা করুন, এলাকার জন্য কিছু করুন।
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/media/together?v=events" className={mediaButton({ variant: "green", size: "sm" })}>
          <CalendarHeart aria-hidden /> কাছের উদ্যোগ
        </Link>
        <Link href="/media/notes" className={mediaButton({ variant: "quiet", size: "sm" })}>
          <NotebookPen aria-hidden /> আজকের সেরা কাজ লিখে রাখুন
        </Link>
      </div>
    </section>
  );
}
