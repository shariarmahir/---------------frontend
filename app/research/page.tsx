/*
 * THESIS: a research journal's front page that is also a living
 * community — the cover paper, what readers are reacting to, which fields
 * and people lead, and what the country still needs studied.
 * OWN-WORLD: pitch-black ground; one solid gold cover, solid green for the
 * leading field and the open questions, white tiles for reference facts;
 * the encyclopedia serif for titles and big numerals.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CoverStory, LiveStats, TopFields, TopResearchers, Trending } from "@/components/research/home-live";
import { articleHref, bn, bnDate, byline, FieldChip, KindChip, MoreLink, SectionHead } from "@/components/research/ui";
import { Icon } from "@/components/ui/icon";
import { sourcePoints } from "@/data/amar-bangladesh";
import { libraryArticles } from "@/data/research/library";
import { featured, newest, rotate } from "@/lib/research/core";

export const metadata: Metadata = {
  title: "গবেষণাকোষ — বাংলাদেশের উন্মুক্ত গবেষণা প্ল্যাটফর্ম | কাণ্ডারী-ল্যাব",
  description: "বাংলাদেশের শিক্ষার্থী আর গবেষকদের থিসিস, গবেষণাপত্র আর উদ্ভাবন — পড়ুন, প্রতিক্রিয়া দিন, আলোচনা করুন, নিজের কাজ প্রকাশ করে ফিড ও সোশ্যাল মিডিয়ায় ছড়িয়ে দিন।",
};

// The picks rotate daily; render at most once an hour.
export const revalidate = 3600;

const SISTERS = [
  { href: "/media", icon: "dynamic_feed", title: "শিক্ষিতদের মিডিয়া", body: "গবেষণা শেয়ার করুন, দক্ষতা দেখান" },
  { href: "/media/classroom", icon: "school", title: "ক্লাসরুম ও ল্যাব", body: "দল মিলে গবেষণা শুরু করুন" },
  { href: "/bangladesh/problems", icon: "grid_view", title: "দেশের ৩২টি সমস্যা", body: "যে প্রশ্নগুলো সমাধান চায়" },
  { href: "/cholo-bangladesh-gori", icon: "sports_esports", title: "চলো বাংলাদেশ গড়ি", body: "সমস্যা আর সমাধানের সিমুলেশন" },
];

const STEPS = [
  { icon: "edit_document", title: "লিখুন", body: "সারসংক্ষেপ, পদ্ধতি, ফলাফল, তথ্যসূত্র — চাইলে পিডিএফ।" },
  { icon: "rate_review", title: "পর্যালোচনা", body: "পর্যালোচকেরা দেখেন; আলোচনায় প্রশ্ন ও পরামর্শ আসে।" },
  { icon: "campaign", title: "ছড়িয়ে দিন", body: "এক চাপে কাণ্ডারী ফিডে, ফেসবুক, লিংকডইন, হোয়াটসঅ্যাপে।" },
];

/** Today in Dhaka (UTC+6), the key the daily picks rotate on; the page re-renders hourly. */
function dhakaDay(): string {
  return new Date(Date.now() + 6 * 3_600_000).toISOString().slice(0, 10);
}

