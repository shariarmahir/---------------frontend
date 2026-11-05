import Image from "next/image";
import Link from "next/link";
import { JOIN } from "@/data/motherland";
import { cn } from "@/lib/utils";
import { ANCHOR, pill } from "./kit";
import { RiseText } from "./rise-text";
import { ScrollFill } from "./scroll-fill";

/**
 * The closing call before the footer: Mahir's words over the flag painted
 * on a schoolyard, Nazrul's line set large in gold, the question inking
 * itself in as it is read, and the one button the whole page leads to.
 */
export function Join() {
  return (
    <section id="join" aria-labelledby="join-title" className={cn(ANCHOR, "relative isolate overflow-hidden bg-ml-deep py-28 text-white sm:py-40")}>
      <Image src={JOIN.picture.src} alt="" fill sizes="100vw" className="-z-20 object-cover opacity-35" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-linear-to-b from-ml-deep/75 via-ml-deep/92 to-ml-deep" />

      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 text-lg leading-relaxed text-white/85 sm:px-10 sm:text-xl">
        <RiseText id="join-title" text={JOIN.title} className="text-center font-ml-display text-[clamp(3.5rem,9vw,7rem)] leading-[0.9] tracking-[0.01em] text-white uppercase" />

        <p className="mt-6">{JOIN.opening}</p>
        <blockquote className="border-l-4 border-signal-orange py-1 pl-6">
          <p lang="bn" className="font-bengali text-[clamp(2rem,5vw,3.5rem)] leading-tight font-bold text-signal-orange">
            {JOIN.spark.line}
          </p>
          <footer className="mt-2 text-base text-white/65">{JOIN.spark.source}</footer>
        </blockquote>
        {JOIN.paragraphs.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}

        <p className="mt-6 font-bold text-signal-orange">{JOIN.ask}</p>
        <ScrollFill tone="dark" text={JOIN.question} className="-mt-4 text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.3] font-semibold" />

        {JOIN.close.map((p, i) => (
          <p key={p.slice(0, 24)} className={cn(i === JOIN.close.length - 1 && "text-2xl font-bold text-white sm:text-3xl")}>
            {p}
          </p>
        ))}

        <Link href={JOIN.cta.href} className={cn(pill.onDark, "mt-6 min-h-16 self-center px-10 text-lg sm:text-xl")}>
          {JOIN.cta.label}
        </Link>
      </div>
    </section>
  );
}
