"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { videoRating } from "@/data/media/academy";
import { ratingWith, type ClassVideo } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { Num } from "../../ui/numerals";
import { updateAcademy, useAcademy } from "../use-academy";

const WORDS = ["", "ভালো লাগেনি", "চলে", "ভালো", "খুব ভালো", "অসাধারণ"];

/**
 * How learners rated this class — the average, how many, and the spread
 * from five stars down — and the viewer's own stars. A teacher can't rate
 * their own class, and a course video is rated by those who can watch it.
 */
export function VideoRating({ video, canRate, own }: { video: ClassVideo; canRate: boolean; own: boolean }) {
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const saved = useAcademy((a) => a.ratings[video.id]);
  const mine = hydrated ? saved : undefined;
  const [hover, setHover] = useState(0);
  const r = ratingWith(videoRating(video), mine);
  const most = Math.max(1, ...r.stars);
  const shown = hover || mine || 0;
  const locked = own || !canRate;

  function rate(n: number) {
    updateAcademy((a) => ({ ...a, ratings: { ...a.ratings, [video.id]: n } }));
    toast.success(`${WORDS[n]} — রেটিং দেওয়া হলো`, { description: "আপনার মতামত নিচে লিখলে শিক্ষক আরও ভালো বুঝবেন।" });
  }

  function clear() {
    updateAcademy((a) => {
      const ratings = { ...a.ratings };
      delete ratings[video.id];
      return { ...a, ratings };
    });
  }

  return (
    <section aria-labelledby="rating-title" className="mt-6 grid gap-6 rounded-xl bg-m-ink/4 p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:p-5 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
      <div className="text-center sm:text-left">
        <h2 id="rating-title" className="text-sm font-semibold text-m-ink/75">ক্লাসের রেটিং</h2>
        <p className="mt-1 text-5xl leading-none font-bold text-m-ink tabular-nums">{r.count ? <Num value={r.avg} decimals={1} /> : "—"}</p>
        <Stars value={r.avg} className="mt-2 justify-center sm:justify-start" />
        <p className="mt-1 text-xs text-m-ink/65">
          <Num value={r.count} /> জনের রেটিং
        </p>
      </div>

      <ol className="space-y-1.5 self-center" aria-label="কত জন কত তারা দিয়েছেন">
        {[5, 4, 3, 2, 1].map((s) => (
          <li key={s} className="flex items-center gap-2 text-xs text-m-ink/70">
            <span className="w-3 tabular-nums">
              <Num value={s} />
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-m-ink/6">
              <motion.span
                className="block h-full rounded-full bg-m-yellow"
                initial={reduce ? false : { width: 0 }}
                whileInView={{ width: `${(r.stars[s - 1] / most) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: (5 - s) * 0.06, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
            <span className="w-10 text-right tabular-nums">
              <Num value={r.stars[s - 1]} />
            </span>
          </li>
        ))}
      </ol>

      <div className="border-t border-m-ink/9 pt-4 sm:col-span-2 lg:col-span-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
        <p className="text-sm font-semibold text-m-ink">আপনার রেটিং</p>
        {locked ? (
          <p className="mt-2 max-w-56 text-xs leading-relaxed text-m-ink/65">{own ? "নিজের ক্লাসে রেটিং দেওয়া যায় না।" : "কোর্সে ভর্তি হলে এই ক্লাসে রেটিং দিতে পারবেন।"}</p>
        ) : (
          <>
            <div role="radiogroup" aria-label="তারা দিন" className="mt-2 flex" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <motion.button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={mine === n}
                  aria-label={`${n} তারা — ${WORDS[n]}`}
                  onMouseEnter={() => setHover(n)}
                  onFocus={() => setHover(n)}
                  onBlur={() => setHover(0)}
                  onClick={() => rate(n)}
                  whileHover={reduce ? undefined : { scale: 1.2 }}
                  whileTap={reduce ? undefined : { scale: 0.85 }}
                  className="grid size-10 place-items-center rounded-lg focus-visible:outline-2 focus-visible:outline-m-blue"
                >
                  <motion.span key={`${n}-${mine}`} animate={mine && n <= mine && !reduce ? { scale: [1, 1.4, 1] } : undefined} transition={{ delay: n * 0.05, duration: 0.3 }}>
                    <Star className={cn("size-7 transition-colors", n <= shown ? "fill-m-yellow text-m-gold" : "text-m-ink/40")} aria-hidden />
                  </motion.span>
                </motion.button>
              ))}
            </div>
            <p className="mt-1 h-5 text-xs font-semibold text-m-ink/75" aria-live="polite">
              {shown ? WORDS[shown] : "তারায় চাপ দিন"}
              {mine && !hover && (
                <button type="button" onClick={clear} className="ml-2 font-normal text-m-ink/55 underline underline-offset-2 hover:text-m-ink">
                  মুছুন
                </button>
              )}
            </p>
          </>
        )}
      </div>
    </section>
  );
}

/** Five stars filled to a value, halves included. */
function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("flex gap-0.5", className)} aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - n + 1));
        return (
          <span key={n} className="relative size-4">
            <Star className="absolute inset-0 size-4 text-m-ink/30" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="size-4 fill-m-yellow text-m-gold" />
            </span>
          </span>
        );
      })}
    </span>
  );
}
