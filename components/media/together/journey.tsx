"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, BookHeart, Flag, ImagePlus, Newspaper, PenLine, Send, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { Textarea } from "@/components/ui/textarea";
import type { Team } from "@/data/media/types";
import { currentUser } from "@/data/media/users";
import type { NoteFile } from "@/lib/media/classroom";
import { addStory, BODY_MAX, STORY_KINDS, storyProblems, timeline, TITLE_MAX, type TeamRoom, type TeamStory } from "@/lib/media/team-room";
import { newId } from "@/lib/media/store";
import { cn } from "@/lib/utils";
import { toNoteFile } from "../classroom/note-files";
import { mediaButton } from "../ui/button-styles";
import { EmptyState } from "../ui/empty-state";
import { DateText } from "../ui/numerals";
import { editTeamRoom, shareTeamPost } from "./use-team-room";

type Kind = TeamStory["kind"];
export const STORY_ICON: Record<Kind, typeof Flag> = { journey: Flag, story: BookHeart };

/** The team's journey, newest first, on one line through time. */
export function JourneyTab({ team, room, canEdit, onWrite }: { team: Team; room: TeamRoom; canEdit: boolean; onWrite: (k: Kind) => void }) {
  const list = timeline(room.stories);
  return (
    <section aria-labelledby="journey-title" className="space-y-5">
      <h2 id="journey-title" className="sr-only">যাত্রা ও গল্প</h2>
      {canEdit && (
        <div className="flex flex-col gap-4 rounded-3xl bg-text-primary p-5 ring-1 ring-white/12 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-lg font-bold text-white">আজ দলের কী ঘটল?</p>
            <p className="mt-0.5 text-sm text-white/70">একটা মাইলফলক বা একটা মুহূর্ত — লিখে রাখুন, চাইলে ফিডেও যাক।</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onWrite("journey")} className={mediaButton({ variant: "primary" })}><Flag aria-hidden /> যাত্রা লিখুন</button>
            <button type="button" onClick={() => onWrite("story")} className={mediaButton({ variant: "green" })}><BookHeart aria-hidden /> গল্প লিখুন</button>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState icon="posts" title="যাত্রা এখনো লেখা হয়নি" body={canEdit ? "প্রথম দিনটা দিয়ে শুরু করুন — কেন, কে কে, কোথা থেকে।" : "দলটা লিখলেই এখানে দেখা যাবে।"} />
      ) : (
        <ol className="relative space-y-5 pl-7 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-0.5 before:rounded-full before:bg-gradient-to-b before:from-signal-orange before:via-bd-green before:to-white/10 sm:pl-10 sm:before:left-[15px]">
          {list.map((s) => <StoryItem key={s.id} story={s} team={team} canEdit={canEdit} />)}
        </ol>
      )}
    </section>
  );
}

