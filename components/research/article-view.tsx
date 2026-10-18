"use client";

/*
 * THESIS: one research work, laid out after Coursera's role page
 * (Mahir, 2026-10-18): where it sits, then the title, the hook, what it
 * says and what a reader will learn beside its picture; the actions
 * (react, comment, share, download, upload, cite, save) in a bar that
 * stays in reach; what the work contains, part by part, beside its score;
 * the full text with its contents and facts; the discussion; similar work.
 * OWN-WORLD: the home page's: pitch-black ground; navy, ink and cobalt as
 * the only fields; gold for titles, figures and actions.
 */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { citation, contents, FIELDS, KINDS, LEVELS, readMinutes, related, type Article } from "@/lib/research/core";
import { useLibrary } from "@/lib/research/store";
import { problemCode } from "@/lib/research/tracks";
import { cn } from "@/lib/utils";
import { ResearchCard } from "./cards";
import { Discussion } from "./discussion";
import { ActionBar, DownloadMenu, ScoreCard } from "./engage";
import { Blocks, Callout, Cited, FigureView, TableView } from "./prose";
import { Avatar, bn, bnDate, byline, FieldChip, KindChip, LevelChip, SectionHead, StatusChips } from "./ui";

/** A thin gold line along the top of the window: how far through the article the reader is. */
function ReadingProgress({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = target.current;
      if (!el || !bar.current) return;
      const r = el.getBoundingClientRect();
      const done = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - window.innerHeight)));
      bar.current.style.transform = `scaleX(${done})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [target]);
  return <div ref={bar} aria-hidden className="fixed inset-x-0 top-0 z-60 h-0.75 origin-left scale-x-0 bg-signal-orange" />;
}

/** The section the reader is in, for the contents list. */
function useActiveSection(ids: string[]): string | undefined {
  const [active, setActive] = useState<string>();
  const key = ids.join("|");
  useEffect(() => {
    const els = key
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => Boolean(e));
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top)[0];
        if (seen) setActive(seen.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [key]);
  return active;
}

function Contents({ a, active }: { a: Article; active?: string }) {
  const toc = contents(a.sections);
  const items = [...toc, ...(a.references.length > 0 ? [{ n: toc.length + 1, id: "references", heading: "তথ্যসূত্র" }] : [])];
  return (
    <ol className="space-y-0.5 text-sm">
      {items.map((t) => (
        <li key={t.id}>
          <a
            href={`#${t.id}`}
            aria-current={active === t.id ? "location" : undefined}
            className={cn(
              "grid grid-cols-[1.6rem_minmax(0,1fr)] rounded-lg px-2 py-1.5 leading-snug transition-colors",
              active === t.id ? "bg-bdnavy-900 font-bold text-white" : "text-white/65 hover:text-white",
            )}
          >
            <span className={active === t.id ? "text-signal-orange" : "text-white/65"}>{bn(t.n)}</span>
            <span>{t.heading}</span>
          </a>
        </li>
      ))}
    </ol>
  );
}

