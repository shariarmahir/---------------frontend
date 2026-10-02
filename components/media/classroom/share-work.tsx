"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, BookOpenCheck, ImagePlus, Lightbulb, Microscope, Newspaper, Send, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { Textarea } from "@/components/ui/textarea";
import type { Post } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import type { NoteFile } from "@/lib/media/classroom";
import {
  SHARE_KINDS, STAGES, shareCaption, shareProblems, shareTags, type ResearchEntry, type ResearchStage, type RoomRef, type ShareKind, type SharedRef,
} from "@/lib/media/showcase";
import { newId, updateMedia } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { mediaButton } from "../ui/button-styles";
import { choiceClass } from "../ui/field-styles";
import { Ago, Num } from "../ui/numerals";
import { toNoteFile } from "./note-files";

export const SHARE_ICONS: Record<ShareKind, typeof Lightbulb> = { solution: BookOpenCheck, innovation: Lightbulb, research: Microscope };

export interface SharePreset {
  kind?: ShareKind;
  title?: string;
  question?: string;
  finding?: string;
  /** Member ids credited. */
  team?: string[];
}

/** Share what the room solved or found: to the feed, and research to the গবেষণা page too. */
export function ShareDialog({ open, onOpenChange, from, members, meId, preset, onShared }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  from: RoomRef;
  members: { id: string; name: string }[];
  meId?: string;
  preset?: SharePreset;
  onShared: (ref: SharedRef) => boolean;
}) {
  const router = useRouter();
  const start = () => ({
    kind: preset?.kind ?? ("innovation" as ShareKind),
    title: preset?.title ?? "",
    question: preset?.question ?? "",
    finding: preset?.finding ?? "",
    method: "",
    stage: "running" as ResearchStage,
    team: preset?.team ?? (meId ? [meId] : []),
  });
  const [v, setV] = useState(start);
  const [toFeed, setToFeed] = useState(true);
  const [toResearch, setToResearch] = useState(true);
  const [photo, setPhoto] = useState<NoteFile>();
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);
  const pick = useRef<HTMLInputElement>(null);
  const research = v.kind === "research";
  const problems = shareProblems({ title: v.title, finding: v.finding, toFeed, toResearch: research && toResearch });

  function reset(o: boolean) {
    if (o) {
      setV(start());
      setToFeed(true);
      setToResearch(true);
      setPhoto(undefined);
      setTried(false);
    }
    onOpenChange(o);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (Object.values(problems).some(Boolean)) return;
    const team = members.filter((m) => v.team.includes(m.id)).map((m) => m.name);
    const input = { kind: v.kind, title: v.title.trim(), question: v.question.trim(), finding: v.finding.trim(), method: research ? v.method.trim() : undefined, team, from };
    const at = new Date().toISOString();
    const tags = shareTags(input);
    const kind = SHARE_KINDS[v.kind];
    const post: Post | undefined = toFeed
      ? {
          id: newId("p"),
          kind: "project",
          topic: kind.topic,
          author: currentUser.handle,
          category: kind.category,
          createdAt: at,
          caption: shareCaption(input),
          media: photo ? [{ kind: "image", label: input.title, ratio: "4/3", src: photo.data }] : [],
          tags,
          stats: { likes: 0, shares: 0, views: 0 },
          comments: [],
          from,
        }
      : undefined;
    const entry: ResearchEntry | undefined =
      research && toResearch
        ? { id: newId("r"), title: input.title, question: input.question, finding: input.finding, method: input.method || undefined, stage: v.stage, team, from, tags, image: post ? undefined : photo?.data, postId: post?.id, at }
        : undefined;
    const saved = updateMedia((s) => ({ ...s, posts: post ? [post, ...s.posts] : s.posts, research: entry ? [entry, ...s.research] : s.research }));
    if (!saved || !onShared({ id: newId("sh"), kind: v.kind, title: input.title, team, at, postId: post?.id, researchId: entry?.id })) {
      toast.error("এই ব্রাউজারে আর জায়গা নেই", { description: "ছবি ছাড়া আবার চেষ্টা করুন, বা পুরোনো ফাইল সরান।" });
      return;
    }
    reset(false);
    const where = post && entry ? "ফিডে আর গবেষণা পাতায়" : post ? "ফিডে" : "গবেষণা পাতায়";
    toast.success(`${where} শেয়ার হলো`, {
      description: "সবাই দেখবে, মন্তব্য করবে, আর কেউ হয়তো যোগ দিতে চাইবে।",
      action: { label: "দেখুন", onClick: () => router.push(post ? `/media/post/${post.id}` : `/media/research#${entry!.id}`) },
    });
  }

  const label = "mb-1.5 block text-sm font-semibold text-white";
  const err = (m?: string) => tried && m && <span className="mt-1 block text-xs font-semibold text-crimson-bright">{m}</span>;
  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-xl">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white"><Share2 className="size-5 text-signal-orange" aria-hidden /> দলের কাজ শেয়ার করুন</DialogTitle>
          <DialogDescription>যে সমস্যা মিলে সমাধান করলেন, যা নতুন বানালেন বা খুঁজে পেলেন — সবাই শিখুক। গবেষণা হলে গবেষণা পাতাতেও যাবে।</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-5">
          <fieldset>
            <legend className={label}>কী ধরনের কাজ?</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(SHARE_KINDS) as ShareKind[]).map((k) => {
                const Icon = SHARE_ICONS[k];
                return (
                  <label key={k} className={cn(choiceClass(v.kind === k), "flex-col items-start gap-0.5 py-2")}>
                    <input type="radio" name="share-kind" className="sr-only" checked={v.kind === k} onChange={() => setV((x) => ({ ...x, kind: k }))} />
                    <span className="flex items-center gap-1.5"><Icon className="size-4" aria-hidden /> {SHARE_KINDS[k].bn}</span>
                    <span className="text-[11px] leading-snug font-normal opacity-75">{SHARE_KINDS[k].hint}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="block">
            <span className={label}>শিরোনাম *</span>
            <Input value={v.title} onChange={(e) => setV((x) => ({ ...x, title: e.target.value }))} placeholder="যেমন: কম খরচে পানির ফিল্টার" aria-invalid={tried && Boolean(problems.title)} />
            {err(problems.title)}
          </label>
          <label className="block">
            <span className={label}>{research ? "গবেষণার প্রশ্ন" : "কোন সমস্যা থেকে শুরু"}</span>
            <Textarea rows={2} value={v.question} onChange={(e) => setV((x) => ({ ...x, question: e.target.value }))} placeholder="এক-দুই লাইনে" />
          </label>
          {research && (
            <label className="block">
              <span className={label}>পদ্ধতি</span>
              <Textarea rows={2} value={v.method} onChange={(e) => setV((x) => ({ ...x, method: e.target.value }))} placeholder="কী দিয়ে, কীভাবে মাপলেন বা যাচাই করলেন" />
            </label>
          )}
          <label className="block">
            <span className={label}>{research ? "ফলাফল *" : v.kind === "solution" ? "সমাধান *" : "যা বানালেন *"}</span>
            <Textarea rows={3} value={v.finding} onChange={(e) => setV((x) => ({ ...x, finding: e.target.value }))} placeholder="কী পেলেন, কতটা কাজ করল, এরপর কী" aria-invalid={tried && Boolean(problems.finding)} />
            {err(problems.finding)}
          </label>

          <fieldset>
            <legend className={label}>দলে কারা ছিলেন</legend>
            <div className="flex flex-wrap gap-2">
              {members.map((m) => {
                const on = v.team.includes(m.id);
                return (
                  <button key={m.id} type="button" aria-pressed={on} onClick={() => setV((x) => ({ ...x, team: on ? x.team.filter((t) => t !== m.id) : [...x.team, m.id] }))} className={cn("min-h-9 rounded-full px-3 text-sm font-semibold transition-colors", on ? "bg-signal-orange text-text-primary" : "bg-white/8 text-white/75 ring-1 ring-white/12 hover:text-white")}>
                    {m.id === meId ? "আমি" : m.name}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <span className={label}>ছবি (ঐচ্ছিক)</span>
            {photo ? (
              <div className="relative w-fit">
                <Image src={photo.data} alt="" width={240} height={180} unoptimized className="h-36 w-auto rounded-xl object-cover ring-1 ring-white/12" />
                <button type="button" onClick={() => setPhoto(undefined)} className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-white" aria-label="ছবি সরান"><X className="size-4" aria-hidden /></button>
              </div>
            ) : (
              <button type="button" disabled={busy} onClick={() => pick.current?.click()} className={mediaButton({ variant: "quiet", size: "sm" })}>
                <ImagePlus aria-hidden /> {busy ? "প্রস্তুত হচ্ছে…" : "প্রজেক্ট, সেটআপ বা ফলাফলের ছবি"}
              </button>
            )}
            <input
              ref={pick}
              type="file"
              accept="image/*"
              className="sr-only"
              tabIndex={-1}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setBusy(true);
                try {
                  setPhoto(await toNoteFile(file, false));
                } catch (x) {
                  toast.error(x instanceof Error ? x.message : "ছবিটি নেওয়া গেল না");
                } finally {
                  setBusy(false);
                }
              }}
            />
          </div>

          {research && (
            <fieldset>
              <legend className={label}>গবেষণা কোন ধাপে</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STAGES) as ResearchStage[]).map((s) => (
                  <label key={s} className={choiceClass(v.stage === s)}>
                    <input type="radio" name="stage" className="sr-only" checked={v.stage === s} onChange={() => setV((x) => ({ ...x, stage: s }))} />
                    {STAGES[s]}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <fieldset>
            <legend className={label}>কোথায় যাবে</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <button type="button" aria-pressed={toFeed} onClick={() => setToFeed((x) => !x)} className={cn("flex min-h-14 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold ring-2 transition-colors", toFeed ? "bg-signal-orange/10 text-signal-orange ring-signal-orange" : "text-white/70 ring-white/12 hover:ring-white/30")}>
                <Newspaper className="size-5 shrink-0" aria-hidden />
                <span>ফিডে শেয়ার<span className="block text-xs font-normal opacity-80">সবাই দেখবে, মন্তব্য করবে</span></span>
              </button>
              {research ? (
                <button type="button" aria-pressed={toResearch} onClick={() => setToResearch((x) => !x)} className={cn("flex min-h-14 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold ring-2 transition-colors", toResearch ? "bg-bd-green text-white ring-bd-green" : "text-white/70 ring-white/12 hover:ring-white/30")}>
                  <Microscope className="size-5 shrink-0" aria-hidden />
                  <span>গবেষণা পাতায় পাঠান<span className="block text-xs font-normal opacity-80">প্রশ্ন, পদ্ধতি, ফলাফলসহ জমা থাকবে</span></span>
                </button>
              ) : (
                <p className="flex items-center rounded-xl px-3 text-xs text-white/55 ring-1 ring-white/10">গবেষণা বাছলে গবেষণা পাতায় পাঠানোর বোতামও আসবে।</p>
              )}
            </div>
            {err(problems.where)}
          </fieldset>

          <button type="submit" disabled={busy} className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}><Send aria-hidden /> শেয়ার করুন</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** What the room shared out, with a way to share the next thing. */
export function ShowcasePanel({ shares, canShare, onShare }: { shares: SharedRef[]; canShare: boolean; onShare: () => void }) {
  const steps = [
    { n: 1, t: "সমস্যা বাছুন", d: "বই, ক্লাস বা এলাকার — যেটা সত্যিই কষ্ট দেয়" },
    { n: 2, t: "দল মিলে সমাধান", d: "দায়িত্ব ভাগ করে মাপুন, বানান, যাচাই করুন" },
    { n: 3, t: "সবার সাথে শেয়ার", d: "ফিডে সবাই শিখবে; গবেষণা হলে গবেষণা পাতায়" },
  ];
  return (
    <section aria-labelledby="show-title" className="space-y-4">
      <div className="story-reveal overflow-hidden rounded-3xl bg-signal-orange p-5 text-text-primary sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h2 id="show-title" className="text-2xl font-bold tracking-tight">উদ্ভাবন ও গবেষণা</h2>
            <p className="mt-1 text-sm font-medium text-text-primary/80">যা শিখলেন, তা দিয়ে কিছু সমাধান করুন — তারপর সবাইকে দেখান। ভালো কাজ ফিড থেকে চাকরি আর গবেষণার সুযোগে পৌঁছায়।</p>
          </div>
          {canShare && (
            <button type="button" onClick={onShare} className={mediaButton({ variant: "tile", size: "lg" })}>
              <Share2 aria-hidden /> দলের কাজ শেয়ার করুন
            </button>
          )}
        </div>
        <ol className="mt-5 grid gap-2 sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="flex gap-3 rounded-2xl bg-text-primary/8 p-3 ring-1 ring-text-primary/15">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-text-primary text-sm font-bold text-signal-orange"><Num value={s.n} /></span>
              <span><span className="block text-sm font-bold">{s.t}</span><span className="block text-xs text-text-primary/75">{s.d}</span></span>
            </li>
          ))}
        </ol>
      </div>

      {shares.length === 0 ? (
        <p className="rounded-2xl bg-text-primary p-5 text-center text-sm text-white/65 ring-1 ring-white/12">এখনো কিছু শেয়ার হয়নি। প্রথম সমাধানটা আপনার দলেরই হোক।</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {[...shares].sort((a, b) => b.at.localeCompare(a.at)).map((s) => {
            const Icon = SHARE_ICONS[s.kind];
            return (
              <li key={s.id} className="story-reveal flex flex-col gap-3 rounded-2xl bg-text-primary p-4 ring-1 ring-white/12">
                <span className="flex items-center gap-2 text-xs font-bold">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5", s.kind === "research" ? "bg-bd-green text-white" : "bg-signal-orange text-text-primary")}><Icon className="size-3.5" aria-hidden /> {SHARE_KINDS[s.kind].bn}</span>
                  <span className="ml-auto font-medium text-white/55"><Ago iso={s.at} live /></span>
                </span>
                <span className="font-bold text-white">{s.title}</span>
                {s.team.length > 0 && <span className="text-xs text-white/65">দল: {s.team.join(", ")}</span>}
                <span className="mt-auto flex flex-wrap gap-3 text-sm font-bold">
                  {s.postId && <Link href={`/media/post/${s.postId}`} className="inline-flex items-center gap-1 text-signal-orange hover:underline">ফিডে দেখুন <ArrowUpRight className="size-4" aria-hidden /></Link>}
                  {s.researchId && <Link href={`/media/research#${s.researchId}`} className="inline-flex items-center gap-1 text-bdgreen-500 hover:underline">গবেষণা পাতায় <ArrowUpRight className="size-4" aria-hidden /></Link>}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
