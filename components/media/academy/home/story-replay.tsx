"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { useAuth } from "@/lib/auth/client";
import { AcademyStory } from "../shell/academy-story";

/** A picture with a play button that replays the academy's opening story. */
export function StoryReplay() {
  const reduce = useReducedMotion();
  const { account } = useAuth();
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setPlaying(true)} className="group relative block aspect-16/10 w-full overflow-hidden rounded-3xl ring-1 ring-white/12 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-signal-orange">
        <Image src="/media/team-cricket.webp" alt="" fill sizes="(min-width: 1024px) 560px, 92vw" className="object-cover object-[50%_60%] transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none" />
        <span className="absolute inset-x-0 bottom-0 bg-text-primary px-5 py-3 text-left text-sm font-bold text-white">
          ভর্তি → শেখা → প্রমাণ → কাজ <span className="text-signal-orange">· গল্পটা দেখুন</span>
        </span>
        <span className="absolute top-[calc(50%-1.4rem)] left-1/2 grid -translate-1/2 place-items-center">
          {!reduce && <motion.span className="absolute size-20 rounded-full bg-signal-orange/50" animate={{ scale: [1, 1.5], opacity: [0.7, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }} aria-hidden />}
          <span className="relative grid size-18 place-items-center rounded-full bg-signal-orange text-text-primary shadow-[0_12px_30px_-10px_var(--color-signal-orange)] transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
            <Play className="ml-1 size-8 fill-current" aria-hidden />
          </span>
        </span>
        <span className="sr-only">একাডেমির গল্পটা দেখুন</span>
      </button>
      {playing && <AcademyStory role="learner" name={account?.name} onDone={() => setPlaying(false)} />}
    </>
  );
}
