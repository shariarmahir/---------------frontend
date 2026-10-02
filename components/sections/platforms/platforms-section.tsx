import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpenText, GraduationCap, type LucideIcon, MessagesSquare, Share2, Sparkles, CalendarClock, BellRing, FlaskConical } from "lucide-react";
import { PixelMark, SignalSeam, btn, tileLift } from "@/components/ui/section-kit";
import { classroomReel, mediaFilm, mediaRooms, researchReel, type Scene } from "@/data/platforms";
import { cn } from "@/lib/utils";
import { RoomGlyph } from "./room-glyph";
import { Film, Reel } from "./story-player";

/*
 * The platforms band, in the place the rural pharmacy band held (the
 * pharmacy itself stays on the products track above). Bottle green, the
 * page's one drenched green field: the শিক্ষিতদের মিডিয়া film on ink,
 * its rooms as white tiles, then গবেষণাকোষ (ink) and ক্লাসরুম (gold).
 * Everything here links into those platforms; nothing imports from them,
 * so /media stays self-contained.
 */

const bnBtn = "font-bengali text-sm normal-case sm:text-[15px]";

export function PlatformsSection() {
  return (
    <section id="platforms" className="section-band-tinted relative isolate overflow-hidden bg-bd-green text-white">
      <SignalSeam className="top-0" />
      <div className="mx-auto max-w-7xl px-gutter-x">
        {/* The introduction. */}
        <div className="mb-10 grid gap-6 lg:mb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-12">
          <div className="story-reveal flex flex-col gap-3">
            <PixelMark tone="dark" />
            <p className="inline-flex w-fit items-center gap-2 rounded-full bg-text-primary px-3.5 py-1.5 font-bengali text-sm font-bold text-signal-orange">
              <Sparkles className="size-4" aria-hidden /> কাণ্ডারী-ল্যাবের নিজের প্ল্যাটফর্ম
            </p>
            <h2 className="font-bengali text-5xl leading-[1.2] font-bold text-signal-orange sm:text-6xl lg:text-7xl">শিক্ষিতদের মিডিয়া</h2>
            <p className="font-grotesk text-sm font-bold tracking-wider text-white/75 uppercase">The skill-first social platform</p>
          </div>
          <div className="story-reveal flex flex-col gap-5">
            <p className="font-bengali text-lg leading-relaxed text-white/90 sm:text-xl">
              ডিগ্রির কাগজ নয়, কাজের প্রমাণ। দক্ষতা পোস্ট করুন, নিজেকে রেটিং দিন, কমিউনিটি যাচাই করুক — তারপর কাজ, ক্রেতা আর দল আপনাকে খুঁজে নেবে।
            </p>
            <p className="font-sans text-sm leading-relaxed text-white/70">
              Show your work, rate yourself honestly and let the community verify it, then get hired, sell and team up. Members only: one account per person.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/signup?next=/media" className={cn(btn.gold, bnBtn)}>
                ফ্রি অ্যাকাউন্ট খুলুন <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link href="/media" className={cn(btn.ghost, bnBtn)}>
                ভেতরে ঘুরে দেখুন
              </Link>
            </div>
          </div>
        </div>

        <Film scenes={mediaFilm} label="শিক্ষিতদের মিডিয়া: পরিচিতি ভিডিও" />

        {/* The other rooms inside. */}
        <div className="mt-14 sm:mt-16">
          <SubHead title="ভেতরে আরও যা আছে" en="More rooms inside" />
          {/* A swipeable row on phones, a grid from tablets up. */}
          <ul className="-mx-gutter-x flex snap-x snap-mandatory gap-3 overflow-x-auto px-gutter-x pt-1 pb-3 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
            {mediaRooms.map((r) => (
              <li key={r.href} className="story-reveal w-[80%] shrink-0 snap-center sm:w-auto">
                <Link href={r.href} className={cn("group flex h-full flex-col overflow-hidden rounded-3xl bg-white text-text-primary focus-visible:ring-3 focus-visible:ring-signal-orange focus-visible:outline-none", tileLift)}>
                  <span className="relative m-2 mb-0 block aspect-16/10 overflow-hidden rounded-2xl bg-black">
                    <Image
                      src={r.image.src}
                      alt={r.image.alt}
                      fill
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                      className="object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] motion-reduce:transition-none"
                    />
                  </span>
                  <span className="flex flex-1 flex-col gap-3 p-5">
                    <span className="flex items-center gap-3">
                      <RoomGlyph icon={r.icon} />
                      <span className="min-w-0">
                        <span className="block font-bengali text-lg leading-snug font-bold">{r.name}</span>
                        <span className="block font-grotesk text-[11px] font-bold tracking-wider text-text-secondary uppercase">{r.nameEn}</span>
                      </span>
                    </span>
                    <span className="font-bengali text-sm leading-relaxed text-text-secondary">{r.line}</span>
                    <span className="mt-auto inline-flex items-center gap-1.5 font-bengali text-sm font-bold text-bd-green">
                      দেখুন <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* The two sister platforms. */}
        <div className="mt-14 sm:mt-16">
          <SubHead title="সাথে আরও দুই প্ল্যাটফর্ম" en="Research & Classroom" />
          <div className="grid gap-5 lg:grid-cols-2">
            <PromoCard
              tone="ink"
              icon={BookOpenText}
              eyebrow="গবেষণাকোষ"
              eyebrowEn="Kandari Researchpedia"
              title={<>দেশের প্রশ্ন, <span className="text-signal-orange">দেশের গবেষণা।</span></>}
              body="থিসিস, গবেষণাপত্র আর উদ্ভাবন — পড়ুন, প্রতিক্রিয়া দিন, আলোচনা করুন। নিজের কাজ প্রকাশ করুন, তারপর এক চাপে ফিড আর সোশ্যাল মিডিয়ায় ছড়িয়ে দিন।"
              features={[
                { icon: Sparkles, text: "প্রতিক্রিয়া ও পয়েন্ট" },
                { icon: MessagesSquare, text: "আলোচনা ও উদ্ধৃতি" },
                { icon: Share2, text: "ফিডে শেয়ার" },
              ]}
              scenes={researchReel}
              actions={
                <>
                  <Link href="/research" className={cn(btn.gold, bnBtn)}>
                    গবেষণাকোষে যান <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <Link href="/research/submit" className={cn(btn.ghost, bnBtn)}>
                    গবেষণা প্রকাশ করুন
                  </Link>
                </>
              }
            />
            <PromoCard
              tone="gold"
              icon={GraduationCap}
              eyebrow="কাণ্ডারী-ল্যাব ক্লাসরুম"
              eyebrowEn="Classroom"
              title={<>পুরো ক্লাস, <span className="text-bd-green">এক জায়গায়।</span></>}
              body="সিআর বা ক্যাপ্টেন ক্লাস বানান, সহপাঠীরা কোড দিয়ে যোগ দেন — তারপর রুটিন, সিলেবাস, নোটিশ, পরীক্ষার কাউন্টডাউন আর ক্লাস চ্যালেঞ্জ সবার জন্য খোলা।"
              features={[
                { icon: CalendarClock, text: "রুটিন ও কাউন্টডাউন" },
                { icon: BellRing, text: "নোটিশ বোর্ড" },
                { icon: FlaskConical, text: "ল্যাব রুম" },
              ]}
              scenes={classroomReel}
              actions={
                <Link href="/media/classroom" className={cn(btn.ink, bnBtn)}>
                  ক্লাসরুমে যোগ দিন <ArrowRight className="size-4 text-signal-orange" aria-hidden />
                </Link>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SubHead({ title, en }: { title: string; en: string }) {
  return (
    <div className="story-reveal mb-5 flex flex-wrap items-end justify-between gap-2 border-b border-white/15 pb-3">
      <h3 className="font-bengali text-2xl font-bold text-white sm:text-3xl">{title}</h3>
      <span className="font-grotesk text-xs font-bold tracking-wider text-white/60 uppercase">{en}</span>
    </div>
  );
}

const CARD = {
  ink: { card: "bg-text-primary text-white ring-1 ring-white/12", sub: "text-white/75", pill: "bg-white/8 ring-1 ring-white/12", eyebrow: "bg-signal-orange text-text-primary" },
  gold: { card: "bg-signal-orange text-text-primary", sub: "text-text-primary/80", pill: "bg-text-primary/10", eyebrow: "bg-text-primary text-signal-orange" },
};

function PromoCard(p: {
  tone: keyof typeof CARD;
  icon: LucideIcon;
  eyebrow: string;
  eyebrowEn: string;
  title: ReactNode;
  body: string;
  features: { icon: LucideIcon; text: string }[];
  scenes: Scene[];
  actions: ReactNode;
}) {
  const t = CARD[p.tone];
  const Icon = p.icon;
  return (
    <article className={cn("story-reveal flex flex-col rounded-4xl p-3 sm:p-4", t.card)}>
      <Reel scenes={p.scenes} label={`${p.eyebrow}: পরিচিতি ভিডিও`} tone={p.tone === "ink" ? "dark" : "light"} />
      <div className="flex flex-1 flex-col gap-4 px-2 pt-6 pb-3 sm:px-4 sm:pb-4">
        <p className="flex flex-wrap items-center gap-2">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bengali text-sm font-bold", t.eyebrow)}>
            <Icon className="size-4" aria-hidden /> {p.eyebrow}
          </span>
          <span className={cn("font-grotesk text-[11px] font-bold tracking-wider uppercase", t.sub)}>{p.eyebrowEn}</span>
        </p>
        <h3 className="font-bengali text-3xl leading-tight font-bold sm:text-4xl">{p.title}</h3>
        <p className={cn("font-bengali text-[15px] leading-relaxed", t.sub)}>{p.body}</p>
        <ul className="flex flex-wrap gap-2">
          {p.features.map((f) => (
            <li key={f.text} className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-bengali text-sm font-bold", t.pill)}>
              <f.icon className="size-4" aria-hidden /> {f.text}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-3 pt-2">{p.actions}</div>
      </div>
    </article>
  );
}
