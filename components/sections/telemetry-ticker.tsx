import { Icon } from "@/components/ui/icon";
import { telemetryReadings } from "@/data/telemetry";
import { cn } from "@/lib/utils";

export function TelemetryTicker() {
  return (
    <section className="w-full overflow-hidden border-b border-border bg-slate-100/90 px-gutter py-2">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-space-lg font-code-telemetry text-code-telemetry text-slate-600">
        <div className="flex shrink-0 items-center gap-space-sm">
          <span className="inline-block size-2 animate-ping rounded-full bg-primary" />
          {/* Sentence case: a 37-character all-caps run reads slower than
              the same words in mixed case. Caps are kept for the short
              status chip beside it, where they act as a label. */}
          <span className="font-bold tracking-wide text-primary">
            Bangladesh National Telemetry Lattice
          </span>
          <span className="rounded-sm border border-emerald-200 bg-emerald-100 px-2 py-0.5 font-label-sm text-label-sm text-emerald-800">
            NODE-64 ACTIVE
          </span>
        </div>

        <div className="no-scrollbar flex items-center gap-space-xl overflow-x-auto whitespace-nowrap font-body-sm text-body-sm">
          {telemetryReadings.map((reading) => (
            <div key={reading.label} className="flex items-center gap-space-xs">
              <Icon
                name={reading.icon}
                className={cn(
                  "text-[16px]",
                  reading.tone === "primary" ? "text-primary" : "text-title",
                )}
              />
              <span className="font-semibold text-slate-900">{reading.label}</span>
              <span
                className={cn(
                  "font-code-telemetry font-bold",
                  reading.tone === "primary" ? "text-primary" : "text-signal-text",
                )}
              >
                {reading.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
