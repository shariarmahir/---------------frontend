"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { PixelMark, btn } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";
import { districts } from "@/data/districts";
import { useAuth } from "@/lib/auth/client";

const TIERS = [
  {
    id: "citizen",
    icon: "favorite",
    surface: "bg-signal-orange text-text-primary",
    radio: "accent-text-primary",
    tile: "bg-text-primary text-signal-orange",
    title: "Citizen / Patient",
    blurb:
      "Personalized vitals sync with Aponjon band, priority telemedicine queue, and local pharmacy digital lockers.",
    tier: "TIER: CITIZEN NODE",
  },
  {
    id: "researcher",
    icon: "memory",
    surface: "bg-text-primary text-white",
    radio: "accent-signal-orange",
    tile: "bg-bdgreen-500 text-text-primary",
    title: "Researcher / Engineer",
    blurb:
      "Hardware SDK access, RISC-V 28nm simulation specs, 10-Crore Bengali multimodal training datasets & cleanroom tokens.",
    tier: "TIER: FAB DEV KIT ACCESS",
  },
  {
    id: "provider",
    icon: "local_pharmacy",
    surface: "bg-bdorange-600 text-text-primary",
    radio: "accent-text-primary",
    tile: "bg-text-primary text-signal-orange",
    title: "Healthcare Provider / Clinic",
    blurb:
      "Rural Pharmacy Node onboarding, certified diagnostic device whitelist, automated doctor video triage & API keys.",
    tier: "TIER: CLINIC PARTNER",
  },
];

/**
 * Join Kandari Profile — the subscriber conversion section.
 *
 * ── Two halves, not one photographic panel ───────────────────────────
 *
 * The section is a vertical flex column of two containers:
 *
 *   Top half     the photograph, carrying only a one-line headline.
 *   Bottom half  a solid surface carrying the tiers and the sync form.
 *
 * Previously everything floated over the image in one centred column,
 * which put the email field and district select directly on a busy
 * photograph. Form controls need a stable surface to read as inputs, so
 * the lower half leaves the image behind entirely rather than dimming
 * it further — dimming would have cost the photograph without buying
 * the inputs much legibility.
 *
 * The headline is one line: the gold accent carries the emphasis, so
 * it no longer needs three lines of uppercase to land.
 *
 * The lower half is a solid bottle-green panel. Each tier is a solid colour
 * card like the Pixel-Map cards (gold, ink, orange); the chosen one lifts and
 * takes an ink frame.
 */
