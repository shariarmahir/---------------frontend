"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { Icon } from "@/components/ui/icon";

const TIERS = [
  {
    id: "citizen",
    icon: "favorite",
    iconClass: "text-signal-orange",
    title: "Citizen / Patient",
    blurb:
      "Personalized vitals sync with Aponjon band, priority telemedicine queue, and local pharmacy digital lockers.",
    tier: "TIER: CITIZEN NODE",
    accent: "var(--color-signal-orange)",
  },
  {
    id: "researcher",
    icon: "memory",
    iconClass: "text-emerald-600",
    title: "Researcher / Engineer",
    blurb:
      "Hardware SDK access, RISC-V 28nm simulation specs, 10-Crore Bengali multimodal training datasets & cleanroom tokens.",
    tier: "TIER: FAB DEV KIT ACCESS",
    accent: "var(--color-emerald-600)",
  },
  {
    id: "provider",
    icon: "local_pharmacy",
    iconClass: "text-teal-600",
    title: "Healthcare Provider / Clinic",
    blurb:
      "Rural Pharmacy Node onboarding, certified diagnostic device whitelist, automated doctor video triage & API keys.",
    tier: "TIER: CLINIC PARTNER",
    accent: "var(--color-teal-600)",
  },
];

const DISTRICTS = [
  "Dhaka District",
  "Chittagong",
  "Sylhet",
  "Rangpur",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Mymensingh",
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
 * The headline is one line: the orange accent carries the emphasis, so
 * it no longer needs three lines of uppercase to land.
 */
export function KandariProfileSection() {
  const [tier, setTier] = useState("citizen");
  const emailId = useId();
  const districtId = useId();
  const headingId = useId();

  return (
    <section
      id="kandari-profile"
      className="section-band relative overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-gutter-x">
        <div className="flex flex-col overflow-hidden rounded-3xl border border-emerald-200/90 shadow-2xl">
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
            <div aria-hidden className="absolute inset-0 bg-slate-950/55" />

            <div className="relative flex max-w-4xl flex-col items-center gap-3 text-center">
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
          <div className="flex flex-1 flex-col gap-6 bg-white px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">Choose your profile tier</legend>
              <div className="flex flex-col gap-3 md:flex-row">
                {TIERS.map((item) => {
                  const active = tier === item.id;
                  return (
                    <label
                      key={item.id}
                      style={{ "--card-accent": item.accent } as React.CSSProperties}
                      className={`glass-card flex flex-1 cursor-pointer flex-col justify-between gap-3 rounded-2xl border p-4 ${
                        active
                          ? "border-signal-orange bg-amber-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <Icon
                            name={item.icon}
                            className={`text-2xl ${item.iconClass}`}
                          />
                          <input
                            type="radio"
                            name="profile_tier"
                            value={item.id}
                            checked={active}
                            onChange={() => setTier(item.id)}
                            className="size-4 accent-signal-orange focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
                          />
                        </div>
                        <span className="font-grotesk text-base font-bold text-slate-900">
                          {item.title}
                        </span>
                        <p className="font-sans text-xs leading-relaxed text-slate-600">
                          {item.blurb}
                        </p>
                      </div>

                      <span
                        className={`border-t pt-2 font-mono text-[10px] font-semibold uppercase ${
                          active
                            ? "border-signal-orange/30 text-amber-700"
                            : "border-slate-200 text-slate-500"
                        }`}
                      >
                        {item.tier}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* Sync form. */}
            <form
              aria-labelledby={headingId}
              className="flex flex-col gap-2.5 sm:flex-row"
            >
              <div className="flex-1">
                <label htmlFor={emailId} className="sr-only">
                  Telemetry email address
                </label>
                <input
                  id={emailId}
                  type="email"
                  required
                  placeholder="> enter_telemetry_email@domain.bd"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 font-mono text-xs text-slate-900 transition-colors placeholder:text-slate-500 focus:border-signal-orange focus:bg-white focus:ring-3 focus:ring-signal-orange/30 focus:outline-none"
                />
              </div>

              <div className="sm:w-48">
                <label htmlFor={districtId} className="sr-only">
                  District
                </label>
                <select
                  id={districtId}
                  className="w-full cursor-pointer rounded-xl border border-slate-300 bg-slate-50 px-4 py-3.5 font-mono text-xs text-slate-900 focus:border-signal-orange focus:ring-3 focus:ring-signal-orange/30 focus:outline-none"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-signal-orange px-6 py-3.5 font-grotesk text-xs font-bold text-white uppercase shadow-glow-orange transition-all hover:-translate-y-0.5 hover:bg-amber-600 focus-visible:ring-3 focus-visible:ring-signal-orange/40 focus-visible:outline-none sm:text-sm"
              >
                <Icon name="sync" className="text-base" />
                Sync Profile
              </button>
            </form>

          </div>
        </div>
      </div>
    </section>
  );
}
