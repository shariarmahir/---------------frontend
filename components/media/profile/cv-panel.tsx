import Link from "next/link";
import { cn } from "@/lib/utils";
import { CV_FORMATS, type CvFormat } from "@/lib/media/cv";

/** A tiny wireframe of each layout, so the three can be told apart before opening one. */
const SKETCH: Record<CvFormat, React.ReactNode> = {
  ats: (
    <div className="space-y-1">
      <div className="mx-auto h-1.5 w-1/2 rounded-full bg-neutral-700" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-0.5 pt-1">
          <div className="h-1 w-1/3 rounded-full bg-neutral-500" />
          <div className="h-1 rounded-full bg-neutral-300" />
          <div className="h-1 w-5/6 rounded-full bg-neutral-300" />
        </div>
      ))}
    </div>
  ),
  modern: (
    <div className="grid h-full grid-cols-[30%_1fr] gap-1.5">
      <div className="space-y-1 rounded-sm bg-neutral-800 p-1">
        <div className="mx-auto size-3 rounded-full bg-neutral-300" />
        <div className="h-1 rounded-full bg-neutral-500" />
        <div className="h-1 w-4/5 rounded-full bg-neutral-500" />
      </div>
      <div className="space-y-1 pt-0.5">
        <div className="h-1.5 w-2/3 rounded-full bg-neutral-700" />
        <div className="h-1 rounded-full bg-neutral-300" />
        <div className="h-1 w-5/6 rounded-full bg-neutral-300" />
        <div className="h-1 w-1/3 rounded-full bg-neutral-500" />
        <div className="h-1 rounded-full bg-neutral-300" />
      </div>
    </div>
  ),
  europass: (
    <div className="space-y-1.5">
      <div className="h-1.5 w-1/2 rounded-full bg-sky-700" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid grid-cols-[28%_1fr] gap-1.5 border-t border-sky-200 pt-1">
          <div className="h-1 rounded-full bg-sky-400" />
          <div className="space-y-0.5">
            <div className="h-1 rounded-full bg-neutral-300" />
            <div className="h-1 w-4/5 rounded-full bg-neutral-300" />
          </div>
        </div>
      ))}
    </div>
  ),
};

/** The three CV layouts as cards; each opens the CV in that layout. `base` is the CV page's path. */
export function CvFormatCards({ base, current }: { base: string; current?: CvFormat }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {(Object.keys(CV_FORMATS) as CvFormat[]).map((f) => (
        <li key={f}>
          <Link
            href={`${base}?f=${f}`}
            aria-current={current === f ? "true" : undefined}
            className={cn("group block h-full rounded-2xl border p-3 transition-colors", current === f ? "border-m-yellow bg-m-yellow/10" : "border-m-ink/10 hover:border-m-ink/30")}
          >
            <span className="mb-3 block aspect-[4/5] rounded-lg bg-white p-2.5">{SKETCH[f]}</span>
            <span className="block text-sm font-bold text-m-ink">{CV_FORMATS[f].name}</span>
            <span className="mt-0.5 block text-xs leading-snug text-m-ink/60">{CV_FORMATS[f].note}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