/** এক নজরে: the work's facts on a navy card. */
function Facts({ a }: { a: Article }) {
  const rows: [string, React.ReactNode][] = [
    ["ধরন", KINDS[a.kind].bn],
    [
      "বিষয়ক্ষেত্র",
      <Link key="f" href={`/research/topic/${a.field}`} className="font-semibold text-signal-orange hover:underline">
        {FIELDS[a.field].bn}
      </Link>,
    ],
    ["পর্যায়", LEVELS[a.level]],
    ["প্রতিষ্ঠান", a.institution],
    ...(a.supervisor ? [["তত্ত্বাবধায়ক", a.supervisor] as [string, string]] : []),
    ["সাল", bn(a.year)],
    ...(a.district ? [["জেলা", a.district] as [string, string]] : []),
    ["পরিসর", a.scope === "global" ? "বৈশ্বিক" : "বাংলাদেশ"],
    ["প্রকাশ", bnDate(a.published)],
    ...(a.facts ?? []).map((f) => [f.label, f.value] as [string, string]),
  ];
  return (
    <aside aria-label="এক নজরে" className="overflow-hidden rounded-3xl bg-bdnavy-900 text-sm text-white ring-1 ring-white/12 ring-inset">
      <p className="px-5 pt-5 text-lg font-bold text-signal-orange">এক নজরে</p>
      <dl className="mt-2 divide-y divide-white/10 px-5">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 py-2">
            <dt className="font-bold">{k}</dt>
            <dd className="text-white/80">{v}</dd>
          </div>
        ))}
      </dl>
      {a.keywords.length > 0 && (
        <p className="flex flex-wrap gap-1.5 border-t border-white/10 p-5">
          {a.keywords.map((k) => (
            <Link
              key={k}
              href={`/research/search?q=${encodeURIComponent(k)}`}
              className="rounded-full px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-signal-orange hover:text-text-primary hover:ring-signal-orange"
            >
              #{k}
            </Link>
          ))}
        </p>
      )}
      {a.file && !a.file.url && (
        <p className="flex items-center gap-2 border-t border-white/10 p-5 text-xs text-white/65">
          <Icon name="picture_as_pdf" className="text-[18px]" /> {a.file.name} — ফাইলটি বড়, তাই শুধু নাম রাখা হয়েছে
        </p>
      )}
    </aside>
  );
}

function Notice({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-3 rounded-2xl bg-bdnavy-900 px-4 py-3 text-sm leading-relaxed text-white/80 ring-1 ring-white/12 ring-inset">
      <Icon name={icon} className="mt-0.5 text-[20px] text-signal-orange" />
      <span>{children}</span>
    </p>
  );
}

