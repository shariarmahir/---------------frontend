"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { hasWebGL } from "@/lib/webgl";

const HeroScene = dynamic(
  () => import("./hero-scene").then((mod) => mod.HeroScene),
  { ssr: false },
);

export function HeroSection() {
  // Both flags must start out matching the server-rendered markup (no
  // window access during SSR) and only pick up the real browser values
  // after mount, otherwise React logs a hydration mismatch.
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Intentional: hasWebGL()/isMobile are real browser-only capability
    // checks that must run post-mount to avoid a server/client hydration
    // mismatch. Moving this into a lazy useState initializer (the fix the
    // rule implicitly wants) was tried and reverted in Task 7 because it
    // reads `window` during hydration itself and produces a genuine
    // "Hydration failed" error — strictly worse than this lint finding.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebglSupported(hasWebGL());
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="relative aspect-[16/6] w-full overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-slate-900 min-h-[420px]">
      {webglSupported && (
        <div className="absolute inset-0">
          <HeroScene particleCount={isMobile ? 40 : 120} />
        </div>
      )}

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-start justify-center gap-5 px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl font-extrabold text-title drop-shadow-sm sm:text-4xl md:text-5xl lg:text-6xl max-w-2xl">
          Charting Bangladesh&apos;s Next Chapter
        </h1>
        <p className="max-w-xl text-base text-white/90 sm:text-lg">
          Kandari Lab connects talent, training, and opportunity to build a
          more prosperous Bangladesh — one Kandari at a time.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="bg-title text-white hover:bg-title/90" asChild>
            <a href="#download">Download App</a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
            asChild
          >
            <a href="#mission">Explore Kandari</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
