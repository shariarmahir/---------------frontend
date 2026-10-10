"use client";

import Link from "next/link";
import { AtSign, CalendarDays, Eye, GraduationCap, Link2, MapPin, MonitorPlay, Share2, UsersRound, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { deptsOfTeacher, teacherRecord } from "@/data/media/academy";
import type { Person } from "@/data/media/types";
import { DEPT_KINDS } from "@/lib/media/academy";
import { Compact, DateText, Num } from "../../ui/numerals";
import { actionClass } from "../catalogue/asset-card";
import { Modal } from "../catalogue/modal";

/**
 * A teacher's "about", in the catalogue's dialog: who they are, the
 * departments they teach in (lead or member, linked), and the channel's
 * numbers — followers, videos, views, when the panel passed them, where
 * they teach from.
 */
export function ChannelAbout({ open, onOpenChange, person, followers, videos, views }: { open: boolean; onOpenChange: (open: boolean) => void; person: Person; followers: number; videos: number; views: number }) {
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
    [
      UsersRound,
      <>
        <Compact n={followers} /> অনুসারী
      </>,
    ],
    [
      MonitorPlay,
      <>
        <Num value={videos} />
        টি ভিডিও
      </>,
    ],
    [
      Eye,
      <>
        <Num value={views} /> বার দেখা
      </>,
    ],
    ...(record
      ? ([
          [
            GraduationCap,
            <>
              <Num value={record.graduates} /> জন গ্র্যাজুয়েট
            </>,
          ],
          [
            CalendarDays,
            <>
              প্যানেল পাস করেছেন <DateText iso={record.interview.at} />
            </>,
          ],
        ] as [LucideIcon, React.ReactNode][])
      : []),
    [
      MapPin,
      <>
        {person.area ? `${person.area}, ` : ""}
        {person.district}
      </>,
    ],
  ];
  const head = "hud text-(--c-faint)";

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} label={`${person.nameBn} — পরিচিতি`} className="max-h-[85dvh] overflow-y-auto">
      <div className="border-b border-(--c-line) px-6 py-5 pr-14">
        <p className={head}>পরিচিতি</p>
        <h2 className="display mt-2 text-xl text-(--c-ink-strong)">{person.nameBn}</h2>
        {record && <p className="mt-1 text-sm font-semibold text-(--c-ink)">{record.title}</p>}
      </div>
      <div className="space-y-6 px-6 py-6">
        <p className="leading-relaxed text-(--c-ink)">{person.bio}</p>

        <div>
          <h3 className={head}>যে বিভাগে শেখান</h3>
          <ul className="mt-3 border-t border-(--c-line)">
            {depts.map((d) => (
              <li key={d.id} className="flex gap-3 border-b border-(--c-line) py-3">
                <Link2 className="mt-0.5 size-4.5 shrink-0 text-(--c-faint)" aria-hidden />
                <span className="min-w-0">
                  <Link href={`/media/academy/dept/${d.id}`} className="font-semibold text-(--c-accent-ink) underline-offset-4 hover:underline">
                    {d.name}
                  </Link>
                  <span className="hud block text-(--c-faint)">
                    {d.teachers[0] === person.handle ? "প্রধান" : "সদস্য"} · {DEPT_KINDS[d.kind]}
                    {d.place && ` · ${d.place}`}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={head}>চ্যানেলের তথ্য</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-(--c-ink)">
            {facts.map(([Icon, text], i) => (
              <li key={i} className="flex items-center gap-3">
                <Icon className="size-4.5 shrink-0 text-(--c-faint)" aria-hidden />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={share} className={actionClass}>
            <Share2 className="size-4" aria-hidden /> চ্যানেল শেয়ার
          </button>
          <Link href={`/media/u/${person.handle}`} className={actionClass}>
            পুরো প্রোফাইল ও কাজ
          </Link>
        </div>
      </div>
    </Modal>
  );
}
