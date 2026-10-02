import { Bus, Megaphone, Snowflake, TrainFront, Truck, Package, type LucideIcon } from "lucide-react";
import { BOOST_TIERS, SHIP_NOTE } from "@/data/media/bazaar";
import type { ShipMode } from "@/lib/media/bazaar";
import { PixelMark } from "@/components/ui/section-kit";
import { LIFT, glowStyle, surfaceAt } from "@/components/ui/surfaces";
import { cn } from "@/lib/utils";
import { Num, Taka } from "../ui/numerals";

export const SHIP_ICON: Record<ShipMode, LucideIcon> = { bus: Bus, cold: Snowflake, courier: Package, train: TrainFront, truck: Truck };
export const SHIP_BN: Record<ShipMode, string> = { bus: "বাসের বক্স", cold: "কোল্ড বক্স", courier: "কুরিয়ার", train: "ট্রেন পার্সেল", truck: "ট্রাক" };

/** How goods move: spare bus holds for parcels, cold boxes for fresh food, trains and trucks for bulk. */
export function LogisticsBand() {
  const modes = Object.keys(SHIP_NOTE) as ShipMode[];
  return (
    <section className="story-reveal overflow-hidden rounded-3xl bg-text-primary p-5 ring-1 ring-white/12 sm:p-8">
      <PixelMark tone="dark" />
      <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">দেশজুড়ে ডেলিভারি — <span className="text-signal-orange">খালি জায়গা কাজে লাগিয়ে</span></h2>
      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-white/75">
        প্রতিদিন হাজারো দূরপাল্লার বাসের মালের বক্স আধা-খালি যায়। সেই জায়গায় কৃষকের পণ্য যায় একই দিনে, কম খরচে। বড় চালান যায় ট্রেনে বা ট্রাকে।
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {modes.map((m, i) => {
          const s = surfaceAt(i);
          const Icon = SHIP_ICON[m];
          return (
            <li key={m} style={glowStyle(s.glow)} className={cn("flex flex-col gap-2 rounded-2xl p-4", s.card, LIFT)}>
              <span className={cn("flex size-9 items-center justify-center rounded-xl", s.tile)}><Icon className="size-5" aria-hidden /></span>
              <span className="font-bold">{SHIP_BN[m]}</span>
              <span className="text-xs leading-relaxed opacity-80">{SHIP_NOTE[m]}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Paid reach that never leaves the platform and never reaches an unmatched buyer. */
export function BoostBand() {
  return (
    <section className="story-reveal grid gap-6 rounded-3xl bg-signal-orange p-5 text-text-primary sm:p-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center">
      <div>
      <p className="inline-flex items-center gap-2 rounded-full bg-text-primary px-3 py-1 text-xs font-bold text-signal-orange">
        <Megaphone className="size-4" aria-hidden /> ম্যাচ বুস্ট
      </p>
      <h2 className="mt-3 text-2xl font-bold sm:text-3xl">বাইরে বিজ্ঞাপন নয় — শুধু আসল ক্রেতার সামনে</h2>
      <ul className="mt-3 space-y-1.5 text-sm leading-relaxed">
        <li>• বুস্ট করা পণ্য আগে আসে শুধু তখনই, যখন কেউ সেই হ্যাশট্যাগ বা বিভাগ খোঁজেন।</li>
        <li>• সাধারণ তালিকায় বুস্টের কোনো সুবিধা নেই; অমিল ক্রেতা আলাদা করে দেখেন না।</li>
        <li>• বুস্ট করা কার্ডে সবসময় “বুস্টেড” লেখা থাকে।</li>
      </ul>
      </div>
      <ul className="grid grid-cols-3 gap-2">
        {BOOST_TIERS.map((t) => (
          <li key={t.taka} className="rounded-2xl bg-text-primary px-3 py-3 text-center text-white">
            <span className="block text-xl font-bold text-signal-orange"><Taka amount={t.taka} /></span>
            <span className="text-xs text-white/75"><Num value={t.days} /> দিন</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
