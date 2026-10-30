import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { PhotoCredit } from "@/components/bangladesh-landing/chapter-shell";
import { Fillet } from "@/components/research/kit";
import { btn } from "@/components/ui/section-kit";
import type { Photo } from "@/data/bangladesh";
import { TUS } from "@/data/nagorik";
import { ruralBackdrops } from "@/data/rural-life";
import { cn } from "@/lib/utils";

const PHOTO: Photo = { ...ruralBackdrops.farmerCow, alt: "A farmer walks with his cow beside a green paddy field" };

/**
 * The hub hero's pattern: a credited photograph edge to edge, a black card
 * cut into its bottom-right corner with the gold title, the page's line,
 * one measured figure and the two ways in. On a phone the card sits under
 * the photo, notched into its foot.
 */
export function NagorikHero() {
  return (
    <section aria-labelledby="nagorik-title" className="relative">
      <div className="relative">
        <div className="relative h-72 w-full overflow-hidden bg-bdnavy-900 sm:h-104 lg:h-[clamp(32rem,calc(100svh-13rem),42rem)]">
          <Image src={PHOTO.src} alt={PHOTO.alt} fill priority sizes="100vw" quality={90} className="object-cover" />
        </div>
        <div className="relative z-10 -mt-12 ml-6 rounded-tl-3xl bg-black pt-6 pr-gutter-x pl-5 sm:ml-auto sm:w-[min(40rem,calc(100%-3rem))] sm:pt-8 sm:pl-8 lg:absolute lg:right-0 lg:bottom-0 lg:mt-0 lg:w-auto lg:max-w-[min(46rem,56%)] lg:rounded-tl-4xl lg:pt-10 lg:pl-12">
          <Fillet corner="br" className="-top-6 right-0 size-6 lg:-top-8 lg:size-8" />
          <Fillet corner="br" className="top-6 -left-6 size-6 lg:top-auto lg:bottom-0 lg:-left-8 lg:size-8" />
          <h1 id="nagorik-title" className="hero-rise font-grotesk text-4xl leading-[1.08] font-bold tracking-tight text-balance text-signal-orange sm:text-5xl lg:text-6xl">
            Citizen Rights and Duties
          </h1>
          <p className="hero-rise mt-4 max-w-xl text-lg leading-relaxed text-pretty text-white/80 sm:text-xl" style={{ "--d": "120ms" } as CSSProperties}>
            A nation changes in its people&rsquo;s 24 hours.
          </p>
          <p className="hero-rise mt-6 flex max-w-xl items-baseline gap-4 border-l-2 border-signal-orange pl-4" style={{ "--d": "200ms" } as CSSProperties}>
            <span className="shrink-0 font-grotesk text-4xl leading-none font-bold whitespace-nowrap text-white tabular-nums sm:text-5xl">
              {TUS.day.women.unpaid}
              <span className="text-2xl sm:text-3xl"> h</span>
            </span>
            <span className="text-sm leading-relaxed text-white/80 sm:text-base">
              of unpaid care and housework in a woman&rsquo;s average day. A man&rsquo;s: {TUS.day.men.unpaid} hours.{" "}
              <span className="text-white/65">BBS {TUS.survey}</span>
            </span>
          </p>
          <div className="hero-rise mt-7 flex flex-wrap gap-3 pb-1 sm:mt-8" style={{ "--d": "280ms" } as CSSProperties}>
            <Link href="#rights" className={btn.gold}>
              Know your rights
            </Link>
            <Link href="#pledge" className={cn(btn.goldOutline, "bg-bdnavy-900")}>
              Take the pledge
            </Link>
          </div>
        </div>
      </div>
      <PhotoCredit photo={PHOTO} className="px-gutter-x pt-5 lg:absolute lg:bottom-4 lg:left-gutter-x lg:z-10 lg:max-w-[calc(44%-4rem)] lg:rounded-2xl lg:bg-black lg:px-4 lg:py-3" />
    </section>
  );
}
