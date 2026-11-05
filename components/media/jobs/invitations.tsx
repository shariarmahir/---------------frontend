"use client";

import Link from "next/link";
import { CalendarClock, Check, MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import { invitesForMe } from "@/data/media/jobs";
import { personOrThrow } from "@/data/media/users";
import type { InviteReply } from "@/lib/media/hiring";
import { updateMedia, useHydrated, useMediaState } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { Ago, DateText } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";

const hud = "font-mono text-[11px] font-bold tracking-wide uppercase";

function reply(id: string, answer: InviteReply) {
  updateMedia((s) => ({ ...s, inviteReplies: { ...s.inviteReplies, [id]: answer } }));
  toast.success(answer === "accepted" ? "রাজি হয়েছেন — বার্তায় কথা এগোবে" : "আমন্ত্রণটি ফিরিয়ে দিলেন");
}

/**
 * Interview invitations: the ones sent to the viewer, to accept or decline,
 * and the ones the viewer sent from "কাজ চাই" and the academy's graduates.
 */
export function Invitations() {
  const hydrated = useHydrated();
  const replies = useMediaState((s) => s.inviteReplies);
  const sent = useMediaState((s) => s.invites);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section aria-labelledby="inv-in" className="rounded-2xl border border-m-ink/10 bg-m-card p-4 sm:p-5">
        <h3 id="inv-in" className={cn(hud, "text-m-ink/55")}>
          আপনার কাছে এসেছে
        </h3>
        <ul className="mt-3 space-y-3">
          {invitesForMe.map((inv) => {
            const from = personOrThrow(inv.from);
            const answer = hydrated ? replies[inv.id] : undefined;
            return (
              <li key={inv.id} className="rounded-xl border border-m-ink/10 p-3.5">
                <div className="flex items-start gap-3">
                  <Link href={`/media/u/${from.handle}`} className="shrink-0 rounded-full">
                    <PersonAvatar person={from} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-m-ink">{inv.role}</p>
                    <p className="text-xs text-m-ink/60">
                      {inv.org} · <Ago iso={inv.at} />
                    </p>
                  </div>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-m-ink/85">{inv.note}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-m-ink/75">
                  <CalendarClock className="size-3.5 text-m-blue" aria-hidden /> <DateText iso={inv.slot} time weekday />
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {answer === "accepted" ? (
                    <>
                      <span className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-m-green/15 px-3 text-sm font-semibold text-m-ink">
                        <Check className="size-4 text-m-green" aria-hidden /> রাজি হয়েছেন
                      </span>
                      <Link href="/media/messages" className={mediaButton({ variant: "quiet", size: "sm" })}>
                        <MessageCircle aria-hidden /> বার্তা
                      </Link>
                    </>
                  ) : answer === "declined" ? (
                    <span className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-m-ink/8 px-3 text-sm font-semibold text-m-ink/70">ফিরিয়ে দিয়েছেন</span>
                  ) : (
                    <>
                      <button type="button" onClick={() => reply(inv.id, "accepted")} className={mediaButton({ variant: "primary", size: "sm" })}>
                        <Check aria-hidden /> রাজি
                      </button>
                      <button type="button" onClick={() => reply(inv.id, "declined")} className={mediaButton({ variant: "ghost", size: "sm" })}>
                        <X aria-hidden /> না
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="inv-out" className="rounded-2xl border border-m-ink/10 bg-m-card p-4 sm:p-5">
        <h3 id="inv-out" className={cn(hud, "text-m-ink/55")}>
          আপনি পাঠিয়েছেন
        </h3>
        {!hydrated || sent.length === 0 ? (
          <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-m-ink/65">
            <Send className="mt-0.5 size-4 shrink-0 text-m-blue" aria-hidden />
            “কাজ চাই” বা একাডেমির স্কিল হান্টারদের কার্ডে “আমন্ত্রণ” চাপলে এখানে জমা থাকবে।
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-m-ink/10">
            {sent.map((i) => (
              <li key={i.id} className="flex items-start justify-between gap-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-m-ink">{i.toName}</span>
                  <span className="block truncate text-xs text-m-ink/60">{i.role}</span>
                </span>
                <span className="shrink-0 text-right text-xs text-m-ink/70">
                  <span className={cn(hud, "block", i.kind === "graduate" ? "text-m-yellow" : "text-m-blue")}>{i.kind === "graduate" ? "একাডেমি" : "কাজ চাই"}</span>
                  <DateText iso={i.slot} time />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
