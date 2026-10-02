"use client";

import { useState } from "react";
import { Crown, Settings2, UserMinus, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { newId } from "@/lib/media/store";
import { TEAM_LIMITS, clampLimit, isFull, type TeamKind } from "@/lib/media/teamwork";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { toNumber } from "../ui/field-styles";
import { Num, useFormat } from "../ui/numerals";

export interface TeamDraft {
  name: string;
  maxMembers: number;
  members: { id: string; name: string }[];
}

/** "৫/৬ জন" with a thin meter; gold when the team is full. */
export function SeatMeter({ count, limit, className }: { count: number; limit?: number; className?: string }) {
  const full = isFull(count, limit);
  return (
    <span className={cn("inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-sm", full ? "bg-signal-orange font-bold text-text-primary" : "bg-white/10 text-white", className)}>
      <Users className="size-4" aria-hidden />
      <Num value={count} />{limit ? <>/<Num value={limit} /></> : null} জন
      {full && <span className="text-xs">· দল পূর্ণ</span>}
    </span>
  );
}

/** A number field with − and + for the member cap. */
export function LimitField({ kind, value, onChange, floor = 0 }: { kind: TeamKind; value: number; onChange: (n: number) => void; floor?: number }) {
  const { min, max } = TEAM_LIMITS[kind];
  const { num } = useFormat();
  const set = (n: number) => onChange(clampLimit(kind, n, floor));
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-lg ring-1 ring-white/15">
        <button type="button" onClick={() => set(value - 1)} disabled={value <= Math.max(min, floor)} className="size-11 text-lg font-bold text-white hover:text-signal-orange disabled:opacity-40" aria-label="সীমা কমান">−</button>
        <input
          inputMode="numeric"
          value={value ? num(value) : ""}
          onChange={(e) => onChange(toNumber(e.target.value))}
          onBlur={() => set(value)}
          className="h-11 w-16 bg-transparent text-center text-base font-bold text-white focus-visible:outline-none"
          aria-label="সর্বোচ্চ সদস্য"
        />
        <button type="button" onClick={() => set(value + 1)} disabled={value >= max} className="size-11 text-lg font-bold text-white hover:text-signal-orange disabled:opacity-40" aria-label="সীমা বাড়ান">+</button>
      </div>
      <span className="text-xs text-white/60"><Num value={Math.max(min, floor)} />–<Num value={max} /> জন</span>
    </div>
  );
}

/** The leader's room settings: name, member cap, and who is in. */
export function TeamSettingsDialog({ open, onOpenChange, kind, name, maxMembers, members, leaderId, onSave }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  kind: TeamKind;
  name: string;
  maxMembers?: number;
  members: { id: string; name: string }[];
  leaderId: string;
  onSave: (d: TeamDraft) => boolean;
}) {
  const fresh = (): TeamDraft => ({ name, maxMembers: maxMembers ?? clampLimit(kind, TEAM_LIMITS[kind].preset, members.length), members });
  const [draft, setDraft] = useState(fresh);
  const [adding, setAdding] = useState("");
  const full = draft.members.length >= draft.maxMembers;
  const nameOk = draft.name.trim().length >= 3;

  function add(e: React.FormEvent) {
    e.preventDefault();
    const n = adding.trim();
    if (n.length < 2 || full) return;
    setDraft((d) => ({ ...d, members: [...d.members, { id: newId("m"), name: n }] }));
    setAdding("");
  }

  function save() {
    if (!nameOk) return;
    const ok = onSave({ ...draft, name: draft.name.trim(), maxMembers: clampLimit(kind, draft.maxMembers, draft.members.length) });
    if (ok) {
      toast.success("সেটিংস সংরক্ষণ হলো");
      onOpenChange(false);
    } else toast.error("এই ব্রাউজারে আর জায়গা নেই — পুরোনো ফাইল সরিয়ে আবার চেষ্টা করুন।");
  }

  const label = "mb-1.5 block text-sm font-semibold text-white";
  return (
    <Dialog open={open} onOpenChange={(o) => { if (o) { setDraft(fresh()); setAdding(""); } onOpenChange(o); }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-lg">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white"><Settings2 className="size-5 text-signal-orange" aria-hidden /> {kind === "lab" ? "ল্যাব দল সাজান" : "ক্লাস সাজান"}</DialogTitle>
          <DialogDescription>নাম, সর্বোচ্চ কতজন থাকতে পারবে আর কারা আছেন — যখন খুশি বদলানো যায়।</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <label className="block">
            <span className={label}>{kind === "lab" ? "ল্যাব গ্রুপের নাম" : "ক্লাসের নাম"}</span>
            <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} aria-invalid={!nameOk} />
            {!nameOk && <span className="mt-1 block text-xs font-semibold text-crimson-bright">অন্তত ৩ অক্ষরের একটি নাম দিন।</span>}
          </label>
          <div>
            <span className={label}>সর্বোচ্চ সদস্য</span>
            <LimitField kind={kind} value={draft.maxMembers} floor={draft.members.length} onChange={(n) => setDraft((d) => ({ ...d, maxMembers: n }))} />
            <p className="mt-1.5 text-xs text-white/60">{kind === "lab" ? "ল্যাব গ্রুপ ছোট রাখলে সবাই হাতে-কলমে কাজ পায়।" : "পূর্ণ হলে কোড দিয়ে আর কেউ যোগ দিতে পারবে না।"} এখন আছেন <Num value={draft.members.length} /> জন।</p>
          </div>
          <div>
            <span className={label}>সদস্য</span>
            <ul className="divide-y divide-white/10 rounded-xl bg-white/5 ring-1 ring-white/10">
              {draft.members.map((m) => (
                <li key={m.id} className="flex min-h-11 items-center gap-3 px-3 text-sm text-white">
                  <span className="min-w-0 flex-1 truncate">{m.name}</span>
                  {m.id === leaderId ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-signal-orange"><Crown className="size-3.5" aria-hidden /> লিডার</span>
                  ) : (
                    <button type="button" onClick={() => setDraft((d) => ({ ...d, members: d.members.filter((x) => x.id !== m.id) }))} className={mediaButton({ variant: "ghost", size: "icon-sm" })} aria-label={`${m.name}-কে সরান`}>
                      <UserMinus aria-hidden />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <form onSubmit={add} className="mt-2 flex gap-2">
              <Input value={adding} onChange={(e) => setAdding(e.target.value)} placeholder={full ? "দল পূর্ণ — আগে সীমা বাড়ান" : "নতুন সদস্যের নাম"} disabled={full} aria-label="নতুন সদস্যের নাম" />
              <button type="submit" disabled={full || adding.trim().length < 2} className={mediaButton({ variant: "quiet" })}><UserPlus aria-hidden /> যোগ</button>
            </form>
          </div>
          <button type="button" onClick={save} disabled={!nameOk} className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}>সংরক্ষণ করুন</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
