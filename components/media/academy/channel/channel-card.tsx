"use client";

import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { classVideos, teacherRecord } from "@/data/media/academy";
import { CURRENT_USER_HANDLE, personOrThrow } from "@/data/media/users";
import { cn } from "@/lib/utils";
import { Compact, Num } from "../../ui/numerals";
import { PersonAvatar } from "../../ui/person";
import { TierTag } from "../catalogue/tier-tag";
import { standingOf } from "../parts";
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
    <article className={cn("group flex h-full flex-col items-center px-3 py-5 text-center transition-colors hover:bg-(--c-bg-raised)", className)}>
      <Link href={href} className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--c-signal)" aria-label={`${person.nameBn}-এর চ্যানেল`}>
        <PersonAvatar person={person} size="xl" className="size-24 text-4xl transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none sm:size-28" />
      </Link>
      <h3 className="display mt-4 flex max-w-full items-center gap-1 text-base text-(--c-ink-strong)">
        <Link href={href} className="truncate hover:text-(--c-accent-ink)" tabIndex={-1}>
          {person.nameBn}
        </Link>
        <BadgeCheck className="size-4 shrink-0 text-(--c-muted)" aria-label="ইন্টারভিউ-উত্তীর্ণ শিক্ষক" />
      </h3>
      <p className="mt-0.5 text-xs text-(--c-muted)">@{handle}</p>
      <p className="mt-1 text-xs text-(--c-muted)">
        <Compact n={followers} /> অনুসারী · <Num value={videoCount(handle)} />
        টি ভিডিও
      </p>
      {record && <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-relaxed text-(--c-muted)">{record.title}</p>}
      <div className="mt-auto flex flex-col items-center gap-2 pt-3">
        {record && <TierTag tier={standingOf(record).tier} />}
        {handle === CURRENT_USER_HANDLE ? (
          <Link href={href} className="inline-flex h-9 items-center border border-(--c-line-strong) px-3.5 text-sm font-semibold text-(--c-ink-strong) transition-colors duration-150 hover:bg-(--c-invert-bg) hover:text-(--c-invert-fg)">
            আপনার চ্যানেল
          </Link>
        ) : (
          <FollowButton handle={handle} name={person.nameBn} size="sm" />
        )}
      </div>
    </article>
  );
}
