"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, FlaskConical, ImagePlus, SmilePlus, Sparkles, Store } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { currentUser } from "@/data/media/users";
import { cn } from "@/lib/utils";
import { Composer, type ComposerPreset } from "../post/post-form";
import { PersonAvatar } from "../ui/person";

const firstName = (name: string) => name.split(" ")[0];

/**
 * The feed's "what's on your mind" card. It opens the composer in place —
 * plain, or straight onto photos, a feeling, a talent, a skill to verify or
 * research — and after posting, scrolls to the new post at the top.
 */
export function FeedComposer() {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<ComposerPreset>({});
  const [round, setRound] = useState(0);

  const start = (p: ComposerPreset) => {
    setPreset(p);
    setRound((r) => r + 1);
    setOpen(true);
  };

  const quick = [
    { label: "ছবি/ভিডিও", Icon: ImagePlus, tint: "text-bdgreen-500", preset: { open: "photo" } },
    { label: "অনুভূতি", Icon: SmilePlus, tint: "text-signal-orange", preset: { open: "feeling" } },
    { label: "প্রতিভা", Icon: Sparkles, tint: "text-bdorange-600", preset: { topic: "talent" } },
    { label: "দক্ষতা যাচাই", Icon: BadgeCheck, tint: "text-bdgreen-500", preset: { topic: "skill" } },
    { label: "গবেষণা", Icon: FlaskConical, tint: "text-signal-orange", preset: { topic: "research" } },
  ] satisfies { label: string; Icon: typeof ImagePlus; tint: string; preset: ComposerPreset }[];

  const item = "flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none";

  return (
    <section aria-label="পোস্ট তৈরি করুন" className="rounded-3xl border border-white/12 bg-text-primary p-3 sm:p-4">
      <div className="flex items-center gap-3">
        <Link href="/media/me" className="shrink-0 rounded-full ring-2 ring-signal-orange ring-offset-2 ring-offset-text-primary">
          <PersonAvatar person={currentUser} />
          <span className="sr-only">আপনার প্রোফাইল</span>
        </Link>
        <button
          type="button"
          onClick={() => start({})}
          className="flex h-12 flex-1 items-center rounded-full bg-white/10 px-5 text-left text-[15px] text-white/65 transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-signal-orange focus-visible:outline-none"
        >
          কী ভাবছেন, {firstName(currentUser.nameBn)}?
        </button>
      </div>

      <div className="mt-3 border-t border-white/10 pt-2">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 scrollbar-none sm:justify-between">
          {quick.map(({ label, Icon, tint, preset: p }) => (
            <button key={label} type="button" onClick={() => start(p)} className={item}>
              <Icon className={cn("size-5", tint)} aria-hidden />
              {label}
            </button>
          ))}
          <Link href="/media/market/new" className={item}>
            <Store className="size-5 text-white" aria-hidden />
            বিক্রি
          </Link>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92dvh] w-[calc(100%-1rem)] gap-0 overflow-hidden rounded-3xl border-white/12 bg-text-primary p-0 font-sans text-white sm:max-w-xl">
          <div className="border-b border-white/12 px-12 py-4 text-center">
            <DialogTitle className="text-lg font-bold text-white">পোস্ট তৈরি করুন</DialogTitle>
            <DialogDescription className="sr-only">জীবন, প্রতিভা, ভাবনা বা কাজ — যা খুশি লিখুন, ছবি-ভিডিও দিন।</DialogDescription>
          </div>
          <Composer
            key={round}
            preset={preset}
            onDone={(id) => {
              setOpen(false);
              window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 350);
            }}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
