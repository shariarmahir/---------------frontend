"use client";

/*
 * THESIS: a research paper you read on paper and talk about on black — the
 * header, score and actions live on the ground; the text sits on a warm
 * paper sheet with its contents beside it and its facts on a white tile.
 */
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { citation, contents, FIELDS, KINDS, LEVELS, readMinutes, related, type Article } from "@/lib/research/core";
import { useLibrary } from "@/lib/research/store";
import { cn } from "@/lib/utils";
import { Discussion } from "./discussion";
import { ActionBar, ScoreCard } from "./engage";
import { Blocks, Callout, Cited, FigureView, TableView } from "./prose";
import { articleHref, Avatar, bn, bnDate, byline, FieldChip, KindChip, LevelChip, StatusChips } from "./ui";

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
  return <div ref={bar} aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0 bg-signal-orange" />;
}

/** The section the reader is in, for the contents list. */
function useActiveSection(ids: string[]): string | undefined {
  const [active, setActive] = useState<string>();
  const key = ids.join("|");
  useEffect(() => {
    const els = key.split("|").map((id) => document.getElementById(id)).filter((e): e is HTMLElement => Boolean(e));
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
  return (
    <ol className="space-y-0.5 text-sm">
      {toc.map((t) => (
        <li key={t.id}>
          <a
            href={`#${t.id}`}
            aria-current={active === t.id ? "location" : undefined}
            className={cn(
              "grid grid-cols-[1.6rem_minmax(0,1fr)] rounded-lg px-2 py-1.5 leading-snug transition-colors",
              active === t.id ? "bg-white/10 font-bold text-white" : "text-white/60 hover:text-white",
            )}
          >
            <span className={cn("font-wiki", active === t.id ? "text-signal-orange" : "text-white/35")}>{bn(t.n)}</span>
            <span>{t.heading}</span>
          </a>
        </li>
      ))}
      {a.references.length > 0 && (
        <li>
          <a href="#references" className={cn("grid grid-cols-[1.6rem_minmax(0,1fr)] rounded-lg px-2 py-1.5 transition-colors", active === "references" ? "bg-white/10 font-bold text-white" : "text-white/60 hover:text-white")}>
            <span className="font-wiki text-white/35">{bn(toc.length + 1)}</span>
            <span>তথ্যসূত্র</span>
          </a>
        </li>
      )}
    </ol>
  );
}

/** এক নজরে: the paper's facts on a white tile. */
function Facts({ a }: { a: Article }) {
  const rows: [string, React.ReactNode][] = [
    ["ধরন", KINDS[a.kind].bn],
    ["বিষয়ক্ষেত্র", <Link key="f" href={`/research/contents#${a.field}`} className="font-semibold text-bd-green hover:underline">{FIELDS[a.field].bn}</Link>],
    ["পর্যায়", LEVELS[a.level]],
    ["প্রতিষ্ঠান", a.institution],
    ...(a.supervisor ? [["তত্ত্বাবধায়ক", a.supervisor] as [string, string]] : []),
    ["সাল", bn(a.year)],
    ...(a.district ? [["জেলা", a.district] as [string, string]] : []),
    ["প্রকাশ", bnDate(a.published)],
    ...(a.facts ?? []).map((f) => [f.label, f.value] as [string, string]),
  ];
  return (
    <aside aria-label="এক নজরে" className="overflow-hidden rounded-[1.75rem] bg-white text-sm text-text-primary">
      {a.image && (
        <figure>
          <span className="relative block aspect-4/3">
            <Image src={a.image.src} alt={a.image.caption} fill sizes="(min-width: 1024px) 320px, 100vw" className="object-cover" />
          </span>
          <figcaption className="px-4 pt-2.5 text-xs leading-snug text-text-secondary">
            {a.image.caption}
            {a.image.credit && <span className="mt-0.5 block text-[11px] text-text-muted">{a.image.credit}</span>}
          </figcaption>
        </figure>
      )}
      <p className="font-wiki px-4 pt-4 text-lg font-bold">এক নজরে</p>
      <dl className="mt-2 divide-y divide-card-border px-4">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 py-2">
            <dt className="font-bold">{k}</dt>
            <dd className="text-text-secondary">{v}</dd>
          </div>
        ))}
      </dl>
      {a.keywords.length > 0 && (
        <p className="flex flex-wrap gap-1.5 border-t border-card-border p-4">
          {a.keywords.map((k) => (
            <Link key={k} href={`/research/search?q=${encodeURIComponent(k)}`} className="rounded-full bg-mint-subtle px-2.5 py-1 text-xs font-semibold text-bd-green ring-1 ring-card-border transition-colors hover:bg-bd-green hover:text-white">#{k}</Link>
          ))}
        </p>
      )}
      {a.file && !a.file.url && (
        <p className="flex items-center gap-2 border-t border-card-border p-4 text-xs text-text-muted"><Icon name="picture_as_pdf" className="text-[18px]" /> {a.file.name} — ফাইলটি বড়, তাই শুধু নাম রাখা হয়েছে</p>
      )}
    </aside>
  );
}

