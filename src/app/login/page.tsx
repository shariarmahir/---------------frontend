import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-space-md bg-background px-gutter text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs">
        <Icon name="shield_person" className="text-[24px]" />
      </span>
      <span className="font-code-telemetry text-label-sm font-bold uppercase text-primary">
        SOVEREIGN ACCESS GATEWAY
      </span>
      <h1 className="font-display text-headline-lg-mobile font-bold tracking-tight text-slate-900 sm:text-headline-lg">
        Kandari Member Portal — Coming Soon
      </h1>
      <p className="max-w-md font-body-md text-body-md text-slate-600">
        Authenticated Kandari profiles, research subscriptions, and telemetry
        dashboards are being provisioned. Check back shortly.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-title px-space-lg py-3 font-display text-label-md font-bold text-white shadow-sm transition-colors hover:bg-signal"
      >
        Back to Command Overview
      </Link>
    </main>
  );
}
