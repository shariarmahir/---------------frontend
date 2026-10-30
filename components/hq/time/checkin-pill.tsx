"use client";

import { DoorOpen, LogIn, LogOut } from "lucide-react";
import { DropdownMenu as DM } from "radix-ui";
import { useToday } from "@/components/hq/hooks";
import { hb } from "@/components/hq/kit";
import { useAct, useHq, useNow } from "@/components/hq/provider";
import { clockLabel, duration } from "@/lib/hq/format";
import { cn } from "@/lib/utils";

/** The top bar's office check-in: a gold button until you're in, then your time in the office. */
export function CheckinPill() {
  const act = useAct();
  const today = useToday();
  const now = useNow(60_000);
  const me = useHq((v) => v.me.person.id);
  const c = useHq((v) => v.checkins.find((x) => x.personId === me && x.day === today));

  if (!c) {
    return (
      <button
        type="button"
        onClick={() =>
          act<{ late: boolean; lateMins: number }>("time", "checkin", {}).then(
            (r) => r,
            () => null,
          )
        }
        className={cn(hb.goldSm, "min-h-11 px-3 sm:px-4")}
        aria-label="Check in to the office"
      >
        <LogIn aria-hidden className="size-4" /> <span className="hidden sm:inline">Check in</span>
      </button>
    );
  }

  const out = Boolean(c.out);
  return (
    <DM.Root>
      <DM.Trigger className={cn("inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold ring-1 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none", out ? "bg-white/6 text-white/70 ring-white/12" : "bg-bdnavy-900 text-white ring-white/15")} aria-label="Office check-in">
        <span aria-hidden className={cn("size-2 rounded-full", out ? "bg-white/40" : "bg-signal-orange")} />
        <span className="hidden sm:inline">{out ? "Checked out" : `In office ${duration(now - Date.parse(c.in)).split(" ").slice(0, 4).join(" ")}`}</span>
        <DoorOpen aria-hidden className="size-4 sm:hidden" />
        {c.late ? <span className="rounded-md bg-national-crimson px-1.5 py-0.5 text-white">Late {c.lateMins}m</span> : null}
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="end" sideOffset={8} className="hq z-[70] w-64 rounded-2xl bg-bdnavy-900 p-3 text-sm text-white shadow-2xl ring-1 ring-white/15">
          <p className="text-white/70">
            Checked in at <strong className="text-white">{clockLabel(c.in)}</strong>
            {c.late ? <span className="text-crimson-bright"> ({c.lateMins} min late)</span> : " — on time"}
          </p>
          {c.out ? (
            <p className="mt-1 text-white/70">
              Checked out at <strong className="text-white">{clockLabel(c.out)}</strong>
            </p>
          ) : (
            <DM.Item asChild>
              <button type="button" onClick={() => act("time", "checkout", {}, { ok: "Checked out — see you tomorrow" })} className={cn(hb.outlineSm, "mt-3 w-full outline-none")}>
                <LogOut aria-hidden className="size-3.5" /> Check out
              </button>
            </DM.Item>
          )}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}