function StoryItem({ story, team, canEdit }: { story: TeamStory; team: Team; canEdit: boolean }) {
  const router = useRouter();
  const Icon = STORY_ICON[story.kind];
  const journey = story.kind === "journey";

  function share() {
    const postId = shareTeamPost(team, story);
    if (!postId || !editTeamRoom(team.id, (r) => ({ ...r, stories: r.stories.map((x) => (x.id === story.id ? { ...x, postId } : x)) }))) {
      toast.error("এই ব্রাউজারে আর জায়গা নেই", { description: "পুরোনো ছবি বা নোট সরিয়ে আবার চেষ্টা করুন।" });
      return;
    }
    toast.success("ফিডে শেয়ার হলো", { action: { label: "দেখুন", onClick: () => router.push(`/media/post/${postId}`) } });
  }

  return (
    <li id={story.id} className="story-reveal relative scroll-mt-28">
      <span className={cn("absolute top-1 -left-7 flex size-6 items-center justify-center rounded-full ring-4 ring-black sm:-left-10 sm:size-8", journey ? "bg-signal-orange text-text-primary" : "bg-bd-green text-white")} aria-hidden>
        <Icon className="size-3.5 sm:size-4" />
      </span>
      <article className={cn("overflow-hidden rounded-2xl bg-text-primary ring-1 ring-white/12 transition-[box-shadow,translate] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-26px_var(--color-signal-orange)] motion-reduce:transition-none motion-reduce:hover:translate-y-0", story.photo && "sm:grid sm:grid-cols-[minmax(0,1fr)_14rem]")}>
        <div className="space-y-2.5 p-4 sm:p-5">
          <p className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className={cn("rounded-full px-2.5 py-0.5", journey ? "bg-signal-orange text-text-primary" : "bg-bd-green text-white")}>{STORY_KINDS[story.kind].bn}</span>
            <span className="font-medium text-white/60"><DateText iso={story.at} /></span>
          </p>
          <h3 className="text-lg leading-snug font-bold text-white">{story.title}</h3>
          <p className="text-[15px] leading-relaxed whitespace-pre-line text-white/85">{story.body}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <Link href={`/media/u/${story.by}`} className="text-xs font-semibold text-white/65 hover:text-signal-orange">লিখেছেন {story.byName}</Link>
            {story.postId ? (
              <Link href={`/media/post/${story.postId}`} className="inline-flex items-center gap-1 text-sm font-bold text-signal-orange hover:underline">ফিডে দেখুন <ArrowUpRight className="size-4" aria-hidden /></Link>
            ) : canEdit ? (
              <button type="button" onClick={share} className={mediaButton({ variant: "outline", size: "sm" })}><Share2 aria-hidden /> ফিডে শেয়ার</button>
            ) : null}
          </div>
        </div>
        {story.photo && (
          <div className="relative aspect-16/9 sm:aspect-auto sm:min-h-full">
            <Image src={story.photo} alt="" fill sizes="(min-width: 640px) 224px, 100vw" unoptimized={story.photo.startsWith("data:")} className="object-cover" />
          </div>
        )}
      </article>
    </li>
  );
}

