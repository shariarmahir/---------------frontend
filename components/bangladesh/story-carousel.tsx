"use client";

import Image from "next/image";
import { useRef, useSyncExternalStore } from "react";
import { A11y, Autoplay, EffectCreative, Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/pagination";
import { Icon } from "@/components/ui/icon";
import type { Photo } from "@/data/bangladesh";
import { cn } from "@/lib/utils";

const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Stacked photo carousel for a history chapter.
 *
 * Adapted from Skiper UI "Carousel_005" (skiper51, by @gurvinder-singh02,
 * https://skiper-ui.com — attribution required by its free licence):
 * the same Swiper "creative" effect, where the outgoing photo sinks back
 * into the stack and the next slides in over it. Changes here: next/image
 * slides with caption and credit, keyboard + labelled controls, a slower
 * autoplay that pauses on hover and is off under reduced motion, and
 * brand-coloured pagination.
 */
export function StoryCarousel({
  photos,
  label,
  tone = "green",
}: {
  photos: Photo[];
  label: string;
  tone?: "green" | "red";
}) {
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(REDUCED).matches, () => true);
  const swiper = useRef<SwiperInstance | null>(null);
  const many = photos.length > 1;
  const accent = tone === "red" ? "#da291c" : "#ff9100";

  return (
    <div
      className="story-carousel relative"
      style={{ "--swiper-pagination-color": accent, "--swiper-pagination-bullet-inactive-color": "#94a3b8" } as React.CSSProperties}
    >
      <Swiper
        onSwiper={(s) => {
          swiper.current = s;
        }}
        effect="creative"
        grabCursor={many}
        centeredSlides
        slidesPerView={1}
        // Loop needs enough slides to clone; two photos just rewind.
        loop={photos.length >= 3}
        rewind={photos.length === 2}
        speed={900}
        autoplay={many && !reduced ? { delay: 4500, disableOnInteraction: true, pauseOnMouseEnter: true } : false}
        keyboard={{ enabled: true, onlyInViewport: true }}
        pagination={many ? { clickable: true } : false}
        a11y={{ prevSlideMessage: "আগের ছবি", nextSlideMessage: "পরের ছবি", paginationBulletMessage: "{{index}} নম্বর ছবিতে যান" }}
        creativeEffect={{
          prev: { shadow: true, translate: [0, 0, -400], opacity: 0.6 },
          next: { translate: ["100%", 0, 0] },
        }}
        modules={[EffectCreative, Pagination, Autoplay, Keyboard, A11y]}
        aria-label={label}
        className="h-[22rem] rounded-[2rem] pb-12! sm:h-[28rem] lg:h-[34rem]"
      >
        {photos.map((p, i) => (
          <SwiperSlide key={p.src} className="overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl">
            <Image
              src={p.src}
              alt={p.alt}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              priority={false}
              className="scale-105 object-cover"
              style={p.focus ? { objectPosition: p.focus } : undefined}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
              <p className="font-bengali text-sm leading-snug font-semibold text-white sm:text-base">{p.alt}</p>
              {many && (
                <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur-md">
                  {i + 1}/{photos.length}
                </span>
              )}
            </div>
            {p.credit && (
              <a
                href={p.credit.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-4 max-w-[70%] truncate rounded-md bg-slate-950/55 px-2 py-0.5 font-mono text-[10px] text-white/85 backdrop-blur-sm hover:underline"
              >
                © {p.credit.author} · {p.credit.license}
              </a>
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {many && (
        <div className="absolute right-3 bottom-0 z-10 flex gap-2">
          {(["prev", "next"] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => (dir === "prev" ? swiper.current?.slidePrev() : swiper.current?.slideNext())}
              aria-label={dir === "prev" ? "আগের ছবি" : "পরের ছবি"}
              className={cn(
                "flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-transparent hover:text-white focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none motion-reduce:hover:translate-y-0",
                tone === "red" ? "hover:bg-national-crimson" : "hover:bg-bd-green",
              )}
            >
              <Icon name={dir === "prev" ? "chevron_left" : "chevron_right"} className="text-[22px]!" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
