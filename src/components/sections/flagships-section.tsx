import { Icon } from "@/components/ui/icon";
import { SwastiPreview } from "./swasti-preview";
import {
  aponjonSensors,
  pharmacyCapabilities,
  swastiFeatures,
} from "@/data/flagships";
import { cn } from "@/lib/utils";

export function FlagshipsSection() {
  return (
    <section
      id="swasti"
      className="w-full border-b border-border bg-slate-50/60 py-space-xl"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-space-xl px-gutter">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-space-xs text-center">
          <span className="rounded-sm border border-emerald-200 bg-emerald-100 px-space-sm py-1 font-code-telemetry text-label-sm font-bold uppercase text-emerald-900">
            ACTIVE DEEP-TECH HARDWARE &amp; SOFTWARE SUITE
          </span>
          <h2 className="font-display text-headline-lg-mobile font-bold tracking-tight text-slate-900 sm:text-headline-lg">
            Pioneering Vanguard Deployments
          </h2>
          <p className="font-body-md text-body-md leading-relaxed text-slate-600">
            Engineered inside our Tejgaon facilities, deployed directly into
            sub-districts and rural primary healthcare centers across all 8
            administrative divisions.
          </p>
        </div>

        <article className="grid grid-cols-1 items-center gap-gutter rounded-2xl border border-border bg-white p-space-lg shadow-md lg:grid-cols-12">
          <div className="flex flex-col gap-space-md lg:col-span-6">
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="rounded-md bg-title px-space-sm py-1 font-display text-label-sm font-bold text-white shadow-xs">
                SUPER-APP PLATFORM
              </span>
              <span className="font-code-telemetry text-code-telemetry font-bold text-primary">
                স্বস্তি - SWASTI AI HEALTH
              </span>
            </div>
            <h3 className="font-display text-headline-lg-mobile font-bold leading-tight text-slate-900 sm:text-headline-lg">
              SWASTI (স্বস্তি): Clinical Diagnostic AI &amp; Emergency Super App
            </h3>
            <p className="font-body-md text-body-md leading-relaxed text-slate-600">
              The world&rsquo;s first clinical emergency ecosystem specifically
              fine-tuned on indigenous Bangladeshi healthcare dynamics.
              Featuring multi-dialect Bengali voice recognition (Chatgaya,
              Sylheti, Noakhailla, Rangpuri) for universal triage accessibility.
            </p>

            <div className="grid grid-cols-1 gap-space-sm pt-space-xs sm:grid-cols-2">
              {swastiFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-space-xs rounded-lg border border-border bg-slate-50 p-space-sm shadow-xs"
                >
                  <Icon
                    name={feature.icon}
                    className={cn(
                      "text-[20px]",
                      feature.tone === "primary" ? "text-primary" : "text-title",
                    )}
                  />
                  <div>
                    <span className="block font-label-md text-label-md font-bold text-slate-900">
                      {feature.title}
                    </span>
                    <span className="block font-body-sm text-body-sm text-slate-600">
                      {feature.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-space-md pt-space-sm">
              <a
                href="#download"
                className="inline-flex items-center gap-space-sm rounded-lg bg-title px-space-md py-space-sm font-display text-label-md font-bold text-white shadow-sm transition-all hover:bg-signal"
              >
                <Icon name="android" className="text-[20px]" />
                <span>Google Play</span>
              </a>
              <a
                href="#download"
                className="inline-flex items-center gap-space-sm rounded-lg border border-border bg-muted px-space-md py-space-sm font-display text-label-md font-bold text-slate-800 shadow-xs transition-all hover:bg-slate-200"
              >
                <Icon name="phone_iphone" className="text-[20px]" />
                <span>Apple App Store</span>
              </a>
              <span className="font-code-telemetry text-code-telemetry font-medium text-slate-500">
                Free for all citizens
              </span>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-6">
            <SwastiPreview />
          </div>
        </article>

        <div className="grid grid-cols-1 gap-gutter lg:grid-cols-2">
          <article className="flex flex-col justify-between rounded-2xl border border-border bg-white p-space-lg shadow-md">
            <div className="flex flex-col gap-space-md">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <span className="rounded-sm border border-emerald-200 bg-emerald-100 px-space-sm py-1 font-display text-label-sm font-bold text-emerald-800">
                  SOVEREIGN HARDWARE
                </span>
                <span className="font-code-telemetry text-code-telemetry font-bold text-signal">
                  BENGALI WEARABLE
                </span>
              </div>
              <h3 className="font-display text-headline-md font-bold text-slate-900">
                আপনজন - Aponjon: Neuro &amp; Biosensing AI Wearable
              </h3>
              <p className="font-body-md text-body-md leading-relaxed text-slate-600">
                An affordable, clinical-grade medical wearable engineered
                specifically for the physiological and financial context of 180
                million Bangladeshi citizens. Direct hardware pairing with the
                SWASTI sovereign health cloud.
              </p>

              <div className="grid grid-cols-2 gap-space-xs pt-space-xs sm:grid-cols-3">
                {aponjonSensors.map((sensor) => (
                  <div
                    key={sensor.title}
                    className="rounded-lg border border-border bg-slate-50 p-space-sm"
                  >
                    <Icon
                      name={sensor.icon}
                      className={cn(
                        "text-[20px]",
                        sensor.tone === "primary" ? "text-primary" : "text-title",
                      )}
                    />
                    <span className="mt-1 block font-label-md text-label-md font-bold text-slate-900">
                      {sensor.title}
                    </span>
                    <span className="block font-body-sm text-body-sm text-slate-600">
                      {sensor.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-space-lg flex flex-wrap items-center justify-between gap-space-sm border-t border-border pt-space-md">
              <span className="font-code-telemetry text-code-telemetry text-slate-700">
                Target Unit Cost:{" "}
                <strong className="font-bold text-signal">BDT 1,850</strong>
              </span>
              <a
                href="#rnd-innovations"
                className="rounded-lg border border-border bg-muted px-space-md py-space-xs font-label-md text-label-md font-semibold text-slate-800 transition-colors hover:bg-slate-200"
              >
                View Hardware Whitepaper
              </a>
            </div>
          </article>

          <article className="flex flex-col justify-between rounded-2xl border border-border bg-white p-space-lg shadow-md">
            <div className="flex flex-col gap-space-md">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <span className="rounded-sm border border-orange-200 bg-orange-100 px-space-sm py-1 font-display text-label-sm font-bold text-orange-900">
                  RURAL B2B ECOSYSTEM
                </span>
                <span className="font-code-telemetry text-code-telemetry font-bold text-primary">
                  45,000+ VILLAGE NODES
                </span>
              </div>
              <h3 className="font-display text-headline-md font-bold text-slate-900">
                One Village, One Smart Pharmacy (এক গ্রাম, এক স্মার্ট ফার্মেসি)
              </h3>
              <p className="font-body-md text-body-md leading-relaxed text-slate-600">
                In Bangladesh, the village pharmacy is the real frontline
                hospital. We convert these 45,000+ local retail hubs into
                decentralized AI diagnostic outposts equipped with Kandari
                telemetry tablets and immediate tele-specialist links.
              </p>

              <div className="flex flex-col gap-space-sm pt-space-xs">
                {pharmacyCapabilities.map((capability) => (
                  <div
                    key={capability.title}
                    className="flex items-center gap-space-sm rounded-lg border border-border bg-slate-50 p-space-sm"
                  >
                    <Icon
                      name={capability.icon}
                      className={cn(
                        "text-[24px]",
                        capability.tone === "primary"
                          ? "text-primary"
                          : "text-title",
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-bold text-slate-900">
                        {capability.title}
                      </span>
                      <span className="font-body-sm text-body-sm text-slate-600">
                        {capability.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-space-lg flex flex-wrap items-center justify-between gap-space-sm border-t border-border pt-space-md">
              <span className="font-code-telemetry text-code-telemetry text-slate-700">
                Pilot Cohort:{" "}
                <strong className="font-bold text-primary">
                  120 Union Parishads Active
                </strong>
              </span>
              <a
                href="#kandari-member-portal"
                className="rounded-lg border border-border bg-muted px-space-md py-space-xs font-label-md text-label-md font-semibold text-slate-800 transition-colors hover:bg-slate-200"
              >
                Join Pharmacy Pilot
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
