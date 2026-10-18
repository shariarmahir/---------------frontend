/*
 * THESIS: গবেষণাকোষের প্রধান পাতা laid out after coursera.org's home page
 * (Mahir, 2026-10-18): a hero that turns between three invitations, the
 * new and popular work as a row of cards under tabs, research tracks
 * (real-time Bangladesh problems, global, from the field …), the subject
 * fields, trending searches, two banners, "what brings you here", the
 * library in numbers with its top researchers, and the questions people
 * ask.
 * OWN-WORLD: the home page's: pitch-black ground; navy, ink and cobalt as
 * the only fields; gold for titles, figures and actions; Bangla sans type.
 * HONESTY: every number is counted from the library; sample articles are
 * labelled on their cards and pages, and the note at the foot says so.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { LiveStats, TopResearchers } from "@/components/research/home-live";
import { FieldGrid, Faq, HeroCarousel, PopularTabs, TrackGrid } from "@/components/research/home";
import { SectionHead } from "@/components/research/ui";
import { Icon } from "@/components/ui/icon";
import { btn } from "@/components/ui/section-kit";
import { libraryArticles } from "@/data/research/library";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "গবেষণাকোষ — বাংলাদেশের উন্মুক্ত গবেষণা প্ল্যাটফর্ম | কাণ্ডারী-ল্যাব",
  description: "বাংলাদেশের শিক্ষার্থী আর গবেষকদের থিসিস, গবেষণাপত্র আর উদ্ভাবন — দেশের রিয়েল-টাইম সমস্যা থেকে বৈশ্বিক গবেষণা। পড়ুন, ডাউনলোড করুন, প্রতিক্রিয়া দিন, আলোচনা করুন, নিজের কাজ আপলোড করুন।",
};

/** What brings a visitor here, each with its way in. */
const GOALS = [
  { icon: "menu_book", label: "গবেষণা পড়তে ও ডাউনলোড করতে", href: "/research/contents" },
  { icon: "upload_file", label: "নিজের গবেষণা আপলোড করতে", href: "/research/submit" },
  { icon: "crisis_alert", label: "দেশের সমস্যা নিয়ে কাজ খুঁজতে", href: "/research/topic/bd-live" },
  { icon: "groups", label: "গবেষণার দল আর ল্যাব খুঁজতে", href: "/media/classroom" },
];

