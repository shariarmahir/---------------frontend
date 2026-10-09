"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { Academy } from "@/lib/media/academy";
import { GOALS, fitScore } from "@/lib/media/journey";
import { useHydrated } from "@/lib/media/store";
import { DeptIcon } from "../departments/dept-icons";
import { useAcademy } from "../use-academy";

/**
 * The academy's picture in a ruled frame, its mark breaking the frame's
 * foot. Once the academy uploads its own photo and logo (kept on this
 * device in the demo) they take the place of its first course's picture
 * and its department's drawn icon.
 */
export function ProfileCover({ academy: a, fallback }: { academy: Academy; fallback?: string }) {
  const hydrated = useHydrated();
  const first = a.departments[0];
  const media = useAcademy((s) => s.academyMedia[first.id]);
  const cover = (hydrated && media?.photo) || fallback;
  const logo = hydrated ? media?.logo : undefined;

  return (
    <div className="relative">
      <div className="group/frame relative aspect-4/3 overflow-hidden border border-(--c-line) bg-(--c-bg-sunken)">
        {cover && (
          <Image src={cover} alt="" fill priority sizes="(min-width: 1024px) 34rem, 92vw" className="object-cover transition-transform duration-500 group-hover/frame:scale-[1.02] motion-reduce:transition-none" />
        )}
      </div>
      <span className="absolute -bottom-7 left-6 grid size-20 place-items-center overflow-hidden rounded-[1.3rem] bg-[color-mix(in_srgb,var(--c-app)_28%,white)] drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] md:left-8">
        {logo ? <Image src={logo} alt="" width={80} height={80} unoptimized className="size-full object-cover" /> : <DeptIcon dept={first.id} school={first.school} className="size-12" />}
      </span>
    </div>
  );
}

/** Under the promise, once the finder has a dream: which of this academy's departments suits it best. */
export function FinderMatch({ academy: a }: { academy: Academy }) {
  const hydrated = useHydrated();
  const finder = useAcademy((s) => s.finder);
  if (!hydrated || !finder?.goal) return null;
  const best = [...a.departments].sort((x, y) => fitScore(y.fit, finder) - fitScore(x.fit, finder))[0];
  return (
    <p className="hud mt-6 inline-flex w-fit items-center gap-2 bg-(--c-signal) px-3 py-1.5 font-bold text-black">
      <Sparkles className="size-3.5" aria-hidden />
      আপনার স্বপ্ন “{GOALS[finder.goal]}” — {best.name} বিভাগ সবচেয়ে মেলে
    </p>
  );
}
