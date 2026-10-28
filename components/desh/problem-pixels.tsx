import { Section } from "@/components/bangladesh-landing/kit";
import { sourcePoints } from "@/data/amar-bangladesh";
import { PROBLEM_IDEAS } from "@/data/bangladesh-problems";
import { ideasFor } from "@/data/desh";
import { modules } from "@/data/gori/modules";
import { ProblemPixelsView, type PixelProblem } from "./problem-pixels-view";

/**
 * The 32 problems, pixel by pixel. Built on the server from the dossier
 * (topic, evidence, urgency, theme), the ideas in English and the game
 * modules, so the client view gets plain rows. A translation that no longer
 * matches its Bangla original (data/desh.ts → ideasFor) stops the build.
 */
export function ProblemPixels() {
  const items: PixelProblem[] = sourcePoints.map((p) => {
    const ideas = PROBLEM_IDEAS[p.n];
    const original = ideasFor(p.n);
    if (
      !ideas ||
      !original ||
      ideas.doThis.length !== original.doThis.length ||
      ideas.avoid.length !== original.avoid.length ||
      !ideas.fact !== !original.fact
    ) {
      throw new Error(`Problem ${p.n}: the English ideas do not match the original`);
    }
    const game = modules.find((m) => m.n === p.n);
    return {
      n: p.n,
      title: p.topic,
      interpretation: p.interpretation,
      theme: p.theme,
      urgency: p.urgency,
      status: p.status,
      statusNote: p.statusNote,
      ...ideas,
      game: game && { href: `/cholo-bangladesh-gori/module/${game.code}`, code: game.code, playable: game.simulation === "full" },
    };
  });
  return (
    <Section
      id="register"
      title="32 bad pixels, each with its evidence and its path"
      lede="Problems we found ourselves, checked against in-depth research. Filter by urgency, evidence or theme, then open one to see how well it is proven, what to do and what to avoid."
    >
      <ProblemPixelsView items={items} />
    </Section>
  );
}
