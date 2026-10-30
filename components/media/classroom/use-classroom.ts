"use client";

import { sampleClassroom } from "@/data/media/classroom";
import { DEMO_NOW } from "@/data/media/clock";
import { useAuth } from "@/lib/auth/client";
import { newJoinCode, type ClassLevel, type Classroom, type MemberStats } from "@/lib/media/classroom";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import type { Role } from "@/lib/media/notices";
import { classDuties, isFull, type Rota } from "@/lib/media/teamwork";
import { useParentView } from "./focus/session-context";

/**
 * The viewer as a classroom member: their Kandari Profile, nothing more. A
 * parent watching a child is nobody in the room, so every room shows them
 * its read-only guest view.
 */
export function useMe(): { id: string; name: string } | null {
  const { account } = useAuth();
  const parent = useParentView();
  return account && !parent ? { id: account.id, name: account.name } : null;
}

/** Sample classes are dated round the demo clock; classes people make run on real time. */
export const classNow = (id: string) => (sampleClassroom(id) ? DEMO_NOW : new Date());

/**
 * A copy saved before the sample gained a field (teacher, notices, papers)
 * takes it from the sample; anything the viewer changed stays theirs.
 */
function fill(mine: Classroom | undefined, sample: Classroom | undefined): Classroom | undefined {
  if (!mine || !sample) return mine;
  return {
    ...mine,
    teacher: mine.teacher ?? sample.teacher,
    teacherId: mine.teacherId ?? sample.teacherId,
    teacherCode: mine.teacherCode ?? sample.teacherCode,
    notices: mine.notices ?? sample.notices,
    exams: mine.exams.map((e) => (e.paper ? e : { ...e, paper: sample.exams.find((x) => x.id === e.id)?.paper })),
  };
}

/** The viewer's copy when they joined or made it, else the sample. */
export function useClassroom(id: string): { room: Classroom | undefined; joined: boolean } {
  const mine = useMediaState((s) => s.classrooms[id]);
  return { room: fill(mine, sampleClassroom(id)) ?? sampleClassroom(id), joined: Boolean(mine) };
}

export function editClassroom(id: string, fn: (room: Classroom) => Classroom) {
  return updateMedia((s) => {
    const room = fill(s.classrooms[id], sampleClassroom(id)) ?? sampleClassroom(id);
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

/** Join unless already in; a full class turns the viewer away. */
export function joinClassroom(id: string, me: { id: string; name: string }) {
  return editClassroom(id, (room) =>
    room.members.some((m) => m.id === me.id) || isFull(room.members.length, room.maxMembers) ? room : { ...room, members: [...room.members, { id: me.id, name: me.name, accountId: me.id, stats: zero }] },
  );
}

/** The teacher's own account takes over the teacher's seat; a full class does not matter to them. */
export function joinClassAsTeacher(id: string, me: { id: string; name: string }) {
  return editClassroom(id, (room) => ({ ...room, teacherId: me.id, teacher: { name: me.name, subject: room.teacher?.subject ?? "তত্ত্বাবধান" } }));
}

/**
 * A new classroom. A CR creating it leads it and names the teacher; a teacher
 * creating it runs it, and the first student listed becomes the CR.
 */
export function createClassroom(
  input: { name: string; level: ClassLevel; institution: string; students: string[]; teacher: { name: string; subject: string }; asTeacher: boolean; maxMembers: number },
  me: { id: string; name: string },
): string {
  const id = newId("c");
  const code = newJoinCode();
  const students = input.students.map((name, i) => ({ id: `${id}-s${i}`, name, stats: zero }));
  const room: Classroom = {
    id,
    name: input.name,
    level: input.level,
    institution: input.institution,
    code,
    teacherCode: newJoinCode(),
    leaderId: input.asTeacher ? (students[0]?.id ?? me.id) : me.id,
    teacher: input.asTeacher ? { name: me.name, subject: input.teacher.subject } : input.teacher,
    teacherId: input.asTeacher ? me.id : undefined,
    members: input.asTeacher ? students : [{ id: me.id, name: me.name, accountId: me.id, stats: zero }, ...students],
    topics: [],
    exams: [],
    routine: [],
    notes: [],
    problems: [],
    papers: [],
    maxMembers: input.maxMembers,
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

/** The class's duties: the leader's own, else everyday jobs on its routine days. */
export function classRota(room: Classroom): Rota {
  return room.rota ?? { duties: classDuties(room.routine.map((s) => s.day)), salt: 0, done: {} };
}

export const editClassRota = (id: string, fn: (r: Rota) => Rota) => editClassroom(id, (room) => ({ ...room, rota: fn(classRota(room)) }));

export const nameOf = (room: Classroom, id: string) =>
  room.members.find((m) => m.id === id)?.name ?? (id === room.teacherId && room.teacher ? room.teacher.name : "প্রাক্তন সদস্য");

/** What every room tab gets: the room, the viewer, and what they may do. */
export interface RoomProps {
  room: Classroom;
  me: { id: string; name: string } | null;
  /** Joined: may post notes, solutions, papers. */
  member: boolean;
  /** The CR / captain, or the teacher: also edits routine, syllabus, exams. */
  leader: boolean;
  /** The class teacher: everything the leader does, plus question papers. */
  teacher: boolean;
  role: Role;
}
