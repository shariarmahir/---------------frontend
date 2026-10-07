"use client";

import Link from "next/link";
import { AtSign, CalendarDays, Eye, GraduationCap, Link2, MapPin, MonitorPlay, Share2, UsersRound, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deptsOfTeacher, teacherRecord } from "@/data/media/academy";
import type { Person } from "@/data/media/types";
import { DEPT_KINDS } from "@/lib/media/academy";
import { mediaButton } from "../../ui/button-styles";
import { Compact, DateText, Num } from "../../ui/numerals";

/**
 * A teacher's "about": who they are, the departments they teach in (lead
 * or member, linked), and the channel's numbers — followers, videos, views,
 * when the panel passed them, where they teach from.
 */
export function ChannelAbout({
  open,
  onOpenChange,
  person,
  followers,
  videos,
  views,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: Person;
  followers: number;
  videos: number;
  views: number;
}) {
  const record = teacherRecord(person.handle);
  const depts = deptsOfTeacher(person.handle);

  function share() {
    navigator.clipboard
      ?.writeText(new URL(`/media/academy/teachers/${person.handle}`, window.location.origin).href)
      .then(() => toast.success("চ্যানেলের লিংক কপি হলো"))
      .catch(() => toast.error("কপি করা গেল না"));
  }

  const facts: [LucideIcon, React.ReactNode][] = [
    [AtSign, <>@{person.handle}</>],
    [UsersRound, <><Compact n={followers} /> অনুসারী</>],
    [MonitorPlay, <><Num value={videos} />টি ভিডিও</>],
    [Eye, <><Num value={views} /> বার দেখা</>],
    ...(record
      ? ([
          [GraduationCap, <><Num value={record.graduates} /> জন গ্র্যাজুয়েট</>],
          [CalendarDays, <>প্যানেল পাস করেছেন <DateText iso={record.interview.at} /></>],
        ] as [LucideIcon, React.ReactNode][])
      : []),
    [MapPin, <>{person.area ? `${person.area}, ` : ""}{person.district}</>],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl bg-m-card font-sans sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-m-ink">পরিচিতি</DialogTitle>
          <DialogDescription className="sr-only">{person.nameBn}-এর চ্যানেলের তথ্য</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 text-[15px] leading-relaxed text-m-ink/90">
          {record && <p className="font-semibold text-m-ink">{record.title}</p>}
          <p>{person.bio}</p>
        </div>

        <h3 className="mt-2 font-bold text-m-ink">যে বিভাগে শেখান</h3>
        <ul className="space-y-2.5">
          {depts.map((d) => (
            <li key={d.id} className="flex gap-3">
              <Link2 className="mt-0.5 size-4.5 shrink-0 text-m-ink/60" aria-hidden />
              <span className="min-w-0">
                <Link href={`/media/academy/dept/${d.id}`} className="font-semibold text-m-blue hover:underline">
                  {d.name}
                </Link>
                <span className="block text-xs text-m-ink/65">
                  {d.teachers[0] === person.handle ? "প্রধান" : "সদস্য"} · {DEPT_KINDS[d.kind]}
                  {d.place && ` · ${d.place}`}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <h3 className="mt-2 font-bold text-m-ink">চ্যানেলের তথ্য</h3>
        <ul className="space-y-2.5 text-sm text-m-ink/85">
          {facts.map(([Icon, text], i) => (
            <li key={i} className="flex items-center gap-3">
              <Icon className="size-4.5 shrink-0 text-m-ink/60" aria-hidden />
              <span>{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={share} className={mediaButton({ variant: "quiet", size: "sm", className: "rounded-full" })}>
            <Share2 aria-hidden /> চ্যানেল শেয়ার
          </button>
          <Link href={`/media/u/${person.handle}`} className={mediaButton({ variant: "quiet", size: "sm", className: "rounded-full" })}>
            পুরো প্রোফাইল ও কাজ
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