export default function ResearchMainPage() {
  const day = dhakaDay();
  const list = libraryArticles;
  const today = featured(list, day);
  const fresh = newest(list, 5);
  const hooks = rotate(list.filter((a) => a.dyk), day, 3);
  const wanted = rotate(sourcePoints, day, 4);
  // The keywords most articles share, then the rest in library order.
  const tally = new Map<string, number>();
  for (const a of list) if (a.status === "published") for (const k of a.keywords) tally.set(k, (tally.get(k) ?? 0) + 1);
  const topics = [...tally.entries()].sort((x, y) => y[1] - x[1]).slice(0, 9).map(([k]) => k);

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Masthead and cover. */}
      <section aria-labelledby="welcome" className="live-in grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-stretch lg:gap-10">
        <div className="flex flex-col">
          <p className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-sm font-bold text-signal-orange ring-1 ring-signal-orange/40">
            <Icon name="public" className="text-[18px]" /> বাংলাদেশের উন্মুক্ত গবেষণা প্ল্যাটফর্ম
          </p>
          <h1 id="welcome" className="font-wiki mt-5 text-[clamp(2.6rem,6.2vw,4.6rem)] leading-[1.12] font-bold text-white">
            দেশের প্রশ্ন,
            <span className="block text-signal-orange">দেশের গবেষণা।</span>
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-white/75">
            থিসিস, গবেষণাপত্র আর উদ্ভাবন — পড়ুন, প্রতিক্রিয়া দিন, আলোচনা করুন। নিজের কাজ প্রকাশ করুন, তারপর এক চাপে কাণ্ডারী ফিড আর সোশ্যাল মিডিয়ায় ছড়িয়ে দিন।
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/research/submit" className="inline-flex h-13 items-center gap-2 rounded-2xl bg-signal-orange px-6 text-[15px] font-bold text-text-primary transition-[translate,background-color] duration-200 hover:-translate-y-0.5 hover:bg-white motion-reduce:hover:translate-y-0">
              <Icon name="upload_file" className="text-[20px]" /> আপনার গবেষণা প্রকাশ করুন
            </Link>
            <Link href="/research/contents" className="inline-flex h-13 items-center gap-2 rounded-2xl px-5 text-[15px] font-bold text-white ring-1 ring-white/25 transition-colors hover:bg-white hover:text-text-primary">
              <Icon name="list_alt" className="text-[20px]" /> সব গবেষণা দেখুন
            </Link>
          </div>
          <div className="mt-9">
            <p className="text-sm font-bold text-white/55">জনপ্রিয় বিষয়</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {topics.map((k) => (
                <li key={k}>
                  <Link href={`/research/search?q=${encodeURIComponent(k)}`} className="inline-flex h-9 items-center rounded-full bg-white/[0.06] px-3.5 text-sm font-semibold text-white/85 ring-1 ring-white/12 transition-colors hover:bg-white hover:text-text-primary">#{k}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-10 lg:mt-auto lg:pt-10"><LiveStats /></div>
        </div>
        <CoverStory />
      </section>

      <TopFields />

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10">
        <Trending />
        <TopResearchers />
      </div>

      {today?.image && (
        <section aria-labelledby="featured" className="story-reveal space-y-5">
          <SectionHead id="featured" eyebrow={`আজ, ${bnDate(day, false)}`} title="আজকের নির্বাচিত গবেষণা" />
          <Link href={articleHref(today)} className="group grid overflow-hidden rounded-[2rem] bg-white text-text-primary md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <span className="relative block aspect-16/10 overflow-hidden md:aspect-auto md:min-h-80">
              <Image src={today.image.src} alt={today.image.caption} fill sizes="(min-width: 768px) 640px, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none" />
            </span>
            <span className="flex flex-col p-6 sm:p-8">
              <span className="flex flex-wrap gap-1.5"><KindChip article={today} paper /><FieldChip article={today} /></span>
              <span className="font-wiki mt-4 text-2xl leading-snug font-bold group-hover:text-bd-green sm:text-3xl">{today.title}</span>
              <span className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-text-secondary">{today.summary}</span>
              <span className="mt-4 text-sm text-text-muted">{byline(today)} · {today.institution} · {bn(today.year)}</span>
              {today.image.credit && <span className="mt-1 text-[11px] text-text-muted">{today.image.credit}</span>}
              <span className="mt-6 inline-flex items-center gap-1 self-start text-sm font-bold text-bd-green md:mt-auto md:pt-6">পুরো নিবন্ধ পড়ুন <Icon name="arrow_forward" className="text-[18px] transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" /></span>
            </span>
          </Link>
        </section>
      )}

      {/* The bento: did you know, what's wanted, what's new. */}
      <div className="grid gap-4 lg:grid-cols-3">
        <section aria-labelledby="dyk" className="story-reveal flex flex-col rounded-[1.75rem] bg-white/[0.04] p-6 ring-1 ring-white/10">
          <h2 id="dyk" className="font-wiki flex items-center gap-2 text-xl font-bold text-white"><Icon name="tips_and_updates" className="text-[24px] text-signal-orange" /> আপনি কি জানেন…</h2>
          <ul className="mt-4 space-y-4">
            {hooks.map((a) => (
              <li key={a.slug} className="text-[15px] leading-relaxed text-white/80">
                … {a.dyk}
                <Link href={articleHref(a)} className="mt-1 block text-sm font-bold text-signal-orange hover:underline">{a.title.length > 48 ? `${a.title.slice(0, 47)}…` : a.title}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="wanted" className="story-reveal flex flex-col rounded-[1.75rem] bg-bd-green p-6 text-white">
          <h2 id="wanted" className="font-wiki flex items-center gap-2 text-xl font-bold"><Icon name="help_center" className="text-[24px] text-signal-orange" /> গবেষণার অপেক্ষায়</h2>
          <p className="mt-2 text-sm text-white/80">দেশের এই প্রশ্নগুলোর উত্তর এখনো খোঁজা হচ্ছে। কাজ করলে এখানে প্রকাশ করুন।</p>
          <ul className="mt-4 space-y-3">
            {wanted.map((p) => (
              <li key={p.n} className="flex gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white text-xs font-bold text-bd-green">{bn(p.n)}</span>
                <span className="min-w-0 text-sm leading-snug">
                  <span lang="en" className="block font-semibold">{p.topic}</span>
                  <span lang="en" className="line-clamp-2 block text-white/75">{p.interpretation}</span>
                </span>
              </li>
            ))}
          </ul>
          <Link href="/bangladesh/problems" className="mt-5 inline-flex items-center gap-1 self-start text-sm font-bold text-signal-orange hover:underline sm:mt-auto sm:pt-5">দেশের ৩২টি সমস্যা <Icon name="arrow_forward" className="text-[18px]" /></Link>
        </section>

        <section aria-labelledby="new" className="story-reveal flex flex-col rounded-[1.75rem] bg-white/[0.04] p-6 ring-1 ring-white/10">
          <h2 id="new" className="font-wiki flex items-center gap-2 text-xl font-bold text-white"><Icon name="new_releases" className="text-[24px] text-signal-orange" /> সাম্প্রতিক প্রকাশ</h2>
          <ol className="mt-4 space-y-3.5">
            {fresh.map((a) => (
              <li key={a.slug}>
                <Link href={articleHref(a)} className="text-[15px] leading-snug font-semibold text-white hover:text-signal-orange">{a.title}</Link>
                <span className="mt-1 block text-xs text-white/50">{a.institution.split(",")[0]} · {bnDate(a.published)}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 sm:mt-auto sm:pt-5"><MoreLink href="/research/changes">সব পরিবর্তন</MoreLink></div>
        </section>
      </div>

      {/* Publish band. */}
      <section aria-labelledby="publish" className="story-reveal grid gap-8 rounded-[2rem] bg-signal-orange p-6 text-text-primary sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center">
        <div>
          <h2 id="publish" className="font-wiki text-3xl leading-tight font-bold sm:text-4xl">আপনার গবেষণা দেশের সামনে আনুন</h2>
          <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-text-primary/80">স্কুল প্রজেক্ট থেকে পিএইচডি থিসিস, বা স্বাধীন গবেষণা — প্রকাশ বিনামূল্যে, পড়া সবার জন্য খোলা।</p>
          <Link href="/research/submit" className="mt-6 inline-flex h-13 items-center gap-2 rounded-2xl bg-text-primary px-6 text-[15px] font-bold text-white transition-colors hover:bg-black">
            <Icon name="upload_file" className="text-[20px]" /> প্রকাশ শুরু করুন
          </Link>
        </div>
        <ol className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl bg-text-primary p-5 text-white">
              <span className="flex items-center justify-between">
                <Icon name={s.icon} className="text-[26px] text-signal-orange" />
                <span className="font-wiki text-2xl font-bold text-white/30">{bn(i + 1)}</span>
              </span>
              <span className="mt-3 block font-bold">{s.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-white/70">{s.body}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="sisters" className="space-y-5">
        <SectionHead id="sisters" eyebrow="একই পরিবারের" title="কাণ্ডারী-ল্যাবের সহযোগী প্রকল্প" />
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {SISTERS.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="group flex h-full items-center gap-3 rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 transition-colors hover:bg-white hover:ring-white">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-signal-orange text-text-primary"><Icon name={s.icon} className="text-[22px]" /></span>
                <span><span className="block font-bold text-white group-hover:text-text-primary">{s.title}</span><span className="block text-sm text-white/60 group-hover:text-text-secondary">{s.body}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <p className="max-w-[80ch] text-xs leading-relaxed text-white/45">
        মাহির শারিয়ার মাহিনের ওয়ার্কিং পেপার ছাড়া এখানকার নিবন্ধগুলো নমুনা — লেখক, প্রতিক্রিয়া আর সংখ্যা কাল্পনিক, শুধু গবেষণাকোষ কেমন দেখাবে তা বোঝাতে; প্রতিটিতে “নমুনা” লেখা আছে। আপনার প্রতিক্রিয়া, মন্তব্য আর শেয়ার আপাতত এই ব্রাউজারে আপনার অ্যাকাউন্টে রাখা হয়।
      </p>
    </div>
  );
}
