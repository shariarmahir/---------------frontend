import { Section } from "@/components/bangladesh-landing/kit";
import { sourcePoints } from "@/data/amar-bangladesh";
import { PROBLEM_IDEAS } from "@/data/bangladesh-problems";
import { ProblemPixelsView, type PixelProblem } from "./problem-pixels-view";

/**
 * The 32 problems, pixel by pixel. Built on the server from the dossier
 * (topic, evidence, urgency, theme) and the ideas in English, so the client
 * view gets plain rows. A problem without ideas stops the build.
 */
export function ProblemPixels() {
  const items: PixelProblem[] = sourcePoints.map((p) => {
    const ideas = PROBLEM_IDEAS[p.n];
    if (!ideas) throw new Error(`Problem ${p.n}: no ideas`);
    return {
      n: p.n,
      title: p.topic,
      interpretation: p.interpretation,
      theme: p.theme,
      urgency: p.urgency,
      status: p.status,
      statusNote: p.statusNote,
      ...ideas,
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