/** Write a milestone or a story; it joins the timeline and, if wanted, the feed. */
export function StoryDialog({ team, kind, onOpenChange }: { team: Team; kind: Kind | null; onOpenChange: (o: boolean) => void }) {
  const router = useRouter();
  const [k, setK] = useState<Kind>(kind ?? "journey");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<NoteFile>();
  const [toFeed, setToFeed] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);
  const [opened, setOpened] = useState<Kind | null>(null);
  const pick = useRef<HTMLInputElement>(null);
  const problems = storyProblems({ title, body });

  // A fresh form each time the dialog opens, starting on the kind asked for.
  if (kind !== opened) {
    setOpened(kind);
    if (kind) {
      setK(kind);
      setTitle("");
      setBody("");
      setPhoto(undefined);
      setToFeed(true);
      setTried(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setTried(true);
    if (problems.title || problems.body) return;
    const at = new Date().toISOString();
    const draft = { kind: k, title: title.trim(), body: body.trim(), photo: photo?.data };
    const postId = toFeed ? shareTeamPost(team, draft) : undefined;
    if (toFeed && !postId) {
      toast.error("এই ব্রাউজারে আর জায়গা নেই", { description: "ছবি ছাড়া আবার চেষ্টা করুন।" });
      return;
    }
    const story: TeamStory = { id: newId("st"), ...draft, by: currentUser.handle, byName: currentUser.nameBn, at, postId };
    if (!editTeamRoom(team.id, (r) => addStory(r, story))) {
      toast.error("এই ব্রাউজারে আর জায়গা নেই", { description: "ছবি ছাড়া আবার চেষ্টা করুন।" });
      return;
    }
    onOpenChange(false);
    toast.success(postId ? "যাত্রায় যোগ হলো, ফিডেও গেল" : "যাত্রায় যোগ হলো", postId ? { action: { label: "ফিডে দেখুন", onClick: () => router.push(`/media/post/${postId}`) } } : undefined);
  }

  const label = "mb-1.5 block text-sm font-semibold text-white";
  const err = (m?: string) => tried && m && <span className="mt-1 block text-xs font-semibold text-crimson-bright">{m}</span>;
  return (
    <Dialog open={kind !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-xl">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white"><PenLine className="size-5 text-signal-orange" aria-hidden /> {team.name}-এর যাত্রা</DialogTitle>
          <DialogDescription>যা ঘটল, সত্যি করে লিখুন — নাম, জায়গা, সংখ্যা থাকলে গল্পটা বিশ্বাস করা সহজ।</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-5">
          <fieldset>
            <legend className={label}>কী লিখছেন?</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(["journey", "story"] as const).map((x) => {
                const Icon = STORY_ICON[x];
                const on = k === x;
                return (
                  <label key={x} className={cn("flex cursor-pointer items-start gap-3 rounded-xl p-3 ring-2 transition-colors", on ? "bg-signal-orange/10 ring-signal-orange" : "ring-white/12 hover:ring-white/30")}>
                    <input type="radio" name="story-kind" className="sr-only" checked={on} onChange={() => setK(x)} />
                    <Icon className={cn("mt-0.5 size-5 shrink-0", on ? "text-signal-orange" : "text-white/60")} aria-hidden />
                    <span>
                      <span className={cn("block text-sm font-bold", on ? "text-signal-orange" : "text-white")}>{STORY_KINDS[x].bn}</span>
                      <span className="block text-xs leading-snug text-white/65">{STORY_KINDS[x].hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <label className="block">
            <span className={label}>শিরোনাম *</span>
            <Input value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} placeholder={k === "journey" ? "যেমন: প্রথম প্রোটোটাইপ কাজ করল" : "যেমন: যে রাতে সব বদলে গেল"} aria-invalid={tried && Boolean(problems.title)} />
            {err(problems.title)}
          </label>
          <label className="block">
            <span className={label}>কী ঘটল *</span>
            <Textarea rows={5} value={body} maxLength={BODY_MAX} onChange={(e) => setBody(e.target.value)} placeholder="কে, কোথায়, কীভাবে — আর এরপর কী" aria-invalid={tried && Boolean(problems.body)} />
            {err(problems.body)}
          </label>
          <div>
            <span className={label}>ছবি (ঐচ্ছিক)</span>
            {photo ? (
              <div className="relative w-fit">
                <Image src={photo.data} alt="" width={240} height={180} unoptimized className="h-36 w-auto rounded-xl object-cover ring-1 ring-white/12" />
                <button type="button" onClick={() => setPhoto(undefined)} className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-white" aria-label="ছবি সরান"><X className="size-4" aria-hidden /></button>
              </div>
            ) : (
              <button type="button" disabled={busy} onClick={() => pick.current?.click()} className={mediaButton({ variant: "quiet", size: "sm" })}>
                <ImagePlus aria-hidden /> {busy ? "প্রস্তুত হচ্ছে…" : "দলের ছবি দিন"}
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
          <button type="button" aria-pressed={toFeed} onClick={() => setToFeed((x) => !x)} className={cn("flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-bold ring-2 transition-colors", toFeed ? "bg-signal-orange/10 text-signal-orange ring-signal-orange" : "text-white/70 ring-white/12 hover:ring-white/30")}>
            <Newspaper className="size-5 shrink-0" aria-hidden />
            <span>ফিডেও শেয়ার করুন<span className="block text-xs font-normal opacity-80">{toFeed ? "সবাই দেখবে, আর টিমের নাম থেকে রুমে আসবে" : "শুধু টিম রুমের যাত্রায় থাকবে"}</span></span>
          </button>
          <button type="submit" disabled={busy} className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}><Send aria-hidden /> যোগ করুন</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
