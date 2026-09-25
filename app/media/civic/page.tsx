import type { Metadata } from "next";
import Link from "next/link";
import { Phone, ShieldCheck, TriangleAlert } from "lucide-react";
import { CivicCard, MyReports, ReportButton } from "@/components/media/community/civic";
import { EmptyState } from "@/components/media/ui/empty-state";
import { chipClass } from "@/components/media/ui/field-styles";
import { PageHeader, Panel } from "@/components/media/ui/layout";
import { Num } from "@/components/media/ui/numerals";
import { civicKindBn, civicReports, riskyAreas } from "@/data/media/civic";
import type { CivicKind } from "@/data/media/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "নাগরিক" };

type Params = { k?: string; d?: string; r?: string };

function href(p: Params) {
  const q = new URLSearchParams(Object.entries(p).filter(([, v]) => v) as [string, string][]);
  const s = q.toString();
  return s ? `/media/civic?${s}` : "/media/civic";
}

export default async function CivicPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const kind = sp.k && sp.k in civicKindBn ? (sp.k as CivicKind) : undefined;
  const district = sp.d && civicReports.some((r) => r.district === sp.d) ? sp.d : undefined;
  const shown = civicReports
    .filter((r) => !kind || r.kind === kind)
    .filter((r) => !district || r.district === district)
    .sort((a, b) => Number(a.status === "solved") - Number(b.status === "solved") || b.at.localeCompare(a.at));
  const areas = riskyAreas(civicReports).slice(0, 5);
  const reportDistricts = Array.from(new Set(civicReports.map((r) => r.district)));

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="নাগরিক"
        subtitle="এলাকার সমস্যা, চাঁদাবাজি, ঝুঁকিপূর্ণ জায়গা আর সাহায্যের আবেদন — এলাকাবাসী নিশ্চিত করেন, সবাই মিলে সমাধান খোঁজেন।"
        actions={<ReportButton />}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-4">
          <nav aria-label="রিপোর্টের ধরন" className="space-y-3">
            <div className="-mx-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
              <ul className="flex w-max gap-2">
                <li><Link href={href({ d: district })} scroll={false} aria-current={!kind ? "page" : undefined} className={chipClass(!kind)}>সব</Link></li>
                {(Object.keys(civicKindBn) as CivicKind[]).map((k) => (
                  <li key={k}>
                    <Link href={href({ k, d: district })} scroll={false} aria-current={kind === k ? "page" : undefined} className={chipClass(kind === k)}>
                      {civicKindBn[k]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="-mx-3 overflow-x-auto px-3 scrollbar-none sm:mx-0 sm:px-0">
              <ul className="flex w-max gap-1.5 text-xs">
                <li className="flex items-center pr-1 font-semibold text-text-muted">জেলা:</li>
                <li><Link href={href({ k: kind })} scroll={false} className={cn("inline-flex min-h-8 items-center rounded-lg px-2.5 font-semibold", !district ? "bg-slate-800 text-white" : "bg-white text-text-secondary ring-1 ring-card-border hover:text-text-primary")}>সব</Link></li>
                {reportDistricts.map((d) => (
                  <li key={d}>
                    <Link href={href({ k: kind, d })} scroll={false} className={cn("inline-flex min-h-8 items-center rounded-lg px-2.5 font-semibold", district === d ? "bg-slate-800 text-white" : "bg-white text-text-secondary ring-1 ring-card-border hover:text-text-primary")}>{d}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {!kind && !district && <MyReports />}

          {shown.length === 0 ? (
            <EmptyState icon="search" title="এই ফিল্টারে কোনো রিপোর্ট নেই" body="ভালো খবর — অথবা এখনো কেউ রিপোর্ট করেননি।" />
          ) : (
            <div className="space-y-4">{shown.map((r) => <CivicCard key={r.id} report={r} />)}</div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-22 lg:self-start">
          <Panel title={<span className="flex items-center gap-2"><TriangleAlert className="size-4.5 text-national-crimson" aria-hidden />এলাকার সতর্কতা</span>}>
            <ul className="space-y-3">
              {areas.map((a) => (
                <li key={`${a.area}-${a.district}`} className="flex items-start justify-between gap-2">
                  <span className="min-w-0">
                    <Link href={href({ d: a.district })} className="block text-sm font-semibold text-text-primary hover:text-bd-green">{a.area}, {a.district}</Link>
                    <span className="block truncate text-xs text-text-muted">{[...a.kinds].map((k) => civicKindBn[k]).join(" · ")}</span>
                  </span>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold", a.high > 0 ? "bg-red-50 text-national-crimson" : "bg-amber-50 text-amber-900")}>
                    {a.high > 0 ? "ঝুঁকিপূর্ণ" : "সতর্ক থাকুন"} · <Num value={a.total} />
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="জরুরি নম্বর">
            <ul className="space-y-2 text-sm">
              {[
                ["৯৯৯", "পুলিশ, ফায়ার, অ্যাম্বুলেন্স"],
                ["১০৯", "নারী ও শিশু নির্যাতন প্রতিরোধ"],
                ["৩৩৩", "সরকারি তথ্য ও সেবা"],
                ["১০৯০", "দুর্যোগের আগাম বার্তা"],
              ].map(([n, what]) => (
                <li key={n} className="flex items-center justify-between gap-2">
                  <span className="text-text-secondary">{what}</span>
                  <a href={`tel:${n.replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))}`} className="inline-flex min-h-9 items-center gap-1 rounded-lg px-2 font-bold text-bd-green hover:bg-bd-green-light">
                    <Phone className="size-3.5" aria-hidden />{n}
                  </a>
                </li>
              ))}
            </ul>
          </Panel>
          <p className="flex gap-2 rounded-xl bg-white p-3 text-xs leading-relaxed text-text-muted ring-1 ring-card-border">
            <ShieldCheck className="size-4 shrink-0 text-bd-green" aria-hidden />
            প্রতিটি রিপোর্টের পেছনে এনআইডি-যাচাইকৃত একজন মানুষ। নাম গোপন রাখা যায়, মিথ্যা বলা যায় না।
          </p>
        </aside>
      </div>
    </div>
  );
}
