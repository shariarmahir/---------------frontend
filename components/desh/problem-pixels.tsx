import { sourcePoints } from "@/data/amar-bangladesh";
import { asStatement, ideasFor } from "@/data/desh";
import { codeOf, modules } from "@/data/gori/modules";
import { evidenceBn, themeBn, urgencyBn, type ThemeId } from "@/data/gori/puzzles";
import { ruralStories } from "@/data/rural-life";
import { ProblemPixelsView, type PixelProblem } from "./problem-pixels-view";

/**
 * The 32 problems, pixel by pixel. Built on the server from the dossier
 * (evidence, urgency), the game modules (Bangla titles) and the puzzles
 * (the 32 ideas), so the client view gets plain rows.
 */
export function ProblemPixels() {
  const items: PixelProblem[] = sourcePoints.map((p) => {
    const ideas = ideasFor(p.n);
    const m = modules.find((x) => x.n === p.n)!;
    const photo = ruralStories.find((s) => s.problem === p.n)?.photo;
    return {
      n: p.n,
      code: codeOf(p.n),
      title: m.titleBn,
      topicEn: p.topic,
      interpretation: p.interpretation,
      theme: themeBn[p.theme as ThemeId] ?? p.theme,
      urgency: p.urgency,
      urgencyBn: urgencyBn[p.urgency],
      status: p.status,
      statusBn: evidenceBn[p.status],
      statusNote: p.statusNote,
      brief: ideas?.brief ?? "",
      fact: ideas?.fact,
      doThis: (ideas?.doThis ?? []).map((d) => ({ text: asStatement(d.q), why: d.why })),
      avoid: (ideas?.avoid ?? []).map((d) => ({ text: asStatement(d.q), why: d.why })),
      photo: photo ? { src: photo.src, alt: photo.alt } : undefined,
    };
  });
  return <ProblemPixelsView items={items} />;
}
