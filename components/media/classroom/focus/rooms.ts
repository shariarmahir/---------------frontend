"use client";

import { useMemo } from "react";
import { sampleClassrooms } from "@/data/media/classroom";
import { sampleLabs } from "@/data/media/labs";
import type { Classroom } from "@/lib/media/classroom";
import type { LabRoom } from "@/lib/media/lab";
import { useMediaState } from "@/lib/media/store";

/** A room as the side panels see it. */
export interface RoomCard {
  kind: "class" | "lab";
  id: string;
  name: string;
  leaderId: string;
  teacherId?: string;
  teacher?: string;
  subject?: string;
  level?: string;
  members: { id: string; name: string; accountId?: string }[];
  sample: boolean;
  /** The viewer made or joined it. */
  mine: boolean;
}

const fromClass = (c: Classroom, sample: Classroom | undefined, mine: boolean): RoomCard => ({
  kind: "class",
  id: c.id,
  name: c.name,
  leaderId: c.leaderId,
  teacherId: c.teacherId ?? sample?.teacherId,
  teacher: (c.teacher ?? sample?.teacher)?.name,
  subject: (c.teacher ?? sample?.teacher)?.subject,
  level: c.level,
  members: c.members,
  sample: Boolean(sample),
  mine,
});

const fromLab = (l: LabRoom, sample: LabRoom | undefined, mine: boolean): RoomCard => ({
  kind: "lab",
  id: l.id,
  name: l.name,
  leaderId: l.leaderId,
  teacherId: l.teacherId ?? sample?.teacherId,
  teacher: l.instructor ?? sample?.instructor,
  subject: l.course,
  members: l.members,
  sample: Boolean(sample),
  mine,
});

/** Every classroom and lab this device knows: the viewer's own copies first, then the samples. */
export function useRooms(): RoomCard[] {
  const classes = useMediaState((s) => s.classrooms);
  const labs = useMediaState((s) => s.labs);
  return useMemo(() => {
    const out: RoomCard[] = [];
    for (const c of Object.values(classes)) out.push(fromClass(c, sampleClassrooms.find((x) => x.id === c.id), true));
    for (const l of Object.values(labs)) out.push(fromLab(l, sampleLabs.find((x) => x.id === l.id), true));
    for (const c of sampleClassrooms) if (!classes[c.id]) out.push(fromClass(c, c, false));
    for (const l of sampleLabs) if (!labs[l.id]) out.push(fromLab(l, l, false));
    return out;
  }, [classes, labs]);
}

/** The room the centre shows, from the address: /media/classroom/<id> or /media/classroom/lab/<id>. */
export function roomInPath(pathname: string): string | null {
  const m = /^\/media\/classroom\/(?:lab\/)?([^/]+)/.exec(pathname);
  return m && m[1] !== "lab" ? decodeURIComponent(m[1]) : null;
}
