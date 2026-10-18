import { blocks, citeParts, waterfall, type DataTable, type Figure, type Section } from "@/lib/research/core";
import { cn } from "@/lib/utils";
import { bn, bnNum } from "./ui";

/** Text with `[n]` marks turned into superscript links to the references. */
export function Cited({ text }: { text: string }) {
  return (
    <>
      {citeParts(text).map((part, i) =>
        "cite" in part ? (
          <sup key={i} className="mx-px">
            <a href={`#ref-${part.cite}`} className="rounded font-sans text-xs font-bold text-signal-orange hover:bg-signal-orange hover:text-text-primary" aria-label={`তথ্যসূত্র ${bn(part.cite)}`}>
              [{bn(part.cite)}]
            </a>
          </sup>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

/** A section body: paragraphs and dash lists, citations live. */
export function Blocks({ body, className }: { body: string; className?: string }) {
  return (
    <>
      {blocks(body).map((b, i) =>
        "list" in b ? (
          <ul key={i} className={cn("mt-4 space-y-3", className)}>
            {b.list.map((item, j) => (
              <li key={j} className="grid grid-cols-[1.6rem_minmax(0,1fr)] gap-2">
                <span className="mt-0.5 text-base font-bold text-signal-orange">{bn(j + 1)}.</span>
                <span><Cited text={item} /></span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className={cn("mt-4", className)}><Cited text={b.text} /></p>
        ),
      )}
    </>
  );
}

export function Callout({ c }: { c: NonNullable<Section["callout"]> }) {
  return (
    <aside className="mt-6 rounded-2xl border-l-4 border-signal-orange bg-bdnavy-900 p-5 text-base leading-relaxed">
      <p className="text-lg font-bold text-signal-orange">{c.title}</p>
      <Blocks body={c.body} className="mt-2.5 text-white/85" />
    </aside>
  );
}

const fmt = (n: number, unit: string) => `${bnNum(n)}${unit}`;

/**
 * A horizontal bar chart or waterfall on a navy panel. Values are printed
 * on every bar (ten rows at most), so colour is never the only channel:
 * navy tint = a step, gold = what the text points at, light = a total.
 */
export function FigureView({ f, n }: { f: Figure; n: number }) {
  const rows = f.kind === "waterfall" ? waterfall(f.rows) : f.rows.map((row) => ({ row, start: 0, end: row.value }));
  const max = Math.max(...rows.map((r) => r.end)) || 1;
  return (
    <figure className="mt-7 rounded-2xl bg-bdnavy-900 p-4 ring-1 ring-white/12 ring-inset sm:p-6">
      <p className="text-xs font-bold text-signal-orange">চিত্র {bn(n)}</p>
      <p className="mt-0.5 text-lg leading-snug font-bold text-white">{f.title}</p>
      <ol className="mt-4 space-y-2.5 sm:space-y-2">
        {rows.map(({ row, start, end }, i) => {
          const left = (start / max) * 100;
          const width = Math.max(0.4, ((end - start) / max) * 100);
          const label = f.kind === "waterfall" && !row.total ? `+${fmt(row.value, f.unit)}` : fmt(row.value, f.unit);
          return (
            <li key={row.label} className="grid grid-cols-[minmax(0,1fr)] items-center gap-x-4 gap-y-1 rounded-lg sm:grid-cols-[12rem_minmax(0,1fr)] sm:px-1 sm:py-0.5 sm:hover:bg-white/5" title={`${row.label}: ${label}`}>
              <span className={cn("text-[13px] leading-snug sm:text-right", row.total || row.accent ? "font-bold text-white" : "text-white/80")}>{row.label}</span>
              {/* The plot stops short of the right edge, so a value always has room just after its bar. */}
              <span className="relative block h-6">
                <span className="absolute inset-y-0 right-24 left-0">
                  <span
                    className={cn("research-grow absolute inset-y-0.5 rounded-r-[4px] rounded-l-[2px]", row.total ? "bg-white/85" : row.accent ? "bg-signal-orange" : "bg-bdnavy-400/70")}
                    style={{ left: `${left}%`, width: `${width}%`, ["--i" as string]: i }}
                  />
                  <span className="absolute top-1/2 -translate-y-1/2 pl-1.5 text-xs font-bold whitespace-nowrap text-white" style={{ left: `${left + width}%` }}>
                    {label}
                  </span>
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      {f.kind === "waterfall" && (
        <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/80" aria-hidden>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-[2px] bg-white/85" />মোট দাম</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-[2px] bg-bdnavy-400/70" />খরচের ধাপ</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-[2px] bg-signal-orange" />সবচেয়ে বড় অ্যাটম</span>
        </p>
      )}
      <figcaption className="mt-4 border-t border-white/12 pt-3 text-sm leading-relaxed text-white/80"><Cited text={f.caption} /></figcaption>
    </figure>
  );
}

/** A data table that scrolls sideways on a phone rather than squeezing its columns. */
export function TableView({ t, n }: { t: DataTable; n: number }) {
  return (
    <figure className="mt-7">
      <figcaption className="mb-2">
        <span className="text-xs font-bold text-signal-orange">সারণি {bn(n)}</span>
        <span className="block text-lg leading-snug font-bold text-white">{t.title}</span>
      </figcaption>
      <div className="overflow-x-auto rounded-2xl bg-bdnavy-900 ring-1 ring-white/12 ring-inset scrollbar-gold" tabIndex={0} role="region" aria-label={t.title}>
        <table className="w-full min-w-136 border-collapse text-left text-[13.5px] leading-snug">
          <thead>
            <tr className="bg-cobalt text-white">
              {t.head.map((h) => <th key={h} scope="col" className="px-3.5 py-2.5 font-bold first:rounded-tl-2xl last:rounded-tr-2xl">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r, i) => (
              <tr key={i} className="border-t border-white/10 align-top even:bg-white/[0.03]">
                {r.map((cell, j) =>
                  j === 0 ? (
                    <th key={j} scope="row" className="px-3.5 py-2.5 font-bold text-white"><Cited text={cell} /></th>
                  ) : (
                    <td key={j} className="px-3.5 py-2.5 text-white/80"><Cited text={cell} /></td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {t.caption && <p className="mt-2 text-sm leading-relaxed text-white/80"><Cited text={t.caption} /></p>}
    </figure>
  );
}
