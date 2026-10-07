"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { classVideos, teacherRecord } from "@/data/media/academy";
import { CURRENT_USER_HANDLE, personOrThrow } from "@/data/media/users";
import { cn } from "@/lib/utils";
import { Compact, Num } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { TierBadge, standingOf } from "../parts";
import { FollowButton, useFollowers } from "./follow";

const videoCount = (handle: string) => classVideos.filter((v) => v.teacher === handle).length;

/**
 * A teacher as a channel tile: the round face, name with the tick, handle,
 * followers and videos, what they teach from, their tier, and a follow button.
 */
export function ChannelCard({ handle, className }: { handle: string; className?: string }) {
  const person = personOrThrow(handle);
  const record = teacherRecord(handle);
  const followers = useFollowers(handle);
  const href = `/media/academy/teachers/${handle}`;
  return (
    <article className={cn("group flex h-full flex-col items-center rounded-2xl px-3 py-5 text-center transition-colors hover:bg-m-ink/3", className)}>
      <Link href={href} className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-m-blue" aria-label={`${person.nameBn}-এর চ্যানেল`}>
        <PersonAvatar person={person} size="xl" className="size-24 text-4xl transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none sm:size-28" />
      </Link>
      <h3 className="mt-3 flex max-w-full items-center gap-1 font-bold text-m-ink">
        <Link href={href} className="truncate hover:text-m-blue" tabIndex={-1}>
          {person.nameBn}
        </Link>
        <BadgeCheck className="size-4 shrink-0 text-m-ink/70" aria-label="ইন্টারভিউ-উত্তীর্ণ শিক্ষক" />
      </h3>
      <p className="mt-0.5 text-xs text-m-ink/60">@{handle}</p>
      <p className="mt-1 text-xs text-m-ink/70">
        <Compact n={followers} /> অনুসারী · <Num value={videoCount(handle)} />টি ভিডিও
      </p>
      {record && <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-relaxed text-m-ink/65">{record.title}</p>}
      <div className="mt-auto flex flex-col items-center gap-2 pt-3">
        {record && <TierBadge tier={standingOf(record).tier} />}
        {handle === CURRENT_USER_HANDLE ? (
          <Link href={href} className="inline-flex h-9 items-center rounded-full bg-m-ink/6 px-3.5 text-sm font-semibold text-m-ink hover:bg-m-ink/11">
            আপনার চ্যানেল
          </Link>
        ) : (
          <FollowButton handle={handle} name={person.nameBn} size="sm" />
        )}
      </div>
    </article>
  );
}
