"use client";

import { Clock, EyeOff, Heart, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { updateMedia, useHydrated, useMediaState, type Privacy } from "@/lib/media/store";
import { choiceClass } from "../ui/field-styles";
import { Num } from "../ui/numerals";
import { useMinutesToday } from "../wellbeing/usage";

function set<K extends keyof Privacy>(key: K, value: Privacy[K]) {
  updateMedia((s) => ({ ...s, privacy: { ...s.privacy, [key]: value } }));
}

function Row({ icon, title, body, children }: { icon: React.ReactNode; title: string; body: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 py-4">
      <div className="flex max-w-lg gap-3">
        <span className="mt-0.5 text-bd-green">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{body}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function PrivacySettings() {
  const hydrated = useHydrated();
  const p = useMediaState((s) => s.privacy);
  const minutes = useMinutesToday();
  if (!hydrated) return <Skeleton className="h-96 rounded-2xl" />;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-card-border bg-white px-4 sm:px-6">
        <h2 className="pt-5 text-base font-bold text-text-primary">গোপনীয়তা</h2>
        <div className="divide-y divide-card-border">
          <Row icon={<MapPin className="size-5" aria-hidden />} title="শুধু জেলা দেখান" body="প্রোফাইলে এলাকার নাম লুকানো থাকবে, শুধু জেলা দেখা যাবে।">
            <Switch checked={p.districtOnly} onCheckedChange={(v) => set("districtOnly", v)} aria-label="শুধু জেলা দেখান" />
          </Row>
          <Row icon={<MessageCircle className="size-5" aria-hidden />} title="কে বার্তা পাঠাতে পারবেন" body="অপরিচিতদের বার্তা কমাতে চাইলে সীমিত করুন।">
            <div role="radiogroup" aria-label="কে বার্তা পাঠাতে পারবেন" className="flex flex-wrap gap-2">
              {([
                ["everyone", "সবাই"],
                ["verified", "যাচাইকৃতরা"],
                ["following", "যাঁদের অনুসরণ করি"],
              ] as const).map(([v, bn]) => (
                <label key={v} className={choiceClass(p.messages === v)}>
                  <input type="radio" className="sr-only" name="messages" checked={p.messages === v} onChange={() => set("messages", v)} />
                  {bn}
                </label>
              ))}
            </div>
          </Row>
          <Row icon={<EyeOff className="size-5" aria-hidden />} title="নাগরিক রিপোর্টে নাম গোপন" body="নতুন রিপোর্ট শুরুতেই নাম গোপন থাকবে। পেছনে আপনার যাচাইকৃত পরিচয় থাকে, তাই দায়িত্বও থাকে।">
            <Switch checked={p.anonymousReports} onCheckedChange={(v) => set("anonymousReports", v)} aria-label="নাগরিক রিপোর্টে নাম গোপন" />
          </Row>
          <Row icon={<Heart className="size-5" aria-hidden />} title="লাইক ও অনুসারীর সংখ্যা লুকান" body="সংখ্যার তুলনা কমলে মন ভালো থাকে — কাজের মান নিয়ে ভাবুন।">
            <Switch checked={p.hideCounts} onCheckedChange={(v) => set("hideCounts", v)} aria-label="লাইক ও অনুসারীর সংখ্যা লুকান" />
          </Row>
        </div>
      </section>

      <section className="rounded-2xl border border-card-border bg-white px-4 pb-5 sm:px-6">
        <h2 className="pt-5 text-base font-bold text-text-primary">সময়</h2>
        <Row icon={<Clock className="size-5" aria-hidden />} title="বিরতির কথা মনে করিয়ে দিন" body={`আজ এখন পর্যন্ত এখানে কাটিয়েছেন ${minutes} মিনিট। নির্দিষ্ট সময় পর একবার মনে করিয়ে দেওয়া হবে।`}>
          <div role="radiogroup" aria-label="বিরতির সময়" className="flex flex-wrap gap-2">
            {[0, 15, 30, 45, 60].map((m) => (
              <label key={m} className={choiceClass(p.breakAfter === m)}>
                <input type="radio" className="sr-only" name="breakAfter" checked={p.breakAfter === m} onChange={() => set("breakAfter", m)} />
                {m === 0 ? "বন্ধ" : <><Num value={m} /> মিনিট</>}
              </label>
            ))}
          </div>
        </Row>
      </section>

      <p className="flex gap-2 rounded-xl bg-white p-4 text-sm leading-relaxed text-text-secondary ring-1 ring-card-border">
        <ShieldCheck className="size-5 shrink-0 text-bd-green" aria-hidden />
        এই ডেমোতে আপনার সব তথ্য — পোস্ট, নোট, লেনদেন, এই সেটিংস — শুধু এই ব্রাউজারেই থাকে, কোনো সার্ভারে যায় না।
      </p>
    </div>
  );
}
