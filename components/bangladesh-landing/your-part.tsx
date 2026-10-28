import { Icon } from "@/components/ui/icon";
import { chapterById } from "@/data/bangladesh";
import { Card, ChapterLink, Section } from "./kit";

/* The citizen shield's first, middle and last rings, in English from the shield chapter (data/desh.ts, SHIELD_LAYERS). */
const STEPS = [
  {
    ring: "Yourself",
    icon: "person",
    promise: "Never pay or take a bribe. Never sell what is fake. Never spread a lie.",
    acts: ["No deal without a receipt", "Keep your word and your time", "No litter on the street"],
  },
  {
    ring: "Your neighbourhood",
    icon: "holiday_village",
    promise: "No one here faces trouble alone. We keep watch.",
    acts: ["Know who is sick, alone or old", "Keep a local price list and warn about fakes", "Lights at night and safe paths"],
  },
  {
    ring: "Your country",
    icon: "flag",
    promise: "Obey the law, pay tax, vote, and never stay silent in the face of wrong.",
    acts: ["Guard public property as your own", "Put your talent to work at home", "Respect those who disagree"],
  },
];

const DOORS = [
  { href: "/nagorik", icon: "balance", title: "Citizen rights and duties", body: "The rights the constitution guarantees, the paths to justice, and the duties each of us carries, from child to elder." },
  { href: "/protibad", icon: "campaign", title: "Report a problem", body: "Extortion, bribery, land grabbing, a service denied: find the authority that handles it and keep a public record." },
];

/** 8 · Your part: the shield from yourself to the country, and the two doors to act through today. */
export function LandingYourPart() {
  const c = chapterById("shield");
  return (
    <Section id="your-part" title={c.title} lede={c.lede} action={<ChapterLink chapter="shield" />}>
      <ol className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {STEPS.map((s, i) => (
          <li key={s.ring} className="relative">
            <Card surface="navy" className="h-full">
              <div className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-black text-signal-orange ring-1 ring-white/12">
                  <Icon name={s.icon} className="text-2xl!" />
                </span>
                <h3 className="font-grotesk text-xl font-bold text-signal-orange">
                  <span className="sr-only">Step {i + 1}: </span>
                  {s.ring}
                </h3>
              </div>
              <p className="mt-5 font-grotesk text-lg leading-snug font-semibold text-pretty text-white">{s.promise}</p>
              <ul className="mt-5 grid gap-2 border-t border-white/12 pt-5">
                {s.acts.map((a) => (
                  <li key={a} className="flex gap-2.5 text-sm leading-relaxed text-white/80">
                    <Icon name="check" className="mt-0.5 shrink-0 text-base! text-bdnavy-300" />
                    {a}
                  </li>
                ))}
              </ul>
            </Card>
            {i < STEPS.length - 1 && (
              <span aria-hidden className="absolute top-1/2 -right-5 z-10 hidden size-8 -translate-y-1/2 place-items-center rounded-full bg-black text-signal-orange lg:grid">
                <Icon name="arrow_forward" className="text-xl!" />
              </span>
            )}
          </li>
        ))}
      </ol>
      <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:mt-8 lg:gap-6">
        {DOORS.map((d) => (
          <li key={d.href}>
            <Card href={d.href} surface="ink" className="group flex h-full items-start gap-5">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-signal-orange text-text-primary">
                <Icon name={d.icon} className="text-2xl!" />
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="flex items-center gap-2 font-grotesk text-xl font-bold text-signal-orange">
                  {d.title}
                  <Icon name="arrow_forward" className="text-xl! transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </span>
                <span className="text-sm leading-relaxed text-white/80">{d.body}</span>
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
