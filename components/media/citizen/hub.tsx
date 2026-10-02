"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, Flag, MapPin, Megaphone, PhoneCall, Share2, ShieldCheck, Siren, TriangleAlert, UserRoundX, Users } from "lucide-react";
import { toast } from "sonner";
import { PixelMark, SignalSeam } from "@/components/ui/section-kit";
import { LIFT, glowStyle } from "@/components/ui/surfaces";
import { CONFIRM_THRESHOLD, civicKindBn, civicReports, riskyAreas } from "@/data/media/civic";
import { crimePosts } from "@/data/media/crime";
import type { CivicKind, CivicReport } from "@/data/media/types";
import { getPerson } from "@/data/media/users";
import { useAuth } from "@/lib/auth/client";
import { CRIME_KINDS, FLAG_THRESHOLD, WITNESS_THRESHOLD, crimeStatus, type CrimeKind, type CrimePost } from "@/lib/media/crime";
import { toggleKey, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { CivicCard, ReportButton } from "../community/civic";
import { mediaButton } from "../ui/button-styles";
import { choiceClass, selectClass } from "../ui/field-styles";
import { MediaFrame } from "../ui/media-frame";
import { Ago, Num } from "../ui/numerals";
import { CrimeComposer } from "./composer";

/*
 * নাগরিক বার্তা — one feed for everything a citizen reports: crimes seen in
 * public (photo/video journalism, confirmed by witnesses) and area problems
 * or calls for help (confirmed by neighbours, solved together).
 */

type CivicTopic = Exclude<CivicKind, "crime" | "extortion" | "harassment">;
type Topic = CrimeKind | CivicTopic;

/** Civic kinds that are crimes file under the crime topic of the same name. */
const CIVIC_TOPIC: Record<CivicKind, Topic> = {
  sanitation: "sanitation",
  road: "road",
  crime: "theft",
  extortion: "extortion",
  harassment: "harassment",
  utility: "utility",
  environment: "environment",
  help: "help",
};

const TOPICS: { key: Topic; bn: string }[] = [
  ...(Object.keys(CRIME_KINDS) as CrimeKind[]).map((key) => ({ key, bn: CRIME_KINDS[key].bn })),
  ...(["sanitation", "road", "utility", "environment", "help"] as CivicTopic[]).map((key) => ({ key, bn: civicKindBn[key] })),
];

const HOTLINES = [
  { tel: "999", bn: "জরুরি সেবা", card: "bg-national-crimson text-white", glow: "var(--color-national-crimson)" },
  { tel: "109", bn: "নারী ও শিশু নির্যাতন", card: "bg-bd-green text-white", glow: "var(--color-bd-green)" },
  { tel: "16121", bn: "ভোক্তা অধিকার", card: "bg-signal-orange text-text-primary", glow: "var(--color-signal-orange)" },
  { tel: "106", bn: "দুদক", card: "bg-bdorange-600 text-text-primary", glow: "var(--color-bdorange-600)" },
  { tel: "333", bn: "সরকারি তথ্য ও সেবা", card: "bg-text-primary text-white ring-1 ring-white/15", glow: "var(--color-bdgreen-500)" },
  { tel: "1090", bn: "দুর্যোগের আগাম বার্তা", card: "bg-text-primary text-white ring-1 ring-white/15", glow: "var(--color-bdgreen-500)" },
];

const RULES = [
  { Icon: Eye, text: "যা নিজে দেখেছেন, শুধু সেটুকু — অনুমান বা গুজব নয়।" },
  { Icon: UserRoundX, text: "কারো নাম, ফোন, বাসার ঠিকানা নয় — ঘটনা আর জায়গা দেখান।" },
  { Icon: EyeOff, text: "ভুক্তভোগী ও শিশুর মুখ ঢেকে দিন; ছবিতে চাপলেই ঢাকা যায়।" },
  { Icon: Siren, text: "কেউ বিপদে থাকলে আগে ৯৯৯-এ ফোন, তারপর পোস্ট।" },
];

type Item =
  | { type: "crime"; id: string; at: string; topic: Topic; district: string; post: CrimePost }
  | { type: "civic"; id: string; at: string; topic: Topic; district: string; report: CivicReport; live?: boolean };

export function CitizenHub() {
  const { account } = useAuth();
  const myCrimes = useMediaState((s) => s.crimePosts);
  const myReports = useMediaState((s) => s.myReports);
  const witnessed = useMediaState((s) => s.crimeWitness);
  const flagged = useMediaState((s) => s.crimeFlags);
  const confirmedByMe = useMediaState((s) => s.confirmedReports);
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [district, setDistrict] = useState("");
  const [onlyConfirmed, setOnlyConfirmed] = useState(false);
  const [composing, setComposing] = useState(false);

  const items = useMemo<Item[]>(
    () =>
      [
        ...[...myCrimes, ...crimePosts].map((post) => ({ type: "crime" as const, id: post.id, at: post.at, topic: post.kind, district: post.district, post })),
        ...myReports.map((report) => ({ type: "civic" as const, id: report.id, at: report.at, topic: CIVIC_TOPIC[report.kind], district: report.district, report, live: true })),
        ...civicReports.map((report) => ({ type: "civic" as const, id: report.id, at: report.at, topic: CIVIC_TOPIC[report.kind], district: report.district, report })),
      ].sort((a, b) => b.at.localeCompare(a.at)),
    [myCrimes, myReports],
  );

  const crimeCount = (p: CrimePost) => ({ w: p.witnesses + (witnessed[p.id] ? 1 : 0), f: p.flags + (flagged[p.id] ? 1 : 0) });
  const isConfirmed = (it: Item) =>
    it.type === "crime"
      ? crimeStatus(crimeCount(it.post).w, crimeCount(it.post).f) === "witnessed"
      : it.report.status !== "reported" || it.report.confirmations + (confirmedByMe[it.id] ? 1 : 0) >= CONFIRM_THRESHOLD;

  const shown = items.filter((it) => (topic === "all" || it.topic === topic) && (!district || it.district === district) && (!onlyConfirmed || isConfirmed(it)));
  const districts = [...new Set(items.map((it) => it.district))].sort((a, b) => a.localeCompare(b, "bn"));
  const areas = riskyAreas([...myReports, ...civicReports]).slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="live-in overflow-hidden rounded-3xl bg-text-primary ring-1 ring-white/12">
        <div className="grid gap-8 p-5 sm:p-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:items-center">
          <div className="space-y-5">
            <PixelMark tone="dark" />
            <p className="inline-flex items-center gap-2 rounded-full bg-national-crimson px-3 py-1 text-xs font-bold text-white">
              <span className="relative flex size-2"><span className="absolute inset-0 animate-ping rounded-full bg-white/70 motion-reduce:hidden" /><span className="relative size-2 rounded-full bg-white" /></span>
              নাগরিক বার্তা · নাগরিক সাংবাদিকতা
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-5xl sm:leading-[1.1]">
              দেখেছেন? <span className="text-signal-orange">চুপ থাকবেন না।</span>
            </h1>
            <p className="max-w-[48ch] text-[15px] leading-relaxed text-white/80">
              চাঁদাবাজি, ভেজাল পণ্য, ছিনতাই থেকে ময়লা, ভাঙা রাস্তা, বিদ্যুৎ-পানির সমস্যা — ছবি-ভিডিওসহ জানান। আশপাশের মানুষ নিশ্চিত করেন, সবাই মিলে সমাধান খোঁজেন, আর আপনার নাম গোপন থাকে।
            </p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => setComposing(true)} disabled={!account} className={mediaButton({ variant: "primary", size: "lg" })}>
                <Megaphone aria-hidden /> অপরাধ জানান
              </button>
              <ReportButton variant="outline" size="lg" label="সমস্যা বা সাহায্য" />
            </div>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-2" aria-label="জরুরি হটলাইন">
            {HOTLINES.map((h) => (
              <li key={h.tel}>
                <a href={`tel:${h.tel}`} style={glowStyle(h.glow)} className={cn("flex h-full flex-col justify-between gap-3 rounded-2xl p-3.5", h.card, LIFT)}>
                  <PhoneCall className="size-4.5 opacity-85" aria-hidden />
                  <span>
                    <span className="block text-2xl font-bold tracking-tight"><Num value={h.tel} /></span>
                    <span className="text-xs font-semibold opacity-85">{h.bn}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <SignalSeam className="top-0" />
          <dl className="grid grid-cols-2 divide-white/10 sm:grid-cols-4 sm:divide-x">
            {[
              { label: "বার্তা", value: items.length },
              { label: "নিশ্চিত", value: items.filter(isConfirmed).length },
              { label: "সমাধান হয়েছে", value: items.filter((it) => it.type === "civic" && it.report.status === "solved").length },
              { label: "জেলা", value: districts.length },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-0.5 py-4 text-center">
                <dt className="text-xs text-white/65">{s.label}</dt>
                <dd className="text-2xl font-bold text-signal-orange"><Num value={s.value} /></dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="space-y-3">
        <div className="-mx-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap">
            <li><button type="button" onClick={() => setTopic("all")} className={choiceClass(topic === "all")}>সব</button></li>
            {TOPICS.map((t) => (
              <li key={t.key}><button type="button" onClick={() => setTopic(t.key)} className={choiceClass(topic === t.key)}>{t.bn}</button></li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
            জেলা
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className={cn(selectClass, "h-10 w-auto")}>
              <option value="">সব জেলা</option>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>
          </label>
          <label className="ml-auto flex items-center gap-2 text-sm font-semibold text-white/80">
            <input type="checkbox" checked={onlyConfirmed} onChange={(e) => setOnlyConfirmed(e.target.checked)} className="size-4 accent-signal-orange" /> শুধু নিশ্চিত
          </label>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-4">
          {shown.map((it) =>
            it.type === "crime" ? (
              <CrimeCard key={it.id} post={it.post} witnesses={crimeCount(it.post).w} flags={crimeCount(it.post).f} saw={Boolean(witnessed[it.id])} flagged={Boolean(flagged[it.id])} />
            ) : (
              <CivicCard key={it.id} report={it.report} live={it.live} />
            ),
          )}
          {shown.length === 0 && <p className="rounded-2xl bg-text-primary p-8 text-center text-sm text-white/70 ring-1 ring-white/12">এই ফিল্টারে কোনো বার্তা নেই।</p>}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-22">
          {areas.length > 0 && (
            <section className="story-reveal rounded-2xl bg-text-primary p-5 ring-1 ring-white/12">
              <h2 className="mb-3 flex items-center gap-2 font-bold text-signal-orange"><TriangleAlert className="size-4.5 text-crimson-bright" aria-hidden /> এলাকার সতর্কতা</h2>
              <ul className="space-y-3">
                {areas.map((a) => (
                  <li key={`${a.area}-${a.district}`} className="flex items-start justify-between gap-2">
                    <button type="button" onClick={() => setDistrict(a.district)} className="min-w-0 text-left">
                      <span className="block text-sm font-semibold text-white hover:text-signal-orange">{a.area}, {a.district}</span>
                      <span className="block truncate text-xs text-white/65">{[...a.kinds].map((k) => civicKindBn[k]).join(" · ")}</span>
                    </button>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold", a.high > 0 ? "bg-national-crimson text-white" : "bg-signal-orange text-text-primary")}>
                      {a.high > 0 ? "ঝুঁকিপূর্ণ" : "সতর্ক থাকুন"} · <Num value={a.total} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section id="rules" className="story-reveal scroll-mt-24 space-y-3 rounded-2xl bg-bd-green p-5 text-white">
            <h2 className="flex items-center gap-2 text-lg font-bold"><ShieldCheck className="size-5 text-signal-orange" aria-hidden /> নিরাপদে পোস্টের নিয়ম</h2>
            <ul className="space-y-3">
              {RULES.map(({ Icon, text }) => (
                <li key={text} className="flex gap-3 text-sm leading-relaxed">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-signal-orange text-text-primary"><Icon className="size-4" aria-hidden /></span>
                  {text}
                </li>
              ))}
            </ul>
            <p className="border-t border-white/15 pt-3 text-xs text-white/75">
              নাম গোপন রাখলেও প্রতিটি বার্তার পেছনে একজন পরিচয়-যাচাইকৃত মানুষ থাকেন। মিথ্যা অভিযোগ বা কারো সম্মানহানি এখানে চলে না — <Num value={FLAG_THRESHOLD} /> জন ভুল বলে জানালে পোস্ট পর্যালোচনায় যায়।
            </p>
          </section>
        </aside>
      </div>

      {account && <CrimeComposer open={composing} onOpenChange={setComposing} me={account.id} />}
    </div>
  );
}

function CrimeCard({ post: p, witnesses, flags, saw, flagged }: { post: CrimePost; witnesses: number; flags: number; saw: boolean; flagged: boolean }) {
  const [reveal, setReveal] = useState(false);
  const status = crimeStatus(witnesses, flags);
  const meta = CRIME_KINDS[p.kind];
  const author = p.by ? getPerson(p.by)?.nameBn : undefined;

  if (status === "review" && !reveal) {
    return (
      <article className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-text-primary p-5 text-sm text-white/75 ring-1 ring-white/12">
        <span className="flex items-center gap-2"><Flag className="size-4 text-crimson-bright" aria-hidden /> পর্যালোচনায় — কয়েকজন পোস্টটি ভুল বা ক্ষতিকর বলে জানিয়েছেন।</span>
        <button type="button" onClick={() => setReveal(true)} className={mediaButton({ variant: "ghost", size: "sm" })}>তবুও দেখুন</button>
      </article>
    );
  }

  async function share() {
    const url = `${location.origin}/media/civic#${p.id}`;
    try {
      if (navigator.share) await navigator.share({ title: p.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("লিংক কপি হলো");
      }
    } catch {
      // The reader closed the share sheet.
    }
  }

  return (
    <article id={p.id} className="story-reveal scroll-mt-24 overflow-hidden rounded-2xl bg-text-primary ring-1 ring-white/12 transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_44px_-26px_var(--color-national-crimson)]">
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-signal-orange px-2.5 py-0.5 text-text-primary">{meta.bn}</span>
          {status === "witnessed" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-bd-green px-2.5 py-0.5 text-white"><ShieldCheck className="size-3.5" aria-hidden /> প্রত্যক্ষদর্শী নিশ্চিত</span>
          ) : (
            <span className="rounded-full px-2.5 py-0.5 text-white/80 ring-1 ring-white/20">দাবি · যাচাই চলছে <Num value={witnesses} />/<Num value={WITNESS_THRESHOLD} /></span>
          )}
          {p.reportedTo && <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-white/85"><Num value={p.reportedTo} />-এ জানানো হয়েছে</span>}
        </div>
        <h2 className="text-lg leading-snug font-bold text-balance text-white">{p.title}</h2>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/60">
          <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden /> {p.area}, {p.district}</span>
          <Ago iso={p.at} />
          <span>{author ?? "নাম গোপন · যাচাইকৃত সদস্য"}</span>
        </p>
        {p.body && <p className="leading-relaxed whitespace-pre-line text-white/90">{p.body}</p>}
      </div>

      {p.media.length > 0 && (
        <div className="relative px-5">
          <div className={cn("grid gap-2", p.media.length > 1 && "grid-cols-2", p.sensitive && !reveal && "pointer-events-none blur-2xl")}>
            {p.media.map((m, i) =>
              m.kind === "video" && m.src ? (
                <video key={i} src={m.src} controls playsInline preload="metadata" className="aspect-video w-full rounded-xl bg-black" aria-label={m.label} />
              ) : (
                <MediaFrame key={i} slot={{ kind: m.kind, label: m.label, ratio: p.media.length > 1 ? "1/1" : "16/9", src: m.src }} sizes="(min-width: 1024px) 560px, 100vw" />
              ),
            )}
          </div>
          {p.sensitive && !reveal && (
            <button type="button" onClick={() => setReveal(true)} className="absolute inset-0 m-auto flex h-fit w-fit items-center gap-2 rounded-xl bg-black/80 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/20">
              <EyeOff className="size-4" aria-hidden /> সংবেদনশীল — দেখুন
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 px-5 py-3">
        <button
          type="button"
          onClick={() => {
            toggleKey("crimeWitness", p.id);
            if (!saw) toast.success("আপনার সাক্ষ্য যোগ হলো", { description: "যাচাইকৃত মানুষের সাক্ষ্যই পোস্টকে প্রমাণ করে।" });
          }}
          aria-pressed={saw}
          className={mediaButton({ variant: saw ? "green" : "quiet", size: "sm" })}
        >
          <Users aria-hidden /> আমিও দেখেছি · <Num value={witnesses} />
        </button>
        <a href={`tel:${meta.line.tel}`} className={mediaButton({ variant: "ghost", size: "sm" })}>
          <PhoneCall aria-hidden /> <Num value={meta.line.tel} /> · {meta.line.label}
        </a>
        <button type="button" onClick={share} className={mediaButton({ variant: "ghost", size: "icon-sm", className: "ml-auto" })} aria-label="শেয়ার করুন"><Share2 aria-hidden /></button>
        <button
          type="button"
          onClick={() => {
            toggleKey("crimeFlags", p.id);
            if (!flagged) toast("জানানোর জন্য ধন্যবাদ", { description: "আরও কয়েকজন জানালে পোস্টটি পর্যালোচনায় যাবে।" });
          }}
          aria-pressed={flagged}
          className={mediaButton({ variant: flagged ? "danger" : "ghost", size: "icon-sm" })}
          aria-label={flagged ? "ভুল তথ্যের রিপোর্ট ফেরত নিন" : "ভুল বা ক্ষতিকর তথ্য বলে জানান"}
          title="ভুল বা ক্ষতিকর তথ্য"
        >
          <Flag aria-hidden />
        </button>
      </div>
    </article>
  );
}
