"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import type { TeamMember } from "@/data/team";
import { cn } from "@/lib/utils";
import { ABOUT_FIELDS, OFFSET_CARD } from "./offset";

/** How long each member stays before the next comes in. */
const TURN_MS = 8000;

/**
 * The crew, one member at a time, on a full-width navy band cut like the
 * "who we are" band above it: a short band, the member's name, role and
 * what they work on towards the goal on the left, their portrait (or
 * initials) on the right on an ink card with a cobalt block behind it.
 * The words are the team roster's description (data/team.ts), not a
 * quotation, so they carry no quote marks. The band turns on its own every
 * few seconds; a pointer or keyboard focus on it holds it still, and the
 * dots pick a member. Under reduced motion it never turns on its own.
 */
export function CrewVoices({ members }: { members: TeamMember[] }) {
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const member = members[index];

  useEffect(() => {
    if (held || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % members.length), TURN_MS);
    return () => window.clearTimeout(timer);
  }, [index, held, members.length]);

  return (
    <section
      id="crew"
      aria-labelledby="crew-title"
      aria-roledescription="carousel"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false);
      }}
      className="scroll-mt-header bg-bdnavy-900 text-white lg:scroll-mt-header-lg"
    >
      <div className="mx-auto grid min-h-72 max-w-7xl items-center gap-10 px-gutter-x py-10 md:grid-cols-[minmax(0,1fr)_auto] lg:min-h-80 lg:gap-16">
        {/* The band's name, for screen readers; on screen the members speak for it. */}
        <h2 id="crew-title" className="sr-only">
          The crew behind the goal
        </h2>

        <div className="flex min-w-0 flex-col gap-6 md:min-h-64 md:justify-center">
          {/* The roster's own description of the member's work, not a quotation of them. */}
          <div key={`text-${member.slug}`} aria-live={held ? "polite" : "off"} className="catalog-fade flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-grotesk text-3xl leading-[1.1] font-bold tracking-tight text-signal-orange sm:text-4xl">{member.name}</h3>
              <p className="font-grotesk text-base font-bold text-white">{member.role}</p>
            </div>
            <p className="max-w-2xl font-sans text-base leading-relaxed text-white/80 sm:text-lg">{member.about}</p>
            <Link
              href={`/team/${member.slug}`}
              className="w-fit rounded-md font-grotesk text-sm font-bold text-signal-orange underline decoration-signal-orange/40 underline-offset-4 hover:decoration-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
            >
              {member.name.split(" ")[0]}&rsquo;s profile
            </Link>
          </div>

          <ul aria-label="Crew members" className="-ml-2 flex flex-wrap gap-1">
            {members.map((m, i) => (
              <li key={m.slug}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`${m.name}, ${m.role}`}
                  aria-current={i === index}
                  className="group/dot grid size-8 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                >
                  <span
                    className={cn(
                      "block h-2.5 rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                      i === index ? "w-6 bg-signal-orange" : "w-2.5 bg-white/35 group-hover/dot:bg-white/70",
                    )}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div key={`photo-${member.slug}`} className="catalog-fade mx-auto w-56 sm:w-60 md:mr-3 xl:w-64">
          <div style={{ "--offset": ABOUT_FIELDS.ink.offset } as CSSProperties} className={cn(OFFSET_CARD, "relative aspect-4/5 overflow-hidden bg-text-primary")}>
            {member.photo ? (
              <Image src={member.photo} alt={member.name} fill sizes="256px" className="object-cover object-top" />
            ) : (
              <span aria-hidden className="absolute inset-0 grid place-items-center font-grotesk text-6xl font-bold text-signal-orange">
                {member.initials}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
