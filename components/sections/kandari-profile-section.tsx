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
    tile: "bg-signal-orange text-text-primary",
    title: "Citizen / Patient",
    blurb:
      "Personalized vitals sync with Aponjon band, priority telemedicine queue, and local pharmacy digital lockers.",
    tier: "TIER: CITIZEN NODE",
  },
  {
    id: "researcher",
    icon: "memory",
    tile: "bg-bd-green text-white",
    title: "Researcher / Engineer",
    blurb:
      "Hardware SDK access, RISC-V 28nm simulation specs, 10-Crore Bengali multimodal training datasets & cleanroom tokens.",
    tier: "TIER: FAB DEV KIT ACCESS",
  },
  {
    id: "provider",
    icon: "local_pharmacy",
    tile: "bg-text-primary text-signal-orange ring-1 ring-white/20",
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
 * The lower half is the page's gold action panel: tiers are white tiles and
 * the chosen one turns ink, the same inversion the header uses for the
 * current section.
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
          <div className="relative isolate flex flex-1 flex-col gap-6 bg-signal-orange px-6 py-8 text-text-primary sm:px-10 lg:px-12 lg:py-10">
            <fieldset className="flex flex-col gap-3">
              <legend className="sr-only">Choose your profile tier</legend>
              <div className="flex flex-col gap-3 md:flex-row">
                {TIERS.map((item) => {
                  const active = tier === item.id;
                  return (
                    <label
                      key={item.id}
                      className={cn(
                        "group relative flex flex-1 cursor-pointer flex-col justify-between gap-3 rounded-2xl p-4",
                        "transition-[transform,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                        "has-focus-visible:ring-2 has-focus-visible:ring-text-primary has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-signal-orange",
                        active
                          ? "bg-text-primary text-white shadow-ink"
                          : "bg-white text-text-primary shadow-tile ring-1 ring-text-primary/10 hover:shadow-tile-lift",
                      )}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className={cn("grid size-10 place-items-center rounded-xl", item.tile)}>
                            <Icon name={item.icon} className="text-2xl" />
                          </span>
                          <input
                            type="radio"
                            name="profile_tier"
                            value={item.id}
                            checked={active}
                            onChange={() => setTier(item.id)}
                            className="size-4 accent-signal-orange focus-visible:outline-none"
                          />
                        </div>
                        <span className="font-grotesk text-base font-bold">{item.title}</span>
                        <p className={cn("font-sans text-xs leading-relaxed", active ? "text-white/75" : "text-text-secondary")}>
                          {item.blurb}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "border-t pt-2 font-mono text-[10px] font-semibold uppercase",
                          active ? "border-white/15 text-signal-orange" : "border-text-primary/10 text-text-muted",
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
                  className="w-full rounded-xl bg-white px-4 py-3.5 font-mono text-xs text-text-primary shadow-tile ring-1 ring-text-primary/15 transition-shadow placeholder:text-text-muted focus:ring-2 focus:ring-text-primary focus:outline-none"
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
                  className="w-full cursor-pointer rounded-xl bg-white px-4 py-3.5 font-mono text-xs text-text-primary shadow-tile ring-1 ring-text-primary/15 focus:ring-2 focus:ring-text-primary focus:outline-none"
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
                className={cn(btn.ink, "shrink-0 focus-visible:ring-offset-signal-orange")}
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
