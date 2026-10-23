'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeroCanvas } from './HeroCanvas';
import { useCollageAssets } from './useCollageAssets';
import { HeroSection as PhotoHero } from '@/components/sections/hero-section';
import { btn } from '@/components/ui/section-kit';

/**
 * The animated collage hero.
 *
 * The canvas carries the photographs; the claim sits on top of it as real
 * HTML so it stays selectable, translatable and reachable by a screen
 * reader. The headline only resolves once the camera has settled (12s in),
 * which is when the brief wants the words to land.
 *
 * Until the collage has been sliced (`npm run slice:hero`), the photo hero
 * the page already had stays in place, so the landing page is never an
 * empty black band.
 */
export function HeroSection() {
  const assets = useCollageAssets();
  const [phase, setPhase] = useState("pixel-intro");
  const resolved = phase === "settle" || phase === "idle";

  if (assets !== "ready") {
    return <PhotoHero />;
  }

  return (
    <section
      id="overview-mission"
      className="relative w-full bg-black"
      aria-labelledby="hero-headline"
    >
      {/* ── The scene ─────────────────────────────────────────── */}
      <div
        id="hero-canvas"
        className="relative w-full overflow-hidden bg-black"
        style={{ aspectRatio: "16 / 6" }}
      >
        {/* The canvas fills the band. On tablet the band goes 16:8. */}
        <div className="absolute inset-0">
          <HeroCanvas onPhaseChange={setPhase} />
        </div>

        {/* The scrim, only behind the text area. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.72) 28%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0) 78%)",
          }}
        />

        {/* A very light vignette, in CSS rather than in WebGL. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ boxShadow: "inset 0 0 180px 60px rgba(0,0,0,0.25)" }}
        />

        {/* ── The claim ───────────────────────────────────────── */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-gutter-x">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={
                resolved
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 24 }
              }
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="flex max-w-[42rem] flex-col items-start gap-space-sm"
            >
              <h1
                id="hero-headline"
                className="font-grotesk text-4xl leading-[1.05] font-bold tracking-tight text-signal-orange sm:text-5xl lg:text-6xl"
              >
                কান্ডারী ল্যাব
              </h1>

              <p className="max-w-[34ch] font-sans text-body-md leading-relaxed text-white/85 sm:text-body-lg">
                বাংলাদেশের সমস্যা, বাংলাদেশের সমাধান।
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-space-xs">
                <Link
                  href="#apps"
                  className={`${btn.gold} transition-[transform,box-shadow] duration-300 hover:-translate-y-[3px] hover:shadow-[0_10px_30px_-8px_rgba(228,176,39,0.55)]`}
                >
                  অ্যাপ ডাউনলোড করো
                </Link>

                <Link
                  href="#kandari-profile"
                  className={`${btn.goldOutline} transition-[transform,box-shadow] duration-300 hover:-translate-y-[3px] hover:shadow-[0_10px_30px_-8px_rgba(228,176,39,0.45)]`}
                >
                  কান্ডারী প্রোফাইল বানাও
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
