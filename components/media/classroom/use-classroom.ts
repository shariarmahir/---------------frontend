"use client";

import { sampleClassroom } from "@/data/media/classroom";
import { useAuth } from "@/lib/auth/client";
import { newJoinCode, type ClassLevel, type Classroom, type MemberStats } from "@/lib/media/classroom";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";

/** The viewer as a classroom member: their Kandari Profile, nothing more. */
export function useMe(): { id: string; name: string } | null {
  const { account } = useAuth();
  return account ? { id: account.id, name: account.name } : null;
}

/** The viewer's copy when they joined or made it, else the sample. */
export function useClassroom(id: string): { room: Classroom | undefined; joined: boolean } {
  const mine = useMediaState((s) => s.classrooms[id]);
  return { room: mine ?? sampleClassroom(id), joined: Boolean(mine) };
}

export function editClassroom(id: string, fn: (room: Classroom) => Classroom) {
  return updateMedia((s) => {
    const room = s.classrooms[id] ?? sampleClassroom(id);
    return room ? { ...s, classrooms: { ...s.classrooms, [id]: fn(room) } } : s;
  });
}

/** Credit one member's activity (shared a note, solved, helped). */
export function bump(room: Classroom, memberId: string, key: Exclude<keyof MemberStats, "assess">): Classroom {
  return {
    ...room,
    members: room.members.map((m) => (m.id === memberId ? { ...m, stats: { ...m.stats, [key]: m.stats[key] + 1 } } : m)),
  };
}

const zero: MemberStats = { notes: 0, solved: 0, helped: 0, assess: 0 };

export function joinClassroom(id: string, me: { id: string; name: string }) {
  return editClassroom(id, (room) =>
    room.members.some((m) => m.id === me.id) ? room : { ...room, members: [...room.members, { id: me.id, name: me.name, accountId: me.id, stats: zero }] },
  );
}

/** A new classroom with the viewer as its leader (CR / captain). */
export function createClassroom(input: { name: string; level: ClassLevel; institution: string; students: string[]; teacher?: { name: string; subject: string } }, me: { id: string; name: string }): string {
  const id = newId("c");
  const code = newJoinCode();
  const room: Classroom = {
    id,
    name: input.name,
    level: input.level,
    institution: input.institution,
    code,
    leaderId: me.id,
    teacher: input.teacher,
    members: [
      { id: me.id, name: me.name, accountId: me.id, stats: zero },
      ...input.students.map((name, i) => ({ id: `${id}-s${i}`, name, stats: zero })),
    ],
    topics: [],
    exams: [],
    routine: [],
    notes: [],
    problems: [],
    papers: [],
  };
  updateMedia((s) => ({ ...s, classrooms: { ...s.classrooms, [id]: room } }));
  return id;
}

/** Recompute a member's assessment average from their best paper scores. */
export function withAssess(room: Classroom, memberId: string): Classroom {
  const scores = room.papers.map((p) => p.scores[memberId]).filter((n): n is number => n !== undefined);
  if (scores.length === 0) return room;
  const assess = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  return { ...room, members: room.members.map((m) => (m.id === memberId ? { ...m, stats: { ...m.stats, assess } } : m)) };
}

export const nameOf = (room: Classroom, id: string) => room.members.find((m) => m.id === id)?.name ?? "প্রাক্তন সদস্য";

/** What every room tab gets: the room, the viewer, and what they may do. */
export interface RoomProps {
  room: Classroom;
  me: { id: string; name: string } | null;
  /** Joined: may post notes, solutions, papers. */
  member: boolean;
  /** The CR / captain: also edits routine, syllabus, exams. */
  leader: boolean;
}
