import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { DESH_CHAPTERS } from "@/data/desh";

/**
 * Previous / next links at the foot of each country page, so the five pages
 * still read as one walk from the story to the repair.
 */
export function ChapterPager({ current }: { current: string }) {
  const i = DESH_CHAPTERS.findIndex((c) => c.href === current);
  const prev = i > 0 ? DESH_CHAPTERS[i - 1] : null;
  const next = i >= 0 && i < DESH_CHAPTERS.length - 1 ? DESH_CHAPTERS[i + 1] : null;

  const card =
    "group flex min-h-24 flex-1 flex-col justify-center gap-1 rounded-2xl bg-bdgreen-950 px-6 py-5 text-white shadow-tile [-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-tile-lift active:scale-[0.98] active:duration-150 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100";

  return (
    <nav aria-label="অধ্যায় থেকে অধ্যায়ে" className="bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-gutter-x py-10 sm:flex-row">
        {prev ? (
          <Link href={prev.href} className={card}>
            <span className="flex items-center gap-1.5 font-bengali text-sm font-semibold text-signal-orange">
              <Icon name="arrow_back" className="text-[18px]" /> আগের অধ্যায়
            </span>
            <span className="font-bengali text-xl font-bold">{prev.label}</span>
          </Link>
        ) : null}
        {next ? (
          <Link href={next.href} className={`${card} sm:items-end sm:text-right`}>
            <span className="flex items-center gap-1.5 font-bengali text-sm font-semibold text-signal-orange">
              পরের অধ্যায় <Icon name="arrow_forward" className="text-[18px]" />
            </span>
            <span className="font-bengali text-xl font-bold">{next.label}</span>
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