/** One research work: hero, actions, what it contains, the text, the discussion, similar work. */
export function ArticleView({ a }: { a: Article }) {
  const root = useRef<HTMLElement>(null);
  const list = useLibrary();
  const more = related(list, a, 4);
  const active = useActiveSection([...a.sections.map((s) => s.id), "references"]);
  const last = [...a.revisions].sort((x, y) => y.at.localeCompare(x.at))[0];
  const figures = a.sections.reduce((n, s) => n + (s.figures?.length ?? 0), 0);
  const tables = a.sections.reduce((n, s) => n + (s.tables?.length ?? 0), 0);
  // Figures and tables are numbered through the whole article: চিত্র ১, ২ … and সারণি ১, ২ …
  const firstFig = a.sections.map((_, i) => a.sections.slice(0, i).reduce((n, s) => n + (s.figures?.length ?? 0), 0));
  const firstTab = a.sections.map((_, i) => a.sections.slice(0, i).reduce((n, s) => n + (s.tables?.length ?? 0), 0));

  return (
    <article ref={root}>
      <ReadingProgress target={root} />

      {/* Where it sits. */}
      <nav aria-label="অবস্থান" className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-white/65">
        <Link href="/research" className="hover:text-white">
          গবেষণাকোষ
        </Link>
        <Icon name="chevron_right" className="text-base" />
        <Link href={`/research/topic/${a.field}`} className="hover:text-white">
          {FIELDS[a.field].bn}
        </Link>
        <Icon name="chevron_right" className="text-base" />
        <span className="line-clamp-1 max-w-[40ch] text-white/80">{a.title}</span>
      </nav>

      {/* The hero: title, hook, summary and what a reader will learn, beside the picture. */}
      <header className="live-in mt-6 grid gap-10 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-14">
        <div className="min-w-0">
          <p className="flex flex-wrap gap-1.5">
            <KindChip article={a} />
            <FieldChip article={a} />
            <LevelChip article={a} />
            <StatusChips article={a} />
          </p>
          <h1 className="mt-5 text-3xl leading-[1.2] font-bold text-balance text-white sm:text-4xl xl:text-5xl">{a.title}</h1>
          {a.titleEn && (
            <p lang="en" className="mt-3 max-w-[60ch] text-lg leading-snug text-white/65">
              {a.titleEn}
            </p>
          )}
          {a.dyk && <p className="mt-5 text-lg leading-relaxed font-semibold text-signal-orange">আপনি কি জানেন… {a.dyk}</p>}
          <p className="mt-4 line-clamp-5 max-w-[68ch] text-base leading-relaxed text-white/80">
            <Cited text={a.summary} />
          </p>
          {a.keywords.length > 0 && (
            <p className="mt-4 max-w-[68ch] text-base leading-relaxed text-white/80">
              <strong className="text-white">যা জানবেন: </strong>
              {a.keywords.join(" · ")}
            </p>
          )}
          {(a.problems?.length ?? 0) > 0 && (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-bold text-white">দেশের যে সমস্যা নিয়ে:</span>
              {a.problems!.map((n) => (
                <Link key={n} href="/research/topic/bd-live" className="rounded-full px-2.5 py-0.5 font-bold text-signal-orange ring-1 ring-signal-orange/45 tabular-nums hover:bg-signal-orange hover:text-text-primary">
                  {problemCode(n)}
                </Link>
              ))}
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="flex -space-x-2">
                {a.authors.slice(0, 4).map((x) => (
                  <Avatar key={x.name} name={x.name} />
                ))}
              </span>
              <span className="text-sm leading-snug">
                <span className="block font-bold text-white">{byline(a)}</span>
                <span className="block text-white/65">{a.institution}</span>
              </span>
            </div>
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/65">
              <span className="inline-flex items-center gap-1">
                <Icon name="calendar_today" className="text-[17px]" /> {bnDate(a.published)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon name="schedule" className="text-[17px]" /> {bn(readMinutes(a))} মিনিটের পড়া
              </span>
            </span>
          </div>
        </div>

        <div className="relative mr-3 mb-3 hidden lg:block">
          <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-cobalt shadow-[12px_12px_0_0_var(--color-bdnavy-900)] ring-1 ring-white/12">
            {a.image ? (
              <Image src={a.image.src} alt={a.image.caption} fill priority sizes="416px" className="object-cover" />
            ) : (
              <span aria-hidden className="absolute inset-0 grid place-items-center">
                <Icon name={FIELDS[a.field].icon} className="text-9xl! text-signal-orange" />
              </span>
            )}
          </div>
          {a.image && (
            <p className="mt-5 text-xs leading-snug text-white/65">
              {a.image.caption}
              {a.image.credit && <span className="block">{a.image.credit}</span>}
            </p>
          )}
        </div>
      </header>

      {/* The actions, in reach while reading. */}
      <div className="sticky top-header z-30 -mx-gutter-x border-y border-white/10 bg-black px-gutter-x py-3 lg:top-header-lg">
        <ActionBar a={a} />
      </div>

      {(a.status === "review" || a.preprint || a.ongoing || a.sample) && (
        <div className="mt-6 space-y-2">
          {a.status === "review" && (
            <Notice icon="hourglass_top">
              এই নিবন্ধ <strong className="text-white">পর্যালোচনার অপেক্ষায়</strong> — এখন শুধু আপনি দেখছেন। পর্যালোচনা শেষে সবার জন্য প্রকাশ হবে।
            </Notice>
          )}
          {a.preprint && (
            <Notice icon="edit_note">
              এটি একটি <strong className="text-white">ওয়ার্কিং পেপার</strong> — এখনো পিয়ার-রিভিউ হয়নি। প্রতিটি সংখ্যা উৎসভিত্তিক, নির্ণীত বা মডেলকৃত হিসেবে চিহ্নিত; প্রশ্ন বা প্রমাণ থাকলে আলোচনায় লিখুন।
            </Notice>
          )}
          {a.ongoing && (
            <Notice icon="science">
              এটি <strong className="text-white">চলমান গবেষণা</strong> — ফলাফল চূড়ান্ত নয়, কাজ এগোলে হালনাগাদ হবে।
            </Notice>
          )}
          {a.sample && (
            <Notice icon="info">
              এটি একটি <strong className="text-white">নমুনা নিবন্ধ</strong> — গবেষণাকোষ কেমন দেখাবে তা বোঝাতে। লেখক, প্রতিষ্ঠান ও সংখ্যা কাল্পনিক; উদ্ধৃত করবেন না।
            </Notice>
          )}
        </div>
      )}

      {/* What the work contains, part by part, beside its score. */}
      <section aria-labelledby="inside" className="mt-14 space-y-6">
        <SectionHead id="inside" title="এই গবেষণায় যা আছে" />
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
          <div className="rounded-3xl bg-text-primary p-6 ring-1 ring-white/12 ring-inset sm:p-8">
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "অংশ", value: a.sections.length },
                { label: "চিত্র ও সারণি", value: figures + tables },
                { label: "তথ্যসূত্র", value: a.references.length },
                { label: "মিনিটের পড়া", value: readMinutes(a) },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="order-2 text-sm font-semibold text-white/80">{s.label}</dt>
                  <dd className="order-1 text-3xl font-bold text-signal-orange tabular-nums">{bn(s.value)}</dd>
                </div>
              ))}
            </dl>
            <ol className="mt-6 divide-y divide-white/10 border-t border-white/10">
              {a.sections.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="group flex items-center gap-4 py-3.5">
                    <span className="w-16 shrink-0 text-xs font-bold text-white/65 tabular-nums">
                      অংশ {bn(i + 1)}/{bn(a.sections.length)}
                    </span>
                    <span className="min-w-0 flex-1 font-bold text-white group-hover:text-signal-orange">{s.heading}</span>
                    <Icon name="arrow_downward" className="text-lg text-signal-orange opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#read" className={btn.gold}>
                <Icon name="menu_book" className="text-xl" /> পড়া শুরু করুন
              </a>
              <DownloadMenu a={a} />
            </div>
          </div>
          <ScoreCard a={a} />
        </div>
      </section>

      {/* The full text. */}
      <div id="read" className="mt-16 grid scroll-mt-56 gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[13rem_minmax(0,1fr)_19rem]">
        <nav aria-label="সূচি" className="hidden xl:block">
          <div className="sticky top-[calc(var(--spacing-header-lg)+5.5rem)] max-h-[calc(100vh-var(--spacing-header-lg)-7rem)] overflow-y-auto pr-1 scrollbar-gold">
            <p className="mb-2 px-2 text-xs font-bold text-white/65">এই নিবন্ধে</p>
            <Contents a={a} active={active} />
          </div>
        </nav>

        <div className="min-w-0 rounded-3xl bg-text-primary p-5 text-white ring-1 ring-white/12 ring-inset sm:p-10">
          <p className="text-lg leading-[1.85] text-white/90 sm:text-xl">
            <Cited text={a.summary} />
          </p>

          <details className="mt-6 rounded-2xl bg-bdnavy-900 p-4 xl:hidden">
            <summary className="cursor-pointer font-bold">এই নিবন্ধে · {bn(a.sections.length)}টি অংশ</summary>
            <div className="mt-3">
              <Contents a={a} active={active} />
            </div>
          </details>

          {a.sections.map((s, i) => (
            <section key={s.id} aria-labelledby={s.id} className="mt-12">
              <h2 id={s.id} className="flex scroll-mt-56 items-baseline gap-3 border-b border-white/20 pb-2 text-2xl leading-snug font-bold text-white sm:text-[1.75rem]">
                <span className="text-signal-orange">{bn(i + 1)}</span> {s.heading}
              </h2>
              <div className="text-[17px] leading-[1.85] text-white/85">
                <Blocks body={s.body} />
              </div>
              {s.callout && <Callout c={s.callout} />}
              {(s.figures ?? []).map((f, j) => (
                <FigureView key={f.title} f={f} n={firstFig[i] + j + 1} />
              ))}
              {(s.tables ?? []).map((t, j) => (
                <TableView key={t.title} t={t} n={firstTab[i] + j + 1} />
              ))}
            </section>
          ))}

          {a.references.length > 0 && (
            <section aria-labelledby="references" className="mt-14">
              <h2 id="references" className="scroll-mt-56 border-b border-white/20 pb-2 text-2xl font-bold text-white sm:text-[1.75rem]">
                তথ্যসূত্র
              </h2>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed text-white/80">
                {a.references.map((r, i) => (
                  <li key={i} id={`ref-${i + 1}`} className="grid scroll-mt-56 grid-cols-[2rem_minmax(0,1fr)] rounded-lg px-1 py-0.5 target:bg-signal-orange/20">
                    <span className="font-bold text-signal-orange">{bn(i + 1)}.</span>
                    <span>
                      {r.text}
                      {r.url && (
                        <>
                          {" "}
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-semibold break-all text-signal-orange hover:underline">
                            {r.url.replace(/^https?:\/\//, "")}
                          </a>
                        </>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section aria-label="উদ্ধৃতি" className="mt-12 rounded-2xl bg-bdnavy-900 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-signal-orange">
              <Icon name="format_quote" className="text-[20px]" /> এই গবেষণা উদ্ধৃত করতে
            </p>
            <p className="mt-2 font-mono text-xs leading-relaxed wrap-break-word text-white/80">{citation(a, `/research/${a.slug}`)}</p>
          </section>

          <footer className="mt-8 space-y-2 border-t border-white/10 pt-5 text-sm">
            <p className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold">বিভাগ:</span>
              {[FIELDS[a.field].bn, KINDS[a.kind].bn, LEVELS[a.level], a.district].filter(Boolean).map((c) => (
                <span key={c} className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ring-1 ring-white/20">
                  {c}
                </span>
              ))}
            </p>
            {last && (
              <p className="text-xs text-white/65">
                সর্বশেষ সম্পাদনা {bnDate(last.at)} — {last.by}।
              </p>
            )}
          </footer>
        </div>

        <div className="space-y-4 lg:sticky lg:top-[calc(var(--spacing-header-lg)+5.5rem)] lg:self-start">
          <Facts a={a} />
        </div>
      </div>

      {/* The discussion, and the edit history beside it. */}
      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[13rem_minmax(0,1fr)_19rem]">
        <div className="min-w-0 xl:col-start-2">
          <Discussion a={a} />
        </div>
        <details className="h-fit rounded-3xl bg-bdnavy-900 p-5 ring-1 ring-white/12 ring-inset">
          <summary className="cursor-pointer font-bold text-white">
            <Icon name="history" className="mr-1 align-[-5px] text-[20px] text-signal-orange" />
            সম্পাদনার ইতিহাস · {bn(a.revisions.length)}
          </summary>
          <ol className="mt-3 space-y-3 text-sm">
            {[...a.revisions]
              .sort((x, y) => y.at.localeCompare(x.at))
              .map((r) => (
                <li key={r.at + r.note} className="border-l-2 border-signal-orange/60 pl-3">
                  <span className="block text-xs text-white/65">{bnDate(r.at)}</span>
                  <span className="font-bold text-white">{r.by}</span> <span className="text-white/80">— {r.note}</span>
                </li>
              ))}
          </ol>
        </details>
      </div>

      {/* Similar work, as cards. */}
      {more.length > 0 && (
        <section aria-labelledby="more" className="mt-20 space-y-6 border-t border-white/10 pt-12">
          <SectionHead
            id="more"
            title="কাছাকাছি গবেষণা"
            action={
              <Link href={`/research/topic/${a.field}`} className={btn.goldOutline}>
                সব {FIELDS[a.field].bn}
              </Link>
            }
          />
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {more.map((x) => (
              <li key={x.slug}>
                <ResearchCard a={x} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
