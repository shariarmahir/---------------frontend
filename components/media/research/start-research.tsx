"use client";

import { useState } from "react";
import { FlaskConical, GraduationCap, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PixelMark } from "@/components/ui/section-kit";
import { Textarea } from "@/components/ui/textarea";
import { addDays, chosenTopic, leading, pollOpen, readiness } from "@/lib/media/research-project";
import type { RoomRef, SharedRef } from "@/lib/media/showcase";
import { cn } from "@/lib/utils";
import { ShowcasePanel } from "../classroom/share-work";
import { useMe } from "../classroom/use-classroom";
import { mediaButton } from "../ui/button-styles";
import { DateText, Num } from "../ui/numerals";
import { bdToday, roomClock, startProject, useRoomProjects } from "./use-research";
import { ResearchWorkspace } from "./workspace";

/** Start from scratch: how long the topic vote runs, and the first idea. */
function StartResearchDialog({ open, onOpenChange, from, members, onStarted }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  from: RoomRef;
  members: { id: string; name: string }[];
  onStarted: (id: string) => void;
}) {
  const me = useMe();
  const today = bdToday(roomClock(from));
  const [deadline, setDeadline] = useState("");
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");

  function reset(o: boolean) {
    if (o) {
      setDeadline("");
      setTitle("");
      setWhy("");
    }
    onOpenChange(o);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    const end = deadline && deadline >= today ? deadline : addDays(today, 3);
    const id = startProject({ from, members, deadline: end, idea: title.trim().length >= 5 ? { title: title.trim(), why: why.trim() } : undefined }, me);
    reset(false);
    toast.success("গবেষণা শুরু হলো", { description: "দলকে বলুন তিনটি বিষয় প্রস্তাব করে ভোট দিতে।" });
    onStarted(id);
  }

  const label = "mb-1.5 block text-sm font-semibold text-white";
  return (
    <Dialog open={open} onOpenChange={reset}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-3xl font-sans sm:max-w-lg">
        <DialogHeader>
          <PixelMark tone="dark" />
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white"><Rocket className="size-5 text-signal-orange" aria-hidden /> গবেষণা শুরু করুন</DialogTitle>
          <DialogDescription>ছয় ধাপে শুরু থেকে শেষ: বিষয় বাছাই ভোট → সময়সূচি → কাজ ভাগ → ফাইল ও ডেটা → লেখা → শেয়ার ও প্রকাশ।</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-5">
          <label className="block">
            <span className={label}>বিষয় বাছাইয়ের ভোট চলবে যতদিন</span>
            <Input type="date" min={today} value={deadline || addDays(today, 3)} onChange={(e) => setDeadline(e.target.value)} />
            <span className="mt-1 block text-xs text-white/60">এর মধ্যে সবাই মিলে সর্বোচ্চ তিনটি বিষয় প্রস্তাব করবে আর 👍 🤔 👎 দিয়ে মত দেবে।</span>
          </label>
          <label className="block">
            <span className={label}>প্রথম বিষয়ের প্রস্তাব (ঐচ্ছিক)</span>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="যেমন: মেসের পানির ফিল্টার কত দিনে অকেজো হয়" />
          </label>
          {title.trim().length >= 5 && (
            <label className="block">
              <span className={label}>কেন জরুরি</span>
              <Textarea rows={2} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="কারা ভোগে, কেন জানা দরকার" />
            </label>
          )}
          <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full" })}><Rocket aria-hidden /> শুরু করুন</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The room's উদ্ভাবন tab: start research or share the team's work, the
 * research under way, and what the room has shared. A research opens right
 * here, in place of the list.
 */
export function InnovationTab({ from, members, member, shares, onShare }: {
  from: RoomRef;
  members: { id: string; name: string }[];
  member: boolean;
  shares: SharedRef[];
  onShare: () => void;
}) {
  const [starting, setStarting] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const projects = useRoomProjects(from.id);
  const today = bdToday(roomClock(from));

  if (open) return <ResearchWorkspace id={open} onBack={() => setOpen(null)} />;

  const research = projects.length > 0 && (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white">চলমান গবেষণা</h3>
      <ul className="grid gap-3 sm:grid-cols-2">
        {projects.map((p) => {
          const topic = chosenTopic(p) ?? (pollOpen(p, today) ? null : leading(p.ideas));
          const pct = readiness(p);
          const Icon = p.from.kind === "lab" ? FlaskConical : GraduationCap;
          return (
            <li key={p.id}>
              <button type="button" onClick={() => setOpen(p.id)} className="story-reveal group flex h-full w-full flex-col gap-3 rounded-2xl bg-text-primary p-4 text-left ring-1 ring-white/12 transition-[box-shadow,translate] duration-300 hover:-translate-y-1 hover:ring-signal-orange/50">
                <span className="flex items-center gap-2 text-xs font-bold">
                  <span className={cn("rounded-full px-2.5 py-0.5", p.topicId ? "bg-bd-green text-white" : "bg-signal-orange text-text-primary")}>{p.topicId ? "কাজ চলছে" : "বিষয় বাছাই"}</span>
                  <Icon className="size-3.5 text-white/55" aria-hidden />
                  <span className="ml-auto text-signal-orange">খুলুন →</span>
                </span>
                <span className="font-bold text-white">{topic?.title ?? "তিনটি বিষয়ের ভোট চলছে"}</span>
                {!p.topicId && <span className="text-xs text-white/65"><Num value={p.ideas.length} />/৩ প্রস্তাব · ভোট শেষ <DateText iso={p.topicDeadline} /></span>}
                <span className="mt-auto flex items-center gap-3 text-xs text-white/70">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-signal-orange" style={{ width: `${pct}%` }} /></span>
                  <Num value={pct} />% প্রস্তুত
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <>
      <ShowcasePanel shares={shares} canShare={member} onShare={onShare} onStart={member ? () => setStarting(true) : undefined} research={research || undefined} />
      <StartResearchDialog open={starting} onOpenChange={setStarting} from={from} members={members} onStarted={setOpen} />
    </>
  );
}
