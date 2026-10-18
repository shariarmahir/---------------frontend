import { ImageResponse } from "next/og";
import { findArticle, libraryArticles } from "@/data/research/library";
import { FIELDS, KINDS, waterfall } from "@/lib/research/core";

/*
 * The card Facebook, LinkedIn, X and WhatsApp show for a shared work, in
 * the site's look: the pitch-black ground, a gold title, white text and a
 * navy panel for the figure. Colours are the brand tokens' values (this
 * renderer has no CSS variables).
 */
export const alt = "Genius item";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#e4b027";
const NAVY = "#0b1849";
const BLACK = "#000000";
const SOFT = "rgba(255,255,255,0.72)";
const TINT = "#8fa1e3";

export function generateStaticParams() {
  return libraryArticles.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = findArticle(decodeURIComponent((await params).slug));
  const title = a?.title ?? "Bangladesh's open research library";
  const authors = a?.authors.map((x) => x.nameEn ?? x.name).join(", ");
  const fig = a?.sections.flatMap((s) => s.figures ?? []).find((f) => f.kind === "waterfall");
  const bars = fig ? waterfall(fig.rows) : [];
  const max = Math.max(1, ...bars.map((b) => b.end));
  const type = a ? (a.preprint ? "Working paper" : KINDS[a.kind].type) : "";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: BLACK, color: "#fff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: 64, paddingRight: bars.length ? 40 : 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", color: NAVY, fontSize: 30, fontWeight: 700 }}>K</div>
            <span style={{ fontSize: 30, fontWeight: 700 }}>Genius</span>
          </div>
          <div style={{ display: "flex", marginTop: 44, fontSize: 24, fontWeight: 600, color: TINT }}>
            {[type, a && FIELDS[a.field].en].filter(Boolean).join("  ·  ")}
          </div>
          <div style={{ marginTop: 16, fontSize: title.length > 90 ? 44 : 54, lineHeight: 1.15, fontWeight: 700, color: GOLD, display: "flex" }}>{title}</div>
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: SOFT }}>
            <span style={{ width: 10, height: 44, background: GOLD }} />
            <span>{[authors, a?.year].filter(Boolean).join(" · ")}</span>
          </div>
        </div>
        {bars.length > 0 && (
          <div style={{ width: 340, margin: 32, marginLeft: 0, borderRadius: 32, background: NAVY, padding: 32, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
            {bars.map((b) => (
              <div key={b.row.label} style={{ display: "flex", height: 16, position: "relative" }}>
                <div style={{ position: "absolute", top: 0, bottom: 0, left: `${(b.start / max) * 100}%`, width: `${Math.max(1, ((b.end - b.start) / max) * 100)}%`, background: b.row.total ? "#fff" : b.row.accent ? GOLD : TINT }} />
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    size,
  );
}
