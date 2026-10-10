import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap, Sparkles, Star } from "lucide-react";
import { academies, courses } from "@/data/media/academy";
import { DEPT_KINDS } from "@/lib/media/academy";
import { twoDigits } from "../academy/catalogue/band";
import { academyEntries, splitName, type AcademyEntry } from "../academy/catalogue/entries";
import { toneStyle } from "../academy/catalogue/tones";
import { DeptIcon } from "../academy/departments/dept-icons";
import { DateText, Num } from "../ui/numerals";

/** What an academy has to show the feed today: its graduates first, then a new batch, then its rating. */
function news(e: AcademyEntry) {
  if (e.graduates > 0)
    return {
      Icon: GraduationCap,
      text: (
        <>
          <Num value={e.graduates} /> জন গ্র্যাজুয়েট হয়েছেন
        </>
      ),
    };
  if (e.seat)
    return {
      Icon: Sparkles,
      text: e.seat.running ? (
        <>
          ব্যাচ চলছে · <Num value={e.seat.left} />
          টি আসন খালি
        </>
      ) : (
        <>
          নতুন ব্যাচ <DateText iso={e.seat.starts} />
        </>
      ),
    };
  return {
    Icon: Star,
    text:
      e.rating.count > 0 ? (
        <>
          <Num value={e.rating.avg} /> রেটিং · <Num value={e.rating.count} /> রিভিউ
        </>
      ) : (
        <>নতুন একাডেমি</>
      ),
  };
}

/**
 * কাণ্ডারী তৈরি একাডেমি in the feed: the academies' impact in four numbers,
 * then each academy's latest news (graduates, a new batch, its rating) as a
 * small academy card in its department's colour. Every card opens its
 * academy; the head opens the catalogue.
 */
export function AcademyPulse() {
  const entries = academyEntries().sort((a, b) => b.graduates - a.graduates);
  const impact = [
    { n: academies.length, label: "একাডেমি" },
    { n: courses.length, label: "কোর্স" },
    { n: entries.reduce((sum, e) => sum + e.graduates, 0), label: "গ্র্যাজুয়েট" },
    { n: new Set(academies.flatMap((a) => a.teachers)).size, label: "শিক্ষক" },
  ];

  return (
    <section style={toneStyle(0)} aria-labelledby="academy-pulse" className="tone story-reveal relative overflow-hidden rounded-3xl border border-m-ink/10 bg-m-card shadow-m-tile">
      <header className="flex flex-wrap items-end justify-between gap-3 px-4 pt-5 sm:px-6">
        <div>
          <p className="font-mono text-[11px] font-bold tracking-wide text-(--c-app-ink) uppercase">একাডেমি থেকে</p>
          <h2 id="academy-pulse" className="mt-1 text-xl font-bold text-m-ink sm:text-2xl">
            শেখা, পাস, <span className="text-m-blue">কাজ</span> — এই সপ্তাহে
          </h2>
        </div>
        <Link href="/media/academy" className="group inline-flex min-h-9 items-center gap-1 rounded-full bg-m-yellow px-3.5 text-sm font-bold text-m-ink transition-[gap] hover:gap-2">
          সব একাডেমি <ArrowRight className="size-4" aria-hidden />
        </Link>
      </header>

      <dl className="mx-4 mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-m-ink/10 bg-m-ink/10 sm:mx-6 sm:grid-cols-4">
        {impact.map((it, i) => (
          <div key={it.label} className="bg-m-card px-3 py-3">
            <dt className="font-mono text-[11px] text-m-ink/60">
              {twoDigits(i + 1)} / {it.label}
            </dt>
            <dd className="font-display-m mt-0.5 text-2xl font-bold text-m-ink">
              <Num value={it.n} />
            </dd>
          </div>
        ))}
      </dl>

      <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 py-5 scrollbar-none sm:scroll-px-6 sm:px-6">
        {entries.map((e, i) => {
          const a = e.academy;
          const first = a.departments[0];
          const [head, tail] = splitName(a.name);
          const { Icon, text } = news(e);
          return (
            <li key={a.id} style={toneStyle(e.tone)} className="tone w-64 shrink-0 snap-start">
              <Link
                href={`/media/academy/a/${a.id}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-m-ink/10 bg-m-canvas transition-[translate,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-(--c-app) motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <span aria-hidden className="tone-bar" />
                <span className="flex items-center justify-between gap-2 border-b border-m-ink/10 px-3 py-2">
                  <span className="bg-(--c-app) px-1.5 font-mono text-[11px] font-bold text-black">{twoDigits(i + 1)}</span>
                  <span className="truncate font-mono text-[11px] text-m-ink/55">{DEPT_KINDS[a.kind]}</span>
                </span>
                <span className="relative block aspect-16/10 overflow-hidden bg-m-mist">
                  {e.cover && (
                    <Image src={e.cover.src} alt="" fill sizes="16rem" className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
                  )}
                </span>
                <span className="flex flex-1 flex-col px-3 pb-3">
                  <span className="relative -mt-7 grid size-14 place-items-center rounded-2xl bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.22)] transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none">
                    <DeptIcon dept={first.id} school={first.school} className="size-9" />
                  </span>
                  <span className="font-display-m mt-2 line-clamp-2 text-base leading-snug font-bold text-m-ink">
                    {head}
                    <span className="text-(--c-app-ink)">{tail}</span>
                  </span>
                  <span className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-m-ink/80">
                    <Icon className="size-4 shrink-0 text-(--c-app-ink)" aria-hidden />
                    <span className="truncate">{text}</span>
                  </span>
                  <span className="mt-auto flex items-center gap-1 pt-3 font-mono text-[11px] font-bold text-m-ink/60 transition-colors group-hover:text-m-ink">
                    একাডেমি দেখুন <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