function Notice({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-3 rounded-2xl bg-white/[0.05] px-4 py-3 text-sm leading-relaxed text-white/80 ring-1 ring-white/10">
      <Icon name={icon} className="mt-0.5 text-[20px] text-signal-orange" />
      <span>{children}</span>
    </p>
  );
}

/** One research article: header and score on black, the text on paper, the discussion under it. */
export function ArticleView({ a }: { a: Article }) {
  const root = useRef<HTMLElement>(null);
  const list = useLibrary();
  const more = related(list, a, 3);
  const active = useActiveSection([...a.sections.map((s) => s.id), "references"]);
  const last = [...a.revisions].sort((x, y) => y.at.localeCompare(x.at))[0];
  // Figures and tables are numbered through the whole article: চিত্র ১, ২ … and সারণি ১, ২ …
  const firstFig = a.sections.map((_, i) => a.sections.slice(0, i).reduce((n, s) => n + (s.figures?.length ?? 0), 0));
  const firstTab = a.sections.map((_, i) => a.sections.slice(0, i).reduce((n, s) => n + (s.tables?.length ?? 0), 0));

  return (
    <article ref={root}>
      <ReadingProgress target={root} />

      <header className="live-in grid gap-8 border-b border-white/10 pb-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-10">
        <div className="min-w-0">
          <nav aria-label="অবস্থান" className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-white/50">
            <Link href="/research" className="hover:text-white">গবেষণাকোষ</Link>
            <Icon name="chevron_right" className="text-[16px]" />
            <Link href={`/research/contents#${a.field}`} className="hover:text-white">{FIELDS[a.field].bn}</Link>
          </nav>
          <p className="mt-4 flex flex-wrap gap-1.5"><KindChip article={a} /><FieldChip article={a} /><LevelChip article={a} /><StatusChips article={a} /></p>
          <h1 className="font-wiki mt-4 text-[clamp(1.9rem,4.2vw,3.3rem)] leading-[1.2] font-bold text-balance text-white">{a.title}</h1>
          {a.titleEn && <p lang="en" className="mt-3 max-w-[60ch] text-lg leading-snug text-white/55">{a.titleEn}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span className="flex -space-x-2">
                {a.authors.slice(0, 4).map((x) => <Avatar key={x.name} name={x.name} />)}
              </span>
              <span className="text-sm leading-snug">
                <span className="block font-bold text-white">{byline(a)}</span>
                <span className="block text-white/55">{a.institution}</span>
              </span>
            </div>
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/55">
              <span className="inline-flex items-center gap-1"><Icon name="calendar_today" className="text-[17px]" /> {bnDate(a.published)}</span>
              <span className="inline-flex items-center gap-1"><Icon name="schedule" className="text-[17px]" /> {bn(readMinutes(a))} মিনিটের পড়া</span>
              <span className="inline-flex items-center gap-1"><Icon name="menu_book" className="text-[17px]" /> {bn(a.references.length)}টি তথ্যসূত্র</span>
            </span>
          </div>
        </div>
        <ScoreCard a={a} />
      </header>

      <div className="sticky top-header z-30 -mx-gutter-x border-b border-white/10 bg-black px-gutter-x py-3 lg:top-header-lg">
        <ActionBar a={a} />
      </div>

      {(a.status === "review" || a.preprint || a.ongoing || a.sample) && (
        <div className="mt-6 space-y-2">
          {a.status === "review" && <Notice icon="hourglass_top">এই নিবন্ধ <strong className="text-white">পর্যালোচনার অপেক্ষায়</strong> — এখন শুধু আপনি দেখছেন। পর্যালোচনা শেষে সবার জন্য প্রকাশ হবে।</Notice>}
          {a.preprint && <Notice icon="edit_note">এটি একটি <strong className="text-white">ওয়ার্কিং পেপার</strong> — এখনো পিয়ার-রিভিউ হয়নি। প্রতিটি সংখ্যা উৎসভিত্তিক, নির্ণীত বা মডেলকৃত হিসেবে চিহ্নিত; প্রশ্ন বা প্রমাণ থাকলে আলোচনায় লিখুন।</Notice>}
          {a.ongoing && <Notice icon="science">এটি <strong className="text-white">চলমান গবেষণা</strong> — ফলাফল চূড়ান্ত নয়, কাজ এগোলে হালনাগাদ হবে।</Notice>}
          {a.sample && <Notice icon="info">এটি একটি <strong className="text-white">নমুনা নিবন্ধ</strong> — গবেষণাকোষ কেমন দেখাবে তা বোঝাতে। লেখক, প্রতিষ্ঠান ও সংখ্যা কাল্পনিক; উদ্ধৃত করবেন না।</Notice>}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[13rem_minmax(0,1fr)_19rem]">
        <nav aria-label="সূচি" className="hidden xl:block">
          <div className="sticky top-[calc(var(--spacing-header-lg)+5.5rem)] max-h-[calc(100vh-var(--spacing-header-lg)-7rem)] overflow-y-auto pr-1 scrollbar-gold">
            <p className="mb-2 px-2 text-xs font-bold text-white/45">এই নিবন্ধে</p>
            <Contents a={a} active={active} />
          </div>
        </nav>

        <div className="min-w-0 rounded-[2rem] bg-paper p-5 text-text-primary sm:p-9">
          <p className="text-lg leading-[1.85] sm:text-[1.2rem]"><Cited text={a.summary} /></p>

          <details className="mt-6 rounded-2xl bg-text-primary p-4 text-white xl:hidden">
            <summary className="cursor-pointer font-bold">এই নিবন্ধে · {bn(a.sections.length)}টি অংশ</summary>
            <div className="mt-3"><Contents a={a} active={active} /></div>
          </details>

          {a.sections.map((s, i) => (
            <section key={s.id} aria-labelledby={s.id} className="mt-12">
              <h2 id={s.id} className="font-wiki flex scroll-mt-56 items-baseline gap-3 border-b-2 border-text-primary pb-2 text-2xl leading-snug font-bold sm:text-[1.75rem]">
                <span className="text-bd-green">{bn(i + 1)}</span> {s.heading}
              </h2>
              <div className="text-[17px] leading-[1.85]"><Blocks body={s.body} /></div>
              {s.callout && <Callout c={s.callout} />}
              {(s.figures ?? []).map((f, j) => <FigureView key={f.title} f={f} n={firstFig[i] + j + 1} />)}
              {(s.tables ?? []).map((t, j) => <TableView key={t.title} t={t} n={firstTab[i] + j + 1} />)}
            </section>
          ))}

          {a.references.length > 0 && (
            <section aria-labelledby="references" className="mt-14">
              <h2 id="references" className="font-wiki scroll-mt-56 border-b-2 border-text-primary pb-2 text-2xl font-bold sm:text-[1.75rem]">তথ্যসূত্র</h2>
              <ol className="mt-4 space-y-2 text-sm leading-relaxed">
                {a.references.map((r, i) => (
                  <li key={i} id={`ref-${i + 1}`} className="grid scroll-mt-56 grid-cols-[2rem_minmax(0,1fr)] rounded-lg px-1 py-0.5 target:bg-signal-orange/25">
                    <span className="font-bold text-bd-green">{bn(i + 1)}.</span>
                    <span>
                      {r.text}
                      {r.url && <> <a href={r.url} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-bd-green hover:underline">{r.url.replace(/^https?:\/\//, "")}</a></>}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section aria-label="উদ্ধৃতি" className="mt-12 rounded-2xl bg-text-primary p-5 text-white">
            <p className="flex items-center gap-2 text-sm font-bold text-signal-orange"><Icon name="format_quote" className="text-[20px]" /> এই গবেষণা উদ্ধৃত করতে</p>
            <p className="mt-2 font-mono text-xs leading-relaxed break-words text-white/80">{citation(a, `/research/${a.slug}`)}</p>
          </section>

          <footer className="mt-8 space-y-2 border-t border-card-border pt-5 text-sm">
            <p className="flex flex-wrap items-center gap-1.5">
              <span className="font-bold">বিভাগ:</span>
              {[FIELDS[a.field].bn, KINDS[a.kind].bn, LEVELS[a.level], a.district].filter(Boolean).map((c) => (
                <span key={c} className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-bd-green ring-1 ring-card-border">{c}</span>
              ))}
            </p>
            {last && <p className="text-xs text-text-muted">সর্বশেষ সম্পাদনা {bnDate(last.at)} — {last.by}।</p>}
          </footer>
        </div>

        <div className="space-y-4 lg:sticky lg:top-[calc(var(--spacing-header-lg)+5.5rem)] lg:self-start">
          <Facts a={a} />
        </div>
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[13rem_minmax(0,1fr)_19rem]">
        <div className="min-w-0 xl:col-start-2"><Discussion a={a} /></div>
        <details className="h-fit rounded-[1.75rem] bg-white/[0.04] p-5 ring-1 ring-white/10">
          <summary className="cursor-pointer font-bold text-white"><Icon name="history" className="mr-1 align-[-5px] text-[20px] text-signal-orange" />সম্পাদনার ইতিহাস · {bn(a.revisions.length)}</summary>
          <ol className="mt-3 space-y-3 text-sm">
            {[...a.revisions].sort((x, y) => y.at.localeCompare(x.at)).map((r) => (
              <li key={r.at + r.note} className="border-l-2 border-signal-orange/60 pl-3">
                <span className="block text-xs text-white/45">{bnDate(r.at)}</span>
                <span className="font-bold text-white">{r.by}</span> <span className="text-white/65">— {r.note}</span>
              </li>
            ))}
          </ol>
        </details>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more" className="mt-16 border-t border-white/10 pt-10">
          <p className="text-sm font-bold text-signal-orange">আরও পড়ুন</p>
          <h2 id="more" className="font-wiki mt-1 text-[1.75rem] font-bold text-white">কাছাকাছি গবেষণা</h2>
          <ul className="mt-5 grid gap-3 md:grid-cols-3">
            {more.map((x) => (
              <li key={x.slug}>
                <Link href={articleHref(x)} className="group flex h-full flex-col rounded-[1.5rem] bg-white/[0.04] p-5 ring-1 ring-white/10 transition-[translate,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white/[0.07] motion-reduce:hover:translate-y-0">
                  <span className="flex flex-wrap gap-1.5"><KindChip article={x} /><FieldChip article={x} /></span>
                  <span className="font-wiki mt-3 text-lg leading-snug font-bold text-white group-hover:text-signal-orange">{x.title}</span>
                  <span className="mt-2 line-clamp-2 text-sm text-white/55">{x.summary}</span>
                  <span className="mt-4 text-xs text-white/45 md:mt-auto md:pt-4">{byline(x, 2)} · {bn(x.year)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