export default function ResearchMainPage() {
  // The keywords most published articles share: the trending searches.
  const tally = new Map<string, number>();
  for (const a of libraryArticles) if (a.status === "published") for (const k of a.keywords) tally.set(k, (tally.get(k) ?? 0) + 1);
  const topics = [...tally.entries()].sort((x, y) => y[1] - x[1]).slice(0, 12).map(([k]) => k);

  return (
    <div className="space-y-20 sm:space-y-24">
      <HeroCarousel />

      <PopularTabs />

      <section id="categories" aria-labelledby="tracks-title" className="scroll-mt-header space-y-6 lg:scroll-mt-header-lg">
        <SectionHead id="tracks-title" title="গবেষণার ধারা" />
        <p className="-mt-3 max-w-3xl text-base leading-relaxed text-white/80">দেশের চলমান সমস্যা থেকে বিশ্বের প্রশ্ন — যেভাবে খুঁজতে চান, সেভাবে।</p>
        <TrackGrid />
      </section>

      <section aria-labelledby="fields-title" className="space-y-6">
        <SectionHead id="fields-title" title="বিষয় অনুযায়ী খুঁজুন" />
        <FieldGrid />
      </section>

      <section aria-labelledby="trending-searches" className="space-y-5">
        <SectionHead id="trending-searches" title="ট্রেন্ডিং খোঁজ" />
        <ul className="flex flex-wrap gap-2">
          {topics.map((k) => (
            <li key={k}>
              <Link
                href={`/research/search?q=${encodeURIComponent(k)}`}
                className="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold text-white ring-1 ring-white/20 transition-colors hover:bg-signal-orange hover:text-text-primary hover:ring-signal-orange"
              >
                <Icon name="trending_up" className="text-lg text-signal-orange" /> {k}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Two banners, as Coursera Plus and Coursera for Business sit side by side. */}
      <div className="grid gap-5 lg:grid-cols-2">
        <section aria-labelledby="publish-banner" className="story-reveal flex flex-col items-start gap-4 rounded-3xl bg-cobalt p-7 text-white ring-1 ring-white/12 ring-inset sm:p-9">
          <span className="grid size-14 place-items-center rounded-2xl bg-signal-orange text-text-primary">
            <Icon name="upload_file" className="text-3xl!" />
          </span>
          <h2 id="publish-banner" className="text-2xl leading-snug font-bold text-signal-orange sm:text-3xl">
            আপনার গবেষণা আপলোড করুন
          </h2>
          <p className="max-w-md text-base leading-relaxed text-white/80">থিসিস, গবেষণাপত্র, উদ্ভাবন বা প্রকল্প — লিখে বা পিডিএফসহ। প্রকাশ বিনামূল্যে, পড়া সবার জন্য খোলা।</p>
          <Link href="/research/submit" className={cn(btn.gold, "mt-auto")}>
            প্রকাশ শুরু করুন
          </Link>
        </section>
        <section aria-labelledby="lab-banner" className="story-reveal flex flex-col items-start gap-4 rounded-3xl bg-bdnavy-900 p-7 text-white ring-1 ring-white/12 ring-inset sm:p-9">
          <span className="grid size-14 place-items-center rounded-2xl bg-signal-orange text-text-primary">
            <Icon name="science" className="text-3xl!" />
          </span>
          <h2 id="lab-banner" className="text-2xl leading-snug font-bold text-signal-orange sm:text-3xl">
            দল মিলে গবেষণা শুরু করুন
          </h2>
          <p className="max-w-md text-base leading-relaxed text-white/80">শিক্ষিতদের মিডিয়ার ক্লাসরুম ও ল্যাবে সহগবেষক খুঁজুন, কাজ ভাগ করুন, তারপর একসাথে প্রকাশ করুন।</p>
          <Link href="/media/classroom" className={cn(btn.goldOutline, "mt-auto")}>
            ক্লাসরুম ও ল্যাব
          </Link>
        </section>
      </div>

      <section aria-labelledby="goals-title" className="space-y-6">
        <SectionHead id="goals-title" title="আজ কী খুঁজছেন?" />
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GOALS.map((g) => (
            <li key={g.href}>
              <Link
                href={g.href}
                className="group flex h-full items-center gap-3 rounded-2xl bg-text-primary p-5 font-bold text-white ring-1 ring-white/12 ring-inset transition-colors hover:bg-bdnavy-900 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
              >
                <Icon name={g.icon} className="text-3xl! text-signal-orange" />
                <span className="leading-snug group-hover:text-signal-orange">{g.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="now-title" className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
        <div className="space-y-6">
          <SectionHead id="now-title" title="গবেষণাকোষ এখন" />
          <p className="max-w-xl text-base leading-relaxed text-white/80">লাইব্রেরির প্রতিটি সংখ্যা সরাসরি গোনা — আপনার নিজের প্রতিক্রিয়া, মন্তব্য আর শেয়ারসহ।</p>
          <LiveStats />
        </div>
        <TopResearchers n={5} />
      </section>

      <section aria-labelledby="faq-title" className="space-y-6">
        <SectionHead id="faq-title" title="প্রায়ই জিজ্ঞাসিত প্রশ্ন" />
        <Faq />
      </section>

      <p className="max-w-[80ch] text-xs leading-relaxed text-white/65">
        মাহির শারিয়ার মাহিনের ওয়ার্কিং পেপার ছাড়া এখানকার নিবন্ধগুলো নমুনা — লেখক, প্রতিক্রিয়া আর সংখ্যা কাল্পনিক, শুধু গবেষণাকোষ কেমন দেখাবে তা বোঝাতে; প্রতিটিতে “নমুনা” লেখা আছে। আপনার প্রতিক্রিয়া, মন্তব্য আর শেয়ার আপাতত এই ব্রাউজারে আপনার অ্যাকাউন্টে রাখা হয়।
      </p>
    </div>
  );
}
