"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { CheckCircle2, Copy, Eye, SearchX, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { AccountAvatar } from "@/components/auth/account-menu";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { sampleClassrooms } from "@/data/media/classroom";
import { useAuth } from "@/lib/auth/client";
import { findChild, normCode, studentCode, type ClassMode } from "@/lib/media/class-access";
import { cn } from "@/lib/utils";
import { useFormat } from "../../ui/numerals";
import { PictureCaptcha } from "./picture-captcha";
import type { RoomCard } from "./rooms";
import type { ClassSession } from "./session-context";

const LAST = "classroom-entry";

function remembered(): { mode: ClassMode; code: string } {
  try {
    const v = JSON.parse(window.sessionStorage.getItem(LAST) ?? "null") as { mode?: ClassMode; code?: string } | null;
    return { mode: v?.mode === "parent" ? "parent" : "student", code: v?.code ?? "" };
  } catch {
    return { mode: "student", code: "" };
  }
}

/** The demo's sample child: the SSC class's CR. */
const SAMPLE_CHILD = sampleClassrooms[0].members[0];

/**
 * The gold door to the classroom: enter as the student on this account, or
 * as a parent with the child's student ID — a parent sees everything and
 * changes nothing.
 */
export function ClassGate({ rooms, onEnter, onLeave }: { rooms: RoomCard[]; onEnter: (s: ClassSession) => void; onLeave: () => void }) {
  const { account } = useAuth();
  const { num } = useFormat();
  const [first] = useState(remembered);
  const [mode, setMode] = useState<ClassMode>(first.mode);
  const [code, setCode] = useState(first.code);

  const classes = useMemo(() => rooms.filter((r) => r.kind === "class"), [rooms]);
  const labs = useMemo(() => rooms.filter((r) => r.kind === "lab"), [rooms]);
  const child = mode === "parent" ? findChild(code, classes, labs) : null;
  const typed = normCode(code) !== null;
  const myCode = account ? studentCode(account.id) : "";
  const ready = mode === "student" ? Boolean(account) : Boolean(child);

  function enter() {
    if (!ready) return;
    try {
      window.sessionStorage.setItem(LAST, JSON.stringify({ mode, code: mode === "parent" ? code : "" }));
    } catch {
      // Private mode: the choice simply is not remembered.
    }
    onEnter(mode === "parent" && child ? { mode: "parent", child } : { mode: "student" });
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onLeave()}>
      <DialogContent showCloseButton={false} className="max-h-[94dvh] overflow-y-auto !rounded-3xl !border-0 !bg-signal-orange !p-0 font-sans !text-text-primary shadow-[0_40px_90px_-30px_var(--color-signal-orange)] sm:max-w-xl">
        <div className="relative space-y-5 p-5 sm:p-7">
          {/* The words stay for screen readers; on screen the logo says it. */}
          <DialogTitle className="sr-only">ক্লাসরুম চালু করুন</DialogTitle>
          <DialogDescription className="sr-only">কে ঢুকছেন বেছে নিন, তারপর ছবি মিলিয়ে ঢুকুন। অভিভাবক সব দেখতে পারবেন, কিছু বদলাতে পারবেন না।</DialogDescription>
          <button type="button" onClick={onLeave} className="absolute top-4 right-4 grid size-9 place-items-center rounded-xl transition-colors hover:bg-text-primary/10">
            <X className="size-5" aria-hidden />
            <span className="sr-only">বন্ধ করুন</span>
          </button>

          <div className="flex flex-col items-center pt-1">
            <Image src="/logo/kandari-logo.png" alt="কাণ্ডারী-ল্যাব" width={1600} height={967} sizes="160px" className="h-16 w-auto sm:h-20" priority />
            <span className="mt-1 text-xs font-extrabold tracking-[0.32em] sm:text-sm">CLASSROOM</span>
          </div>

          <div role="radiogroup" aria-label="কে ঢুকছেন" className="mx-auto flex w-fit gap-1 rounded-full bg-text-primary/10 p-1 ring-1 ring-text-primary/20">
            <Choice on={mode === "student"} onPick={() => setMode("student")} Icon={UserRound} title="শিক্ষার্থী" />
            <Choice on={mode === "parent"} onPick={() => setMode("parent")} Icon={Eye} title="অভিভাবক" />
          </div>

          {mode === "student" ? (
            <div className="rounded-2xl bg-text-primary p-4 text-white">
              {account ? (
                <>
                  <div className="flex items-center gap-3">
                    <AccountAvatar name={account.name} photo={account.photo} sizes="44px" className="size-11 text-base ring-2 ring-signal-orange" />
                    <div className="min-w-0">
                      <p className="truncate font-bold">{account.name}</p>
                      <p className="text-xs text-white/65">কাণ্ডারী প্রোফাইল দিয়ে ঢুকছেন</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/8 px-3 py-2.5">
                    <div>
                      <p className="text-[11px] font-semibold text-white/65">আপনার শিক্ষার্থী আইডি</p>
                      <p className="font-mono text-lg font-bold tracking-widest text-signal-orange">{myCode}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard?.writeText(myCode).then(() => toast.success("আইডি কপি হলো", { description: "অভিভাবককে দিন — তিনি শুধু দেখতে পারবেন।" }))}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-bold transition-colors hover:bg-white/20"
                    >
                      <Copy className="size-3.5" aria-hidden /> কপি
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/65">এই আইডি অভিভাবককে দিলে তিনি আপনার ক্লাস, নোটিশ আর পরীক্ষার খবর দেখতে পারবেন।</p>
                </>
              ) : (
                <p className="text-sm">আগে কাণ্ডারী প্রোফাইলে ঢুকুন।</p>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <label htmlFor="child-code" className="block text-sm font-bold">
                সন্তানের শিক্ষার্থী আইডি
              </label>
              <input
                id="child-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                autoFocus
                autoComplete="off"
                spellCheck={false}
                maxLength={12}
                placeholder="ST-XXXXXX"
                aria-describedby="child-code-status"
                className="h-13 w-full rounded-xl bg-text-primary px-4 font-mono text-lg font-bold tracking-widest text-signal-orange outline-none placeholder:text-white/30 focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-signal-orange"
              />
              <div id="child-code-status" aria-live="polite" className="min-h-6 text-sm font-semibold">
                {child ? (
                  <p className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4.5 text-bd-green" aria-hidden /> {child.name} · {num(child.classes.length)}টি ক্লাস
                    {child.labs.length > 0 && <>, {num(child.labs.length)}টি ল্যাব</>}
                  </p>
                ) : typed ? (
                  <p className="flex items-start gap-1.5">
                    <SearchX className="mt-0.5 size-4.5 shrink-0" aria-hidden /> এই আইডির কাউকে কোনো ক্লাসে পাওয়া গেল না — সন্তানের কাছ থেকে আইডিটা আবার দেখে নিন।
                  </p>
                ) : (
                  <p className="text-text-primary/75">সন্তান ক্লাসরুমে ঢোকার সময় নিজের আইডি দেখতে পায়।</p>
                )}
              </div>
              {!child && (
                <button type="button" onClick={() => setCode(studentCode(SAMPLE_CHILD.id))} className="text-left text-xs font-semibold text-text-primary/80 underline decoration-text-primary/40 underline-offset-4 hover:decoration-text-primary">
                  নমুনা দেখুন: {studentCode(SAMPLE_CHILD.id)} ({SAMPLE_CHILD.name})
                </button>
              )}
            </div>
          )}

          <PictureCaptcha disabled={!ready} hint={mode === "parent" ? "আগে সন্তানের সঠিক আইডি দিন।" : "আগে কাণ্ডারী প্রোফাইলে ঢুকুন।"} onPass={enter} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Choice({ on, onPick, Icon, title }: { on: boolean; onPick: () => void; Icon: typeof Eye; title: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onPick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-[background-color,color,box-shadow] duration-200 motion-reduce:transition-none",
        on ? "bg-text-primary text-signal-orange shadow-[0_8px_18px_-10px_var(--color-text-primary)]" : "text-text-primary/80 hover:bg-text-primary/10 hover:text-text-primary",
      )}
    >
      <Icon className="size-4" aria-hidden />
      {title}
    </button>
  );
}
