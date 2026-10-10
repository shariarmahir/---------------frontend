import Link from "next/link";
import { Award, BadgeCheck, Briefcase, Search, ShieldAlert } from "lucide-react";
import { board, departments, getCourse } from "@/data/media/academy";
import { DISTINCTION, EXAMINER_GAP, MIN_ATTENDANCE, MIN_HOMEWORK, PASS_MARK, VERDICTS, finalResult } from "@/lib/media/academy";
import { cn } from "@/lib/utils";
import { DateText, Num } from "../../ui/numerals";
import { AssetCard, AssetGrid } from "../catalogue/asset-card";
import { Band, BandTitle, Turn, twoDigits } from "../catalogue/band";
import { CatalogueFooter } from "../catalogue/catalogue-footer";
import { CatalogueNav } from "../catalogue/catalogue-nav";
import { CatalogueRoot } from "../catalogue/catalogue-root";
import { CatalogueRuler } from "../catalogue/ruler";
import { toneStyle } from "../catalogue/tones";
import { MyFinals } from "../my-finals";

const RULES = [
  {
    title: "কে বসতে পারেন",
    body: (
      <>
        অন্তত <Num value={MIN_ATTENDANCE * 100} />% ক্লাসে হাজিরা, <Num value={MIN_HOMEWORK * 100} />% হোমওয়ার্ক আর ফাইনাল প্রজেক্ট জমা। অভিজ্ঞতার স্বীকৃতি পেলে শুধু প্রজেক্ট।
      </>
    ),
  },
  {
    title: "দুই পরীক্ষক",
    body: (
      <>
        শিক্ষক আর একজন বহিরাগত পেশাদার আলাদা নম্বর দেন। দুজনের ফারাক <Num value={EXAMINER_GAP} />
        -এর বেশি হলে তৃতীয় পরীক্ষক আসেন।
      </>
    ),
  },
  {
    title: "ফল",
    body: (
      <>
        <Num value={DISTINCTION} />+ কৃতিত্বের সাথে, <Num value={PASS_MARK} />+ উত্তীর্ণ। এর নিচে হলে ফল প্রকাশ হয় না — ৩০ দিন পর আবার চেষ্টা।
      </>
    ),
  },
  { title: "সনদ", body: "KTA আইডিসহ, যে কেউ এই পাতায় যাচাই করতে পারেন। এটা দক্ষতার শিল্প-যাচাই, সরকারি ডিগ্রি নয়।" },
];

const passes = board.filter((s) => s.certificate).sort((a, b) => b.at.localeCompare(a.at));
const upcoming = board.filter((s) => !s.marks).sort((a, b) => a.at.localeCompare(b.at));
const toneOf = (code: string) => departments.findIndex((d) => d.id === getCourse(code)?.dept);

/**
 * পরীক্ষা — step eight, in the catalogue's bands: the four rules of the
 * final; the viewer's own finals beside the certificate check; the open
 * board of coming interviews; and everyone who passed, each certificate
 * one click from being checked.
 */
