import { AT_A_GLANCE } from "@/data/bangladesh";
import { FactCard, Section } from "./kit";

/** 2 · At a glance: six sourced facts. */
export function LandingAtAGlance() {
  return (
    <Section id="at-a-glance" title="At a glance">
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {AT_A_GLANCE.map((f) => (
          <li key={f.label}>
            <FactCard fact={f} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
