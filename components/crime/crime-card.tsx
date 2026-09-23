import Image from "next/image";
import { Icon } from "@/components/ui/icon";
import {
  crimeCategories,
  crimeTiers,
  type CrimeRecord,
} from "@/data/crime-index";
import { cn } from "@/lib/utils";

function metaFor(record: CrimeRecord) {
  const category =
    crimeCategories.find((c) => c.id === record.category) ?? crimeCategories[0];
  const tier = crimeTiers.find((t) => t.id === category.tier) ?? crimeTiers[0];
  return { category, tier };
}

/**
 * The identity slot.
 *
 * This is the whole reason `CrimeRecord` is a union. A convicted record
 * may show a name and photograph because a court has ruled and the
 * record carries the case number that backs it. Everything else — under
 * investigation, arrested, at large — shows the accused count and the
 * stage of the case in the same slot, so the card reads as a case file
 * rather than an accusation against a face.
 */
function Identity({ record }: { record: CrimeRecord }) {
  if (record.status === "convicted") {
    return (
      <div className="flex items-start gap-2.5">
        <span className="relative shrink-0">
          {record.offenderPhoto ? (
            <Image
              src={record.offenderPhoto}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-lg border border-border object-cover"
            />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-bdgreen-50 text-bd-green">
              <Icon name="gavel" className="text-[20px]" />
            </span>
          )}
          <span
            className="absolute -right-1 -bottom-1 size-3 rounded-full border-2 border-white bg-bd-green"
            title="দণ্ডপ্রাপ্ত"
          />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="font-mono text-[0.6875rem] font-bold text-bd-green">
            দণ্ডপ্রাপ্ত:
          </span>
          <span className="truncate font-sans text-[0.8125rem] font-semibold text-slate-900">
            {record.offenderName}
          </span>
          <span className="truncate font-mono text-[0.625rem] text-slate-500">
            {record.court} · {record.caseNo}
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      {/* No face and no name, by type: nobody here has been convicted. */}
      <span className="relative shrink-0">
        <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-slate-100 text-slate-400">
          <Icon name="person_off" className="text-[20px]" />
        </span>
        <span
          className="absolute -right-1 -bottom-1 size-3 rounded-full border-2 border-white bg-signal-orange"
          title="বিচারাধীন"
        />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="font-mono text-[0.6875rem] font-bold text-amber-700">
          অভিযুক্ত: {record.accusedCount}
        </span>
        <span className="font-sans text-[0.8125rem] font-semibold text-slate-700">
          পরিচয় প্রকাশ করা হয়নি
        </span>
        <span className="truncate font-mono text-[0.625rem] text-slate-500">
          {record.stage}
        </span>
      </span>
    </div>
  );
}

/**
 * One record, in the reference's thumbnail-over-meta shape: a 16:9 image
 * with its badges overlaid, then the case detail beneath it.
 */
export function CrimeCard({ record }: { record: CrimeRecord }) {
  const { category, tier } = metaFor(record);
  const mapHref = `https://www.openstreetmap.org/search?query=${encodeURIComponent(
    record.location.mapQuery,
  )}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white transition-shadow hover:shadow-[0_1px_3px_rgba(14,42,30,0.06),0_8px_20px_rgba(7,32,22,0.08)]">
      {/* ── Thumbnail ─────────────────────────────────────────── */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
        {record.image ? (
          <Image
            src={record.image}
            alt=""
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          // No photograph, by policy — see the provenance note in
          // data/crime-index.ts. The plate carries the tier's own colour
          // so the thumbnail still reads severity at a glance, and the
          // statute sits under the glyph so the space says something.
          <div
            className={cn(
              "flex size-full flex-col items-center justify-center gap-1.5",
              tier.plate,
            )}
          >
            <Icon name={category.icon} className="text-[44px] opacity-70" />
            <span className="font-mono text-[0.625rem] font-bold tracking-wide opacity-80">
              {category.statute ?? tier.banglaLabel}
            </span>
          </div>
        )}

        {/* Tier + category badge, top-left. */}
        <span
          className={cn(
            "absolute top-2 left-2 max-w-[calc(100%-4rem)] truncate rounded px-2 py-0.5 font-mono text-[0.625rem] font-bold shadow-sm",
            tier.badge,
          )}
        >
          {category.banglaLabel}
        </span>

        {/* Sourced mark, top-right. */}
        <span
          className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-white/90 text-bd-green shadow-sm"
          title="যাচাইকৃত উৎস থেকে সংগৃহীত"
        >
          <Icon name="verified" className="text-[16px]" filled />
        </span>

        {/* Runtime, bottom-right. */}
        {record.videoDuration ? (
          <span className="absolute right-2 bottom-2 rounded bg-slate-950/80 px-1.5 py-0.5 font-mono text-[0.625rem] font-bold text-white">
            {record.videoDuration}
            {record.evidenceKind ? ` ${record.evidenceKind}` : null}
          </span>
        ) : null}

        {/* Photo credit, so a stock image is never mistaken for evidence. */}
        {record.imageCredit ? (
          <span className="absolute bottom-2 left-2 max-w-[60%] truncate rounded bg-slate-950/70 px-1.5 py-0.5 font-sans text-[0.5625rem] text-white/90">
            {record.imageCredit}
          </span>
        ) : null}
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-2.5 p-space-sm">
        <h3 className="line-clamp-2 font-display text-[0.9375rem] leading-snug font-bold text-slate-900">
          {record.headline}
        </h3>

        <Identity record={record} />

        <div className="flex flex-col gap-1 border-t border-border pt-2 font-sans text-body-sm text-slate-600">
          <a
            href={mapHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-medium text-slate-900 hover:text-bd-green hover:underline"
          >
            <Icon
              name="location_on"
              className="shrink-0 text-[15px] text-bd-green"
            />
            <span className="truncate">
              {record.location.thana}, {record.location.district}
            </span>
          </a>
          {record.location.coordinates ? (
            <span className="truncate pl-5 font-mono text-[0.625rem] text-slate-500">
              {record.location.coordinates}
            </span>
          ) : null}
          <span className="font-mono text-[0.6875rem] text-slate-500">
            {record.filedAt}
          </span>
        </div>

        {/* Statute strip. */}
        <div
          className={cn(
            "flex items-center justify-between gap-2 rounded-md border px-2 py-1.5 font-mono text-[0.6875rem]",
            tier.chip,
          )}
        >
          <span className="truncate font-bold">
            {category.statute ?? tier.legalClass}
          </span>
          {record.penalty ? (
            <span className="shrink-0 opacity-80">{record.penalty}</span>
          ) : null}
        </div>

        {/* Source line — every record says where it came from. */}
        <p className="mt-auto flex items-start gap-1 font-sans text-[0.6875rem] text-slate-500">
          <Icon name="source" className="mt-px shrink-0 text-[13px]" />
          <span className="min-w-0">{record.source}</span>
        </p>
      </div>
    </article>
  );
}
