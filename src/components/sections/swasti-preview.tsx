import { Icon } from "@/components/ui/icon";

export function SwastiPreview() {
  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-muted p-space-md shadow-lg">
      <div className="flex items-center justify-between border-b border-border pb-space-sm">
        <div className="flex items-center gap-space-xs">
          <span className="size-3 rounded-full bg-crimson" />
          <span className="size-3 rounded-full bg-title" />
          <span className="size-3 rounded-full bg-primary" />
        </div>
        <span className="font-code-telemetry text-label-sm font-bold text-primary">
          SWASTI_KERNEL_UI // V2.4
        </span>
      </div>

      <div className="mt-space-sm flex flex-col gap-space-md rounded-lg border border-border bg-white p-space-md shadow-xs">
        <div className="flex items-center justify-between rounded-lg border border-border bg-slate-50 p-space-sm">
          <div className="flex items-center gap-space-sm">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white shadow-xs">
              স্ব
            </div>
            <div>
              <span className="block font-display text-label-md font-bold text-slate-900">
                জরুরি ট্রায়াজ ও ডায়াগনস্টিকস
              </span>
              <span className="block font-code-telemetry text-label-sm font-semibold text-primary">
                LIVE BMDC REASONING
              </span>
            </div>
          </div>
          <span className="size-2.5 animate-pulse rounded-full bg-primary" />
        </div>

        <div className="flex flex-col gap-space-xs rounded-lg border border-border bg-slate-50 p-space-sm">
          <div className="flex items-center justify-between font-label-sm text-label-sm font-medium text-slate-600">
            <span>ভয়েস ইনপুট: চট্টগ্রাম আঞ্চলিক ডায়ালেক্ট</span>
            <span className="font-code-telemetry font-bold text-signal">
              98.4% Confidence
            </span>
          </div>
          <svg
            viewBox="0 0 300 40"
            aria-hidden="true"
            className="h-10 w-full text-primary"
          >
            <path
              d="M0,20 Q15,5 30,20 T60,20 T90,5 T120,35 T150,20 T180,10 T210,30 T240,20 T270,8 T300,20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
          </svg>
          <span className="font-body-sm text-body-sm font-medium italic text-slate-800">
            &ldquo;বুকখান বহুত ভারী ভারী ঠেকেদ্দে, নিশ্বাস লইতে কষ্ট অর...&rdquo;
          </span>
        </div>

        <div className="flex flex-col gap-space-xs rounded-lg border border-red-200 bg-red-50 p-space-sm">
          <div className="flex items-center gap-space-xs font-code-telemetry text-label-sm font-bold text-crimson">
            <Icon name="verified" className="text-[16px]" />
            <span>PRELIMINARY ASSESSMENT: CARDIAC ISCHEMIA RISK</span>
          </div>
          <p className="font-body-sm text-body-sm text-slate-800">
            Dispatching ambulance beacon to nearby Thana Health Complex (3.8 km
            away). Oxygen reservoir protocol triggered.
          </p>
          <div className="flex items-center justify-between pt-space-xs">
            <span className="font-code-telemetry text-label-sm font-bold text-signal">
              ETA: 11 MINS
            </span>
            <span className="rounded-sm bg-crimson px-space-xs py-0.5 font-label-sm text-label-sm font-bold text-white">
              RED ALERT LEVEL 1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
