import { Icon } from "@/components/ui/icon";
import { corePipelines, footerTelemetry } from "@/data/footer";
import { NAZRUL_MOTTO } from "@/data/navigation";
import { cn } from "@/lib/utils";

const TONE_TEXT = {
  primary: "text-primary",
  signal: "text-signal",
  crimson: "text-crimson",
} as const;

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="w-full border-b border-border bg-slate-100/70 px-gutter py-space-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-space-md">
          {footerTelemetry.map((item) => (
            <div key={item.label} className="flex items-center gap-space-sm">
              <span
                className={cn(
                  "font-label-sm text-label-sm font-bold uppercase tracking-wider",
                  TONE_TEXT[item.tone],
                )}
              >
                {item.label}
              </span>
              <span className="h-4 w-px bg-slate-300" />
              <span className="font-code-telemetry text-code-telemetry font-semibold text-slate-800">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-gutter px-gutter py-space-xl md:grid-cols-12">
        <div className="flex flex-col gap-space-md md:col-span-5">
          <div className="flex items-center gap-space-sm">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary font-display text-label-sm font-extrabold text-primary-foreground">
              ক
            </span>
            <span className="font-display text-headline-sm font-bold text-primary">
              কাণ্ডারী-ল্যাব
            </span>
            <span className="rounded-sm border border-emerald-200 bg-emerald-100 px-space-xs py-0.5 font-label-sm text-label-sm font-bold text-emerald-800">
              R&amp;D HQ
            </span>
          </div>
          <p className="max-w-md font-body-md text-body-md leading-relaxed text-slate-600">
            Sovereign deep-tech innovation infrastructure engineered for
            Bangladesh. Dhaka Frontier Lab, Tejgaon Industrial Framework,
            Dhaka-1208, Bangladesh.
          </p>
          <p className="font-label-sm text-label-sm font-bold italic text-primary">
            {NAZRUL_MOTTO}
          </p>
        </div>

        <div className="flex flex-col gap-space-sm md:col-span-4">
          <h2 className="font-display text-label-md font-bold uppercase tracking-wider text-slate-900">
            Core Sovereign Pipelines
          </h2>
          <ul className="flex flex-col gap-space-xs font-body-sm text-body-sm font-medium text-slate-600">
            {corePipelines.map((pipeline) => (
              <li
                key={pipeline}
                className="cursor-pointer transition-colors hover:text-primary"
              >
                {pipeline}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-space-sm md:col-span-3">
          <h2 className="font-display text-label-md font-bold uppercase tracking-wider text-slate-900">
            Integrity &amp; Protocol
          </h2>
          <p className="font-body-sm text-body-sm leading-relaxed text-slate-600">
            Frontier intelligence aligned with rigorous institutional parameters
            and mathematical sovereign reliability.
          </p>
          <div className="flex items-center gap-space-xs font-code-telemetry text-code-telemetry font-semibold text-primary">
            <Icon name="verified_user" className="text-[16px]" />
            <span>ISO-Compliant Deep Tech Node</span>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-border bg-white px-gutter py-space-md">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-space-sm sm:flex-row">
          <p className="font-body-sm text-body-sm text-slate-500">
            © {new Date().getFullYear()} Kandari-Lab (কাণ্ডারী-ল্যাব). Sovereign
            Deep Tech Initiative Bangladesh.
          </p>
          <p className="font-body-sm text-body-sm text-slate-500">
            Architected under leadership of Mahir Shariar Mahin.
          </p>
        </div>
      </div>
    </footer>
  );
}
