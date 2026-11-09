import Image from "next/image";
import Link from "next/link";
import { JOIN } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, COLUMN, pill } from "./kit";
import { RiseText } from "./rise-text";
import { ScrollFill } from "./scroll-fill";

/**
 * The closing promise before the footer, as a manifesto: on the left, held in view, the title,
 * Nazrul's line in gold and the one button the whole page leads to; on the right Mahir's words,
 * the question inking itself in as it is read. Behind it the flag painted on a schoolyard, turned
 * to a navy monochrome, with two slow glows of gold and flag green drifting across (.ml-aurora).
 */
export function Join() {
  return (
    <section id="join" aria-labelledby="join-title" className={cn(ANCHOR, "relative isolate overflow-clip bg-ml-navy py-24 text-white sm:py-32 lg:py-40")}>
      <Image src={JOIN.picture.src} alt="" fill sizes="100vw" className="-z-30 object-cover opacity-25 mix-blend-luminosity grayscale" />
      <div aria-hidden className="ml-aurora absolute inset-0 -z-20" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_45%,transparent_20%,var(--color-ml-navy)_80%)]" />

      <div className={cn(COLUMN, "grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-24")}>
        <div className="flex flex-col gap-10 lg:sticky lg:top-44 lg:self-start">
          <RiseText id="join-title" text={JOIN.title} className="text-[clamp(2.75rem,5.6vw,5.25rem)] leading-[1.08] font-extrabold tracking-[-0.04em] text-white" />
          <blockquote className="flex flex-col gap-3">
            <p lang="bn" className="font-bengali text-[clamp(2rem,3.6vw,3.25rem)] leading-tight font-bold text-signal-orange">
              {JOIN.spark.line}
            </p>
            <footer className="text-base text-white/65">{JOIN.spark.source}</footer>
          </blockquote>
          <Link href={JOIN.cta.href} className={cn(pill.onDark, "min-h-16 self-start px-10 text-lg")}>
            {JOIN.cta.label}
          </Link>
        </div>

        <div className="flex flex-col gap-7 text-lg leading-relaxed text-white/85 sm:text-xl">
          <p>{JOIN.opening}</p>
          {JOIN.paragraphs.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <div className="flex flex-col gap-3 border-l-2 border-signal-orange pl-6">
            <p className="font-bold text-signal-orange">{JOIN.ask}</p>
            <ScrollFill tone="dark" text={JOIN.question} className="text-[clamp(1.6rem,2.8vw,2.4rem)] leading-[1.3] font-semibold" />
          </div>
          {JOIN.close.map((p, i) => (
            <p key={p.slice(0, 24)} className={cn(i === JOIN.close.length - 1 && "text-2xl font-bold text-white sm:text-3xl")}>
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
