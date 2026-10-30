/*
 * A work's text as a printed page, the way JSTOR's viewer shows a scan:
 * the site's type on white paper, figures and tables set like a journal's. Citation
 * marks link to the references page.
 */
import { blocks, citeParts, waterfall, type DataTable, type Figure, type Section } from "@/lib/research/core";
import { cn } from "@/lib/utils";

/** Text with `[n]` marks turned into superscript links to the references. */
export function Cited({ text }: { text: string }) {
  return (
    <>
      {citeParts(text).map((part, i) =>
        "cite" in part ? (
          <sup key={i} className="mx-px">
            <a href={`#ref-${part.cite}`} className="text-[0.75em] font-semibold text-cobalt hover:underline" aria-label={`Reference ${part.cite}`}>
              [{part.cite}]
            </a>
          </sup>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

/** A section body: justified paragraphs and numbered lists, citations live. */
export function Blocks({ body, className }: { body: string; className?: string }) {
  return (
    <>
      {blocks(body).map((b, i) =>
        "list" in b ? (
          <ol key={i} className={cn("mt-[0.9em] space-y-[0.6em]", className)}>
            {b.list.map((item, j) => (
              <li key={j} className="grid grid-cols-[1.6em_minmax(0,1fr)] gap-[0.3em]">
                <span className="text-right tabular-nums">{j + 1}.</span>
                <span><Cited text={item} /></span>
              </li>
            ))}
          </ol>
        ) : (
          <p key={i} className={cn("mt-[0.9em] text-pretty hyphens-auto sm:text-justify", className)}><Cited text={b.text} /></p>
        ),
      )}
    </>
  );
}

/** A boxed note on a pale navy tint, ringed in gold. */
export function Callout({ c }: { c: NonNullable<Section["callout"]> }) {
  return (
    <aside className="mt-[1.4em] rounded-md bg-bdnavy-50 px-[1.1em] py-[0.9em] text-[0.92em] ring-1 ring-signal-orange ring-inset">
      <p className="font-grotesk text-[0.95em] font-bold text-bdnavy-900">{c.title}</p>
      <Blocks body={c.body} className="sm:text-left" />
    </aside>
  );
}

const fmt = (n: number, unit: string) => `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}${unit}`;

/**
 * A horizontal bar chart or waterfall. Values are printed on every bar
 * (ten rows at most), so colour is never the only channel: navy tint = a
 * step, gold = what the text points at, navy = a total.
 */
export function FigureView({ f, n }: { f: Figure; n: number }) {
  const rows = f.kind === "waterfall" ? waterfall(f.rows) : f.rows.map((row) => ({ row, start: 0, end: row.value }));
  const max = Math.max(...rows.map((r) => r.end)) || 1;
  return (
    <figure className="mt-[1.6em] border-y border-bdnavy-900/25 py-[1em] text-[0.8em]">
      <p className="font-semibold text-bdnavy-900">Figure {n}. <span className="font-normal">{f.title}</span></p>
      <ol className="mt-3 space-y-2">
        {rows.map(({ row, start, end }, i) => {
          const left = (start / max) * 100;
          const width = Math.max(0.4, ((end - start) / max) * 100);
          const label = f.kind === "waterfall" && !row.total ? `+${fmt(row.value, f.unit)}` : fmt(row.value, f.unit);
          return (
            <li key={row.label} className="grid grid-cols-[minmax(0,1fr)] items-center gap-x-3 gap-y-0.5 sm:grid-cols-[11rem_minmax(0,1fr)]" title={`${row.label}: ${label}`}>
              <span className={cn("leading-snug sm:text-right", row.total || row.accent ? "font-semibold text-bdnavy-900" : "text-bdnavy-700")}>{row.label}</span>
              {/* The plot stops short of the right edge, so a value always has room just after its bar. */}
              <span className="relative block h-5">
                <span className="absolute inset-y-0 right-20 left-0">
                  <span
                    className={cn("research-grow absolute inset-y-0.5", row.total ? "bg-bdnavy-900" : row.accent ? "bg-signal-orange" : "bg-bdnavy-300")}
                    style={{ left: `${left}%`, width: `${width}%`, ["--i" as string]: i }}
                  />
                  <span className="absolute top-1/2 -translate-y-1/2 pl-1.5 font-semibold whitespace-nowrap text-bdnavy-900" style={{ left: `${left + width}%` }}>
                    {label}
                  </span>
                </span>
              </span>
            </li>
          );
        })}
      </ol>
      {f.kind === "waterfall" && (
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-bdnavy-700" aria-hidden>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-bdnavy-900" />Total</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-bdnavy-300" />Step added</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-signal-orange" />Discussed in the text</span>
        </p>
      )}
      <figcaption className="mt-3 leading-relaxed text-bdnavy-700"><Cited text={f.caption} /></figcaption>
    </figure>
  );
}

/** A data table in journal style; it scrolls sideways on a phone rather than squeezing its columns. */
export function TableView({ t, n }: { t: DataTable; n: number }) {
  return (
    <figure className="mt-[1.6em] text-[0.8em]">
      <figcaption className="mb-2 font-semibold text-bdnavy-900">Table {n}. <span className="font-normal">{t.title}</span></figcaption>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={t.title}>
        <table className="w-full min-w-120 border-collapse text-left leading-snug">
          <thead>
            <tr className="border-y-2 border-bdnavy-900">
              {t.head.map((h) => <th key={h} scope="col" className="px-2.5 py-2 font-semibold text-bdnavy-900">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r, i) => (
              <tr key={i} className="border-b border-bdnavy-100 align-top">
                {r.map((cell, j) =>
                  j === 0 ? (
                    <th key={j} scope="row" className="px-2.5 py-2 font-semibold text-bdnavy-900"><Cited text={cell} /></th>
                  ) : (
                    <td key={j} className="px-2.5 py-2 text-bdnavy-900/90"><Cited text={cell} /></td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {t.caption && <p className="mt-2 leading-relaxed text-bdnavy-700"><Cited text={t.caption} /></p>}
    </figure>
  );
}
