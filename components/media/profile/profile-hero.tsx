"use client";

import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, FileText, MapPin, SquarePen } from "lucide-react";
import type { Person } from "@/data/media/types";
import { teams } from "@/data/media/teams";
import { useAuth } from "@/lib/auth/client";
import { cn } from "@/lib/utils";
import { FollowButton } from "../feed/post-actions";
import { mediaButton } from "../ui/button-styles";
import { Num } from "../ui/numerals";
import { PersonAvatar } from "../ui/person";
import { IdSeal } from "../ui/trust";
import { glass } from "./glass";
import { FollowerCount, OwnLocation } from "./profile-parts";

/** A Bangladesh landscape per member, the same every visit. */
const COVERS = ["sajek", "haor", "teagarden", "mustard", "ratargul", "village", "river", "kashful", "sundarbans", "winterfog", "jaflong", "kaptai"];
function coverFor(handle: string) {
  let h = 0;
  for (const ch of handle) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `/bangladesh/${COVERS[h % COVERS.length]}.jpg`;
}

/** The framed picture on the right: the viewer's own photo if they added one, else a landscape with the avatar over it. */
function Portrait({ person, self }: { person: Person; self: boolean }) {
  const photo = useAuth().account?.photo;
  const mine = self && photo ? photo : null;
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-m-ink/12 bg-m-mist sm:aspect-square">
        <Image
          src={mine ?? coverFor(person.handle)}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 28rem, 90vw"
          unoptimized={Boolean(mine?.startsWith("data:"))}
          className="object-cover object-top"
        />
        {!mine && (
          <>
            <span aria-hidden className="absolute inset-0 bg-linear-to-t from-black/55 to-transparent" />
            <PersonAvatar person={person} size="xl" className="absolute bottom-5 left-5 size-20 ring-4 ring-m-card" />
          </>
        )}
      </div>
      <p className={cn(glass, "absolute -top-3 right-3 rounded-2xl px-4 py-2.5 text-center sm:-right-3")}>
        <span className="block text-xl font-bold text-m-ink">
          <Num value={person.joined.slice(0, 4)} />
        </span>
        <span className="block text-[11px] text-m-ink/65">সালে যোগ দিয়েছেন</span>
      </p>
      <p className={cn(glass, "absolute right-3 -bottom-4 rounded-2xl px-4 py-2.5 sm:-right-3")}>
        <span className="block text-xl font-bold text-m-blue">
          <FollowerCount handle={person.handle} base={person.followers} />
        </span>
        <span className="block text-[11px] text-m-ink/65">অনুসারী</span>
      </p>
    </div>
  );
}

/** The top of a profile: who they are in a line, what to do next, and their picture, framed like the reference. */
export function ProfileHero({ person, self }: { person: Person; self: boolean }) {
  const theirTeams = teams.filter((t) => t.members.includes(person.handle)).slice(0, 4);
  return (
    <section
      aria-label="পরিচয়"
      className={cn(
        glass,
        "relative overflow-hidden p-5 sm:p-8 lg:p-10",
        "bg-[radial-gradient(36rem_18rem_at_100%_0%,color-mix(in_srgb,var(--color-m-blue)_22%,transparent),transparent_70%),radial-gradient(28rem_16rem_at_0%_100%,color-mix(in_srgb,var(--color-m-yellow)_12%,transparent),transparent_70%)]",
      )}
    >
      <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold tracking-wide text-m-blue uppercase">হ্যালো, আমি</p>
          <h1 className="mt-2 flex flex-wrap items-center gap-x-3 text-4xl leading-tight font-bold text-m-ink sm:text-5xl">
            {person.nameBn}
            {person.idVerified && <IdSeal size={30} />}
          </h1>
          <p className="mt-1 text-sm text-m-ink/60">
            {person.name} · @{person.handle}
          </p>
          <p className="mt-3 text-xl font-bold text-m-yellow sm:text-2xl">{person.headline}</p>
          <p className="mt-4 line-clamp-3 max-w-xl text-[15px] leading-relaxed text-m-ink/80">{person.bio}</p>
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-m-ink/65">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" aria-hidden />
              {self ? <OwnLocation area={person.area} district={person.district} /> : `${person.area}, ${person.district}`}
            </span>
            {person.openToWork && (
              <span className="inline-flex items-center gap-1 text-m-green">
                <span aria-hidden className="size-2 rounded-full bg-m-green" /> কাজের জন্য খোলা
              </span>
            )}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {self ? (
              <>
                <Link href="/media/me/cv" className={mediaButton({ variant: "primary", size: "lg" })}>
                  <FileText aria-hidden /> CV তৈরি করুন
                </Link>
                <Link href="/media/post/new" className={mediaButton({ variant: "quiet", size: "lg" })}>
                  <SquarePen aria-hidden /> পোস্ট করুন
                </Link>
              </>
            ) : (
              <>
                <FollowButton handle={person.handle} size="md" />
                <a href="#connect" className={mediaButton({ variant: "primary", size: "lg" })}>
                  <BriefcaseBusiness aria-hidden /> কাজে নিন
                </a>
                <Link href={`/media/u/${person.handle}/cv`} className={mediaButton({ variant: "quiet", size: "lg" })}>
                  <FileText aria-hidden /> CV নামান
                </Link>
              </>
            )}
          </div>

          {theirTeams.length > 0 && (
            <div className="mt-7">
              <p className="text-xs text-m-ink/55">যাদের সাথে কাজ করেন</p>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
                {theirTeams.map((t) => (
                  <li key={t.id}>
                    <Link href={`/media/together/team/${t.id}`} className="text-sm font-bold text-m-ink/70 transition-colors hover:text-m-ink">
                      {t.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Portrait person={person} self={self} />
      </div>
    </section>
  );
}
