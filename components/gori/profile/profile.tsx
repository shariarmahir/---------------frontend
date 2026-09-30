"use client";

import { toast } from "sonner";
import { emptyProgress } from "@/lib/gori/progression";
import { STRATEGIES } from "@/lib/gori/sim/score";
import { cn } from "@/lib/utils";
import { useT } from "../provider";
import { useGori, useHydrated, type Settings } from "../store";
import { PixelMark } from "@/components/ui/section-kit";

const AVATARS = ["bg-bd-green", "bg-sky-400", "bg-bdorange-600", "bg-violet-400", "bg-signal-orange", "bg-teal-500"];

export function Profile() {
  const hydrated = useHydrated();
  const s = useGori((x) => x.settings);
  const setSettings = useGori((x) => x.setSettings);
  const setProgress = useGori((x) => x.setProgress);
  const { t } = useT();
  if (!hydrated) return null;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings({ [k]: v } as Partial<Settings>);
  const initials = (s.name.trim() || "খে").slice(0, 2);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <PixelMark tone="dark" className="mb-2" />
      <h1 className="font-bengali text-3xl font-bold text-signal-orange">{t("navProfile")}</h1>
      <p className="mt-2 font-bengali text-sm text-white/80">সব সেটিংস এই ব্রাউজারে থাকে। কোনো ব্যক্তিগত তথ্য (এনআইডি, ফোন, ঠিকানা) চাওয়া হয় না।</p>

      <div className="mt-6 space-y-5 text-white">
        <Card title="পরিচয়">
          <div className="flex flex-wrap items-center gap-4">
            <span className={cn("flex size-14 items-center justify-center rounded-full font-bengali text-lg font-bold text-white", AVATARS[s.avatar] ?? AVATARS[0])} aria-hidden>{initials}</span>
            <label className="min-w-0 flex-1 font-bengali text-sm font-semibold">
              প্রদর্শনের নাম
              <input value={s.name} onChange={(e) => set("name", e.target.value.slice(0, 30))} maxLength={30} className="mt-1 block h-11 w-full rounded-xl border border-white/15 bg-black ring-1 ring-white/12 px-3" />
            </label>
          </div>
          <fieldset className="mt-3">
            <legend className="font-bengali text-sm font-semibold">অবতারের রং</legend>
            <div className="mt-1 flex gap-2">
              {AVATARS.map((c, i) => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" name="avatar" className="peer sr-only" checked={s.avatar === i} onChange={() => set("avatar", i)} />
                  <span className={cn("block size-9 rounded-full ring-offset-2 peer-checked:ring-3 peer-checked:ring-signal-orange peer-focus-visible:ring-3 peer-focus-visible:ring-white/25", c)} />
                  <span className="sr-only">রং {i + 1}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </Card>

        <Card title="ভাষা ও পড়া">
          <Grid>
            <Choice label="ইন্টারফেসের ভাষা" value={s.language} onChange={(v) => set("language", v as Settings["language"])} options={[["bn", "বাংলা"], ["en", "English (interface only)"]]} hint="English শুধু মূল মেনু ও বোতামে; দৃশ্যকল্পের লেখা বাংলায়।" />
            <Choice label="লেখার আকার" value={s.textSize} onChange={(v) => set("textSize", v as Settings["textSize"])} options={[["md", "স্বাভাবিক"], ["lg", "বড়"], ["xl", "আরও বড়"]]} />
            <Choice label="বিস্তারিতের মাত্রা" value={s.detail} onChange={(v) => set("detail", v as Settings["detail"])} options={[["simple", "সহজ — সহজ ভাষা, কম সংখ্যা"], ["advanced", "উন্নত — সহগ, পরিসর, অবদান"]]} />
            <Choice label="ঘনত্ব" value={s.density} onChange={(v) => set("density", v as Settings["density"])} options={[["comfortable", "খোলামেলা"], ["compact", "ঘন"]]} />
          </Grid>
        </Card>

        <Card title="প্রবেশযোগ্যতা">
          <Grid>
            <Choice label="কনট্রাস্ট" value={s.contrast} onChange={(v) => set("contrast", v as Settings["contrast"])} options={[["normal", "স্বাভাবিক"], ["high", "উচ্চ কনট্রাস্ট"]]} />
            <Choice label="অ্যানিমেশন" value={s.motion} onChange={(v) => set("motion", v as Settings["motion"])} options={[["system", "ডিভাইসের সেটিং মেনে"], ["reduce", "কমিয়ে দিন"]]} />
          </Grid>
          <p className="mt-2 font-bengali text-xs text-white/65">অবস্থা সবসময় রং ছাড়াও চিহ্ন বা লেখায় দেখানো হয় (▲▼, ✓, তালা)। পুরো খেলা কীবোর্ডে চালানো যায়; মানচিত্রের সম্পর্ক ফর্ম দিয়েও প্রস্তাব করা যায়।</p>
        </Card>

        <Card title="খেলার ধরন">
          <Grid>
            <Choice label="শেখার ধরন" value={s.learning} onChange={(v) => set("learning", v as Settings["learning"])} options={[["guided", "নির্দেশিত — ধাপে ধাপে ইঙ্গিত"], ["free", "স্বাধীন — ইঙ্গিত শুধু অভিযানে"]]} />
            <Choice label="কৌশল-প্রোফাইল" value={s.strategy} onChange={(v) => set("strategy", v as Settings["strategy"])} options={STRATEGIES.map((x) => [x.id, x.bn])} hint="খেলার পছন্দ — রাজনৈতিক পরিচয় নয়।" />
            <Choice label="স্বয়ংক্রিয় টার্নের গতি" value={s.speed} onChange={(v) => set("speed", v as Settings["speed"])} options={[["slow", "ধীর"], ["normal", "মাঝারি"], ["fast", "দ্রুত"]]} />
            <Choice label="বিজ্ঞপ্তি" value={s.notifications ? "on" : "off"} onChange={(v) => set("notifications", v === "on")} options={[["on", "চালু — XP ও পদকের বার্তা"], ["off", "বন্ধ"]]} />
          </Grid>
          <label className="mt-4 flex items-start gap-2 font-bengali text-sm">
            <input type="checkbox" className="mt-1 accent-signal-orange" checked={s.openAll} onChange={(e) => set("openAll", e.target.checked)} />
            <span>
              শিক্ষক/উন্নত মোড — সব বৈশিষ্ট্য খুলে দিন
              <span className="block text-xs text-white/65">শ্রেণিকক্ষ বা পর্যালোচনার জন্য। অগ্রগতি বা XP বদলায় না।</span>
            </span>
          </label>
        </Card>

        <Card title="তথ্য">
          <p className="font-bengali text-sm text-white/80">অগ্রগতি, সংরক্ষিত খেলা আর দৃশ্যকল্প এই ব্রাউজারের localStorage-এ। অন্য ডিভাইসে যাবে না (অ্যাকাউন্ট যুক্ত হলে যাবে)।</p>
          <button
            type="button"
            onClick={() => {
              if (!window.confirm("সব অগ্রগতি (XP, স্কোর, পদক) মুছে যাবে। সংরক্ষিত খেলা আর দৃশ্যকল্প থাকবে। নিশ্চিত?")) return;
              setProgress(() => emptyProgress);
              toast.success("অগ্রগতি মুছে নতুন করে শুরু");
            }}
            className="mt-3 inline-flex h-10 items-center rounded-xl bg-national-crimson px-4 font-bengali text-sm font-bold text-white"
          >
            অগ্রগতি মুছুন
          </button>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-text-primary ring-1 ring-white/12 p-5">
      <h2 className="mb-3 font-bengali text-lg font-bold text-signal-orange">{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Choice({ label, value, onChange, options, hint }: { label: string; value: string; onChange: (v: string) => void; options: [string, string][]; hint?: string }) {
  return (
    <label className="font-bengali text-sm font-semibold">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 block h-11 w-full rounded-xl border border-white/15 bg-black ring-1 ring-white/12 px-3 font-normal">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {hint && <span className="mt-1 block text-xs font-normal text-white/65">{hint}</span>}
    </label>
  );
}
