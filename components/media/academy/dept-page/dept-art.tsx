"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { deptShort } from "@/data/media/academy";
import { currentUser } from "@/data/media/users";
import { durationText, type Department, watchHref } from "@/lib/media/academy";
import { useHydrated } from "@/lib/media/store";
import { useFormat } from "../../ui/numerals";
import { AcademyMediaEditor } from "./academy-media";
import { ProfileCover } from "../profile/profile-art";
import { useAcademy } from "../use-academy";

/**
 * The department's picture: its academy's photo (or the course picture),
 * the mark at its foot, and the department's short as an inverted tag in
 * the corner. The academy's own members get the photo and logo editor.
 */
export function DeptArt({ dept, fallback }: { dept: Department; fallback?: string }) {
  const hydrated = useHydrated();
  const { num } = useFormat();
  const media = useAcademy((a) => a.academyMedia[dept.id]);
  const member = hydrated && dept.teachers.includes(currentUser.handle);
  const short = deptShort(dept.id);

  return (
    <div>
      <ProfileCover dept={dept} fallback={fallback}>
        {short && (
          <Link href={watchHref(short)} className="hud absolute top-3 right-3 flex items-center gap-2 bg-(--c-invert-bg) px-3 py-1.5 font-bold text-(--c-invert-fg) transition-opacity duration-150 hover:opacity-80">
            <Play className="size-3.5 fill-current" aria-hidden />
            পরিচিতি ভিডিও · {num(durationText(short.seconds))}
          </Link>
        )}
      </ProfileCover>
      {member && (
        <div className="mt-12 flex justify-end">
          <AcademyMediaEditor dept={dept} hasPhoto={Boolean(media?.photo)} hasLogo={Boolean(media?.logo)} />
        </div>
      )}
    </div>
  );
}
