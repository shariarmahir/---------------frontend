import { ImageResponse } from "next/og";
import { findArticle, libraryArticles } from "@/data/research/library";
import { FIELDS, KINDS, waterfall } from "@/lib/research/core";

/*
 * The card Facebook, LinkedIn, X and WhatsApp show for a shared article.
 * The image renderer cannot join Bangla conjuncts, so the card is set in
 * Latin: the English title, field and the authors' Latin names when given.
 * Colours are the brand tokens' values (this renderer has no CSS variables).
 */
export const alt = "Kandari ResearchPedia article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#e4b027";
const INK = "#032017";
const GREEN = "#006747";

export function generateStaticParams() {
  return libraryArticles.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = findArticle(decodeURIComponent((await params).slug));
  const title = a?.titleEn ?? "Bangladesh's open research library";
  const authors = a?.authors.map((x) => x.nameEn).filter(Boolean).join(", ");
  const fig = a?.sections.flatMap((s) => s.figures ?? []).find((f) => f.kind === "waterfall");
  const bars = fig ? waterfall(fig.rows) : [];
  const max = Math.max(1, ...bars.map((b) => b.end));

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#000", color: "#fff", padding: 64, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: bars.length ? 48 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", color: INK, fontSize: 30, fontWeight: 800 }}>K</div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 26, fontWeight: 800 }}>Kandari ResearchPedia</span>
              <span style={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }}>Bangladesh&apos;s open research library</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 44 }}>
            {a && <span style={{ background: GREEN, borderRadius: 999, padding: "6px 16px", fontSize: 20, fontWeight: 700 }}>{FIELDS[a.field].en}</span>}
            {a && <span style={{ border: "2px solid rgba(255,255,255,0.3)", borderRadius: 999, padding: "4px 16px", fontSize: 20, fontWeight: 700 }}>{a.preprint ? "Working paper" : KINDS[a.kind].en}</span>}
          </div>
          <div style={{ marginTop: 24, fontSize: title.length > 90 ? 44 : 54, fontWeight: 800, lineHeight: 1.12, display: "flex" }}>{title}</div>
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "rgba(255,255,255,0.75)" }}>
            <span style={{ width: 10, height: 44, background: GOLD, borderRadius: 4 }} />
            <span>{[authors, a?.year].filter(Boolean).join(" · ")}</span>
          </div>
        </div>
        {bars.length > 0 && (
          <div style={{ width: 330, background: GOLD, borderRadius: 32, padding: 28, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
            {bars.map((b) => (
              <div key={b.row.label} style={{ display: "flex", height: 16, position: "relative" }}>
                <div style={{ position: "absolute", top: 0, bottom: 0, left: `${(b.start / max) * 100}%`, width: `${Math.max(1, ((b.end - b.start) / max) * 100)}%`, background: b.row.total ? INK : b.row.accent ? GREEN : "rgba(3,32,23,0.35)", borderRadius: 4 }} />
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    size,
  );
}
