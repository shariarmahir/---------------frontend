import type { Metadata } from "next";
import { PanelList } from "@/components/media/academy/panel/panel-list";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { RUBRIC } from "@/lib/media/academy";
import { Num } from "@/components/media/ui/numerals";

export const metadata: Metadata = { title: "প্যানেল মার্কিং · একাডেমি" };

export default function PanelPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="প্যানেল মার্কিং"
        subtitle="আপনার কোর্সের ফাইনাল ইন্টারভিউ। লাইভ ইন্টারভিউ শেষে রুব্রিক ধরে নম্বর দিন — অন্য পরীক্ষকের নম্বর আপনার জমার পরেই খোলে।"
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <PanelList />
        <Panel as="aside" title="রুব্রিক · ১০০" className="lg:sticky lg:top-0 lg:self-start">
          <ul className="space-y-2.5 text-sm">
            {RUBRIC.map((r) => (
              <li key={r.id} className="flex justify-between gap-3">
                <span className="text-white/85">{r.bn}</span>
                <span className="font-semibold text-white"><Num value={r.max} /></span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