export function KandariProfileSection() {
  const [tier, setTier] = useState("citizen");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const router = useRouter();
  const { account } = useAuth();
  const emailId = useId();
  const districtId = useId();
  const headingId = useId();

  return (
    <section
      id="kandari-profile"
      className="section-band relative overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-gutter-x">
        <div className="story-reveal flex flex-col overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-40px_var(--color-text-primary)] ring-1 ring-text-primary/15">
          {/* ── Top half — photograph + single-line headline ───────── */}
          {/* The photograph is 720×467 (≈3:2). The container tracks that
              ratio closely so `object-cover` has almost nothing to crop —
              previously this was a fixed 15rem-tall band, roughly 8:1 at
              desktop width, which cut away most of the image's height. */}
          <div className="relative flex aspect-3/2 max-h-[35rem] w-full flex-1 items-center justify-center overflow-hidden px-6 py-10 sm:aspect-5/3 sm:px-10 lg:aspect-video lg:px-12">
            <Image
              src="/sections/Bangladesh.jpg"
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              quality={90}
              className="object-cover object-center"
            />
            {/* Scrim. The headline is white over a bright sky, so it
                needs a floor under its luminance. */}
            <div aria-hidden className="absolute inset-0 bg-linear-to-b from-text-primary/60 via-text-primary/50 to-text-primary/75" />

            <div className="relative flex max-w-4xl flex-col items-center gap-3 text-center">
              <PixelMark tone="dark" />
              <h2
                id={headingId}
                className="font-grotesk text-2xl leading-tight font-bold tracking-tight text-balance text-white uppercase sm:text-3xl lg:text-4xl"
              >
                Join Kandari Profile for{" "}
                <span className="text-signal-orange">breakthrough R&amp;D</span>
              </h2>
              <p className="max-w-2xl font-sans text-sm leading-relaxed text-white/85 sm:text-base">
                Activate your Kandari Node for clinical telemetry updates,
                hardware dev kits, and early software releases.
              </p>
            </div>
          </div>

          {/* ── Bottom half — tiers + sync form ────────────────────── */}
          <div className="relative isolate flex flex-1 flex-col gap-6 bg-bd-green px-6 py-8 text-white sm:px-10 lg:px-12 lg:py-10">
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">Choose your profile tier</legend>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
                {TIERS.map((item) => {
                  const active = tier === item.id;
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "group relative grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-x-3 rounded-2xl p-3.5 sm:flex sm:flex-1 sm:flex-col sm:items-stretch sm:justify-between sm:gap-3 sm:p-4",
                        "[-webkit-tap-highlight-color:transparent] touch-manipulation transition-[translate,scale,rotate,transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.98] active:duration-150 motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
                        "has-focus-visible:ring-2 has-focus-visible:ring-white has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-bd-green",
                        item.surface,
                        // The chosen tier is lifted and framed in dark ink; the
                        // radio inside still carries the state for assistive tech.
                        active
                          ? "-translate-y-1 shadow-ink ring-4 ring-text-primary"
                          : "shadow-tile hover:shadow-tile-lift",
                      )}
                    >
                      <div className="contents sm:flex sm:flex-col sm:gap-2">
                        <div className="contents sm:flex sm:items-center sm:justify-between">
                          <span className={cn("col-start-1 row-span-3 row-start-1 grid size-11 place-items-center rounded-xl sm:size-10", item.tile)}>
                            <Icon name={item.icon} className="text-xl sm:text-2xl" />
                          </span>
                          <input
                            type="radio"
                            name="profile_tier"
                            value={item.id}
                            checked={active}
                            onChange={() => setTier(item.id)}
                            className={cn("col-start-3 row-span-3 row-start-1 size-4 focus-visible:outline-none", item.radio)}
                          />
                        </div>
                        <span className="col-start-2 font-grotesk text-base leading-tight font-bold">{item.title}</span>
                        <p className="col-start-2 mt-1 font-sans text-xs leading-relaxed sm:mt-0">
                          {item.blurb}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "col-start-2 mt-2 border-t border-current/20 pt-2 font-mono text-[10px] leading-tight font-semibold uppercase sm:mt-0",
                        )}
                      >
                        {item.tier}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Sync form. */}
            {/* Starts sign-up with what was entered here; a member goes to their account. */}
            <form
              aria-labelledby={headingId}
              className="flex flex-col gap-2.5 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                if (account) {
                  router.push("/account");
                  return;
                }
                const q = new URLSearchParams({ role: tier });
                if (email.trim()) q.set("email", email.trim());
                if (district) q.set("district", district);
                router.push(`/signup?${q}`);
              }}
            >
              <div className="flex-1">
                <label htmlFor={emailId} className="sr-only">
                  Telemetry email address
                </label>
                <input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="> enter_email@domain.bd (ঐচ্ছিক)"
                  className="w-full rounded-xl bg-signal-orange px-4 py-3.5 font-mono text-xs text-text-primary shadow-tile transition-shadow placeholder:text-text-primary/75 focus:ring-2 focus:ring-white focus:outline-none"
                />
              </div>

              <div className="sm:w-48">
                <label htmlFor={districtId} className="sr-only">
                  District
                </label>
                <select
                  id={districtId}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full cursor-pointer rounded-xl bg-signal-orange px-4 py-3.5 font-mono text-xs text-text-primary shadow-tile focus:ring-2 focus:ring-white focus:outline-none"
                >
                  <option value="">জেলা বেছে নিন</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className={cn(btn.ink, "shrink-0 focus-visible:ring-offset-bd-green")}
              >
                <Icon name={account ? "account_circle" : "sync"} className="text-base text-signal-orange" />
                {account ? "My Profile" : "Join Profile"}
              </button>
            </form>

          </div>
        </div>
      </div>
    </section>
  );
}
