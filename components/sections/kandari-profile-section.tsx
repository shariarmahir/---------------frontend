"use client";

import Image from "next/image";
import { useState } from "react";
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
    tierClass: "text-signal-orange",
  },
  {
    id: "researcher",
    icon: "memory",
    iconClass: "text-emerald-300",
    title: "Researcher / Engineer",
    blurb:
      "Hardware SDK access, RISC-V 28nm simulation specs, 10-Crore Bengali multimodal training datasets & cleanroom tokens.",
    tier: "TIER: FAB DEV KIT ACCESS",
    tierClass: "text-emerald-300",
  },
  {
    id: "provider",
    icon: "local_pharmacy",
    iconClass: "text-teal-300",
    title: "Healthcare Provider / Clinic",
    blurb:
      "Rural Pharmacy Node onboarding, certified diagnostic device whitelist, automated doctor video triage & API keys.",
    tier: "TIER: CLINIC PARTNER",
    tierClass: "text-teal-300",
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

export function KandariProfileSection() {
  const [tier, setTier] = useState("citizen");

  return (
    <section
      id="kandari-profile"
      className="relative overflow-hidden py-section-y"
    >
      <div className="relative mx-auto max-w-7xl px-gutter-x">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-200/90 shadow-2xl">
          {/* Photographic backdrop, shown clear — no green wash. Only a
              light neutral scrim remains, which the white copy needs to
              stay readable over the bright sky in the upper half. */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/sections/Bangladesh.jpg"
              alt=""
              aria-hidden
              fill
              sizes="100vw"
              quality={90}
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-slate-950/45" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center space-y-8 p-6 text-center text-white sm:p-10 lg:p-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-national-crimson/90 px-3.5 py-1 font-mono text-xs font-bold tracking-widest text-white uppercase shadow-md">
              <span className="size-2 animate-pulse rounded-full bg-white" />
              Critical national initiative // Enrollment open
            </div>

            <div className="max-w-3xl space-y-3">
              <h2 className="font-grotesk text-2xl leading-tight font-bold tracking-tight text-white uppercase sm:text-3xl lg:text-4xl">
                Join Kandari Profile — stay connected with{" "}
                <span className="text-signal-orange">breakthrough R&amp;D</span>{" "}
                and early product releases
              </h2>
              <p className="font-sans text-sm leading-relaxed text-emerald-100/90 sm:text-base">
                Whether you are a deep-tech researcher, healthcare enterprise,
                angel investor, or proud citizen, activate your Kandari Node to
                receive clinical telemetry updates, hardware dev kits, and
                software APK releases.
              </p>
            </div>

            {/* Tier selection. */}
            <div className="-m-2 flex w-full flex-wrap text-left">
              {TIERS.map((item) => (
                <div key={item.id} className="flex w-full p-2 md:w-1/3">
                  <label
                    className={`flex w-full cursor-pointer flex-col justify-between rounded-2xl border p-4 transition-all ${
                      tier === item.id
                        ? "border-signal-orange/70 bg-slate-950/70"
                        : "border-white/20 bg-slate-950/55 hover:bg-slate-950/70"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Icon
                          name={item.icon}
                          className={`text-2xl ${item.iconClass}`}
                        />
                        <input
                          type="radio"
                          name="profile_tier"
                          checked={tier === item.id}
                          onChange={() => setTier(item.id)}
                          className="size-4 border-white/40 bg-transparent text-signal-orange focus:ring-signal-orange"
                        />
                      </div>
                      <div className="font-grotesk text-base font-bold text-white">
                        {item.title}
                      </div>
                      <p className="font-sans text-xs leading-relaxed text-emerald-100/80">
                        {item.blurb}
                      </p>
                    </div>

                    <div
                      className={`mt-3 border-t border-white/10 pt-2 font-mono text-[10px] font-semibold uppercase ${item.tierClass}`}
                    >
                      {item.tier}
                    </div>
                  </label>
                </div>
              ))}
            </div>

            {/* Sync form. */}
            <form className="flex w-full max-w-2xl flex-col gap-2.5 pt-2 sm:flex-row">
              <div className="flex-1">
                <label htmlFor="telemetry-email" className="sr-only">
                  Telemetry email address
                </label>
                <input
                  id="telemetry-email"
                  type="email"
                  required
                  placeholder="> enter_telemetry_email@domain.bd"
                  className="w-full rounded-xl border border-white/20 bg-slate-950/60 px-4 py-3.5 font-mono text-xs text-white shadow-inner placeholder:text-emerald-100/70 focus:bg-slate-950/80 focus:ring-2 focus:ring-signal-orange focus:outline-none"
                />
              </div>

              <div className="sm:w-48">
                <label htmlFor="district" className="sr-only">
                  District
                </label>
                <select
                  id="district"
                  className="w-full rounded-xl border border-white/20 bg-slate-900/90 px-4 py-3.5 font-mono text-xs text-white focus:ring-2 focus:ring-signal-orange focus:outline-none"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} className="bg-slate-900 text-white">
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-signal-orange px-6 py-3.5 font-grotesk text-xs font-bold text-white uppercase shadow-glow-orange transition-all hover:-translate-y-0.5 hover:bg-amber-600 sm:text-sm"
              >
                <Icon name="sync" className="text-base" />
                <span>Sync Profile</span>
              </button>
            </form>

            {/* Trust badges. */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 font-mono text-xs text-emerald-100 sm:gap-6">
              <span className="flex items-center gap-1.5">
                <Icon
                  name="verified_user"
                  className="text-sm text-signal-orange"
                />
                Sovereign Bangladesh hardware
              </span>
              <span className="hidden text-emerald-400/70 sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Icon name="lock" className="text-sm text-signal-orange" />
                Zero third-party cloud leak
              </span>
              <span className="hidden text-emerald-400/70 sm:inline">•</span>
              <span className="flex items-center gap-1.5">
                <Icon name="code" className="text-sm text-signal-orange" />
                Open R&amp;D architecture
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