export function ExamView({ asked }: { asked: string }) {
  const found = asked ? passes.find((s) => s.certificate === asked) : undefined;

  return (
    <CatalogueRoot className="min-h-full">
      <CatalogueNav />
      <CatalogueRuler />

      <Band id="intro" n={1} label="পরীক্ষা" now note="ফাইনাল ও সনদ">
        <div className="px-6 py-14 md:px-10 md:py-20">
          <BandTitle as="h1" now>
            ইন্টারভিউটাই <Turn>ফাইনাল</Turn>।
          </BandTitle>
          <p data-reveal data-in className="mt-5 max-w-2xl text-lg leading-relaxed text-(--c-muted)">
            কোর্স শেষ মানেই পাস নয়। সত্যিকারের একটা কাজ বানিয়ে পেশাদারদের প্যানেলের সামনে ব্যাখ্যা করতে হয় — আর সেই ইন্টারভিউ সবার জন্য খোলা।
          </p>
        </div>
        <ol data-reveal-group className="grid gap-px border-t border-(--c-line) bg-(--c-line) sm:grid-cols-2 lg:grid-cols-4">
          {RULES.map((r, i) => (
            <li key={r.title} data-reveal className="bg-(--c-bg) p-6 md:p-8">
              <p className="hud text-(--c-faint)">{twoDigits(i + 1)}</p>
              <h2 className="display mt-4 text-xl text-(--c-ink-strong)">{r.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-(--c-muted)">{r.body}</p>
            </li>
          ))}
        </ol>
      </Band>

      <Band id="mine" n={2} label="আমার ফাইনাল" note="আর সনদ যাচাই">
        <div className="grid gap-px bg-(--c-line) lg:grid-cols-2">
          <div className="bg-(--c-bg) p-6 md:p-10">
            <h2 className="display text-2xl text-(--c-ink-strong)">আমার ফাইনাল</h2>
            <div className="mt-6">
              <MyFinals />
            </div>
          </div>
          <section id="verify" aria-labelledby="verify-title" className="scroll-mt-28 bg-(--c-bg) p-6 md:p-10">
            <h2 id="verify-title" className="display text-2xl text-(--c-ink-strong)">
              সনদ <Turn>যাচাই</Turn>
            </h2>
            <p className="mt-2 text-sm text-(--c-muted)">নিয়োগকর্তা, অভিভাবক বা যে কেউ — আইডি দিলেই মিলিয়ে দেখা যায়।</p>
            <form action="/media/academy/exam#verify" role="search" className="mt-6 flex">
              <label className="sr-only" htmlFor="cert-id">
                সনদের আইডি
              </label>
              <input
                id="cert-id"
                name="id"
                defaultValue={asked}
                placeholder="KTA-2026-…"
                autoComplete="off"
                spellCheck={false}
                className="h-12 min-w-0 flex-1 border border-(--c-line-strong) bg-(--c-bg-sunken) px-4 font-mono text-sm text-(--c-ink-strong) uppercase transition-colors duration-150 placeholder:text-(--c-faint) focus-visible:border-(--c-signal) focus-visible:outline-none"
              />
              <button type="submit" aria-label="যাচাই করুন" className="grid size-12 shrink-0 place-items-center bg-(--c-signal) text-black transition-opacity duration-150 hover:opacity-80">
                <Search className="size-5" aria-hidden />
              </button>
            </form>
            {asked &&
              (found ? (
                <div className="mt-5 border-l-4 border-(--c-good) bg-(--c-bg-sunken) p-4 text-sm">
                  <p className="flex items-center gap-2 font-bold text-(--c-good)">
                    <BadgeCheck className="size-5" aria-hidden /> আসল সনদ
                  </p>
                  <p className="mt-1.5 text-(--c-ink-strong)">
                    {found.learner} · {getCourse(found.course)?.title}
                  </p>
                  <p className="hud mt-1 text-(--c-muted)">
                    {VERDICTS[finalResult(found.marks!).verdict]} · <DateText iso={found.at} />
                  </p>
                </div>
              ) : (
                <p className="mt-5 flex gap-2 border-l-4 border-(--c-bad) bg-(--c-bg-sunken) p-4 text-sm text-(--c-bad)">
                  <ShieldAlert className="size-5 shrink-0" aria-hidden /> এই আইডির কোনো সনদ নেই — নকল হতে পারে।
                </p>
              ))}
          </section>
        </div>
      </Band>

      <Band id="board" n={3} label="প্রকাশ্য বোর্ড" note="সামনের ইন্টারভিউ — সবার জন্য খোলা">
        <ul>
          {upcoming.map((s) => (
            <li key={s.id} data-reveal style={toneStyle(toneOf(s.course))} className="tone grid gap-2 border-b border-(--c-line) px-6 py-6 last:border-b-0 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-8 md:px-10">
              <p className="hud text-(--c-app-ink)">
                <DateText iso={s.at} time weekday />
              </p>
              <div className="min-w-0">
                <p className="display text-xl text-(--c-ink-strong)">
                  {s.learner} <span className="hud font-normal text-(--c-faint)">· {s.district}</span>
                </p>
                <Link href={`/media/academy/course/${s.course}`} className="mt-1 block text-sm font-semibold text-(--c-accent-ink) underline-offset-4 hover:underline">
                  {getCourse(s.course)?.title}
                </Link>
                <p className="mt-2 leading-relaxed text-(--c-ink)">প্রজেক্ট: {s.project}</p>
                <p className="hud mt-2 text-(--c-faint)">প্যানেল: {s.panel.join(" · ")}</p>
              </div>
            </li>
          ))}
        </ul>
      </Band>

      <Band id="passed" n={4} label="উত্তীর্ণ" note="নিয়োগকর্তারা এখান থেকেই খোঁজেন">
        <AssetGrid count={passes.length}>
          {passes.map((s, i) => {
            const { average, verdict } = finalResult(s.marks!);
            return (
              <li key={s.id} style={toneStyle(toneOf(s.course))} className="tone bg-(--c-bg)">
                <AssetCard
                  kind={{ icon: Award, label: VERDICTS[verdict] }}
                  n={i + 1}
                  title={s.learner}
                  text={
                    <>
                      <p className="font-semibold text-(--c-app-ink)">{getCourse(s.course)?.title}</p>
                      <p className="mt-1.5">{s.project}</p>
                    </>
                  }
                  extra={
                    <p className="hud mt-4 flex flex-wrap gap-x-3 gap-y-1 text-(--c-faint)">
                      <span className={cn(verdict === "distinction" && "font-bold text-(--c-signal)")}>
                        গড় <Num value={average} />
                      </span>
                      <span>
                        পরীক্ষক <Num value={s.marks!.length} /> জন{s.marks!.length > 2 && " (তৃতীয়সহ)"}
                      </span>
                      <DateText iso={s.at} />
                      <Link href={`/media/academy/exam?id=${s.certificate}#verify`} className="font-mono text-(--c-accent-ink) underline-offset-4 hover:underline">
                        {s.certificate}
                      </Link>
                    </p>
                  }
                  action={{ href: "/media/jobs", label: "কাজে ডাকুন", icon: Briefcase }}
                />
              </li>
            );
          })}
        </AssetGrid>
      </Band>

      <CatalogueFooter />
    </CatalogueRoot>
  );
}
