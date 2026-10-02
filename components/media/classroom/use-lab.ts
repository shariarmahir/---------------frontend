"use client";

import { sampleLab } from "@/data/media/labs";
import { newJoinCode } from "@/lib/media/classroom";
import type { Experiment, LabExam, LabRoom, LabSubmission } from "@/lib/media/lab";
import { newId, updateMedia, useMediaState } from "@/lib/media/store";
import { bdWeekday, isFull, labDuties, type Rota } from "@/lib/media/teamwork";

/** The viewer's copy when they joined or made it, else the sample. */
export function useLab(id: string): { lab: LabRoom | undefined; joined: boolean } {
  const mine = useMediaState((s) => s.labs[id]);
  return { lab: mine ?? sampleLab(id), joined: Boolean(mine) };
}

/** Edit a lab; a sample is copied into the viewer's state first. False if the browser could not save. */
export function editLab(id: string, fn: (lab: LabRoom) => LabRoom): boolean {
  return updateMedia((s) => {
    const lab = s.labs[id] ?? sampleLab(id);
    return lab ? { ...s, labs: { ...s.labs, [id]: fn(lab) } } : s;
  });
}

/** Join unless already in; a full lab turns the viewer away. */
export function joinLab(id: string, me: { id: string; name: string }) {
  return editLab(id, (lab) =>
    lab.members.some((m) => m.id === me.id) || isFull(lab.members.length, lab.maxMembers) ? lab : { ...lab, members: [...lab.members, { id: me.id, name: me.name, accountId: me.id }] },
  );
}

/** A new lab room with the viewer as its leader. */
export function createLab(input: { name: string; course: string; institution: string; instructor?: string; students: string[]; maxMembers: number; labDay: number }, me: { id: string; name: string }): string {
  const id = newId("lab");
  const lab: LabRoom = {
    id,
    name: input.name,
    course: input.course,
    institution: input.institution,
    code: newJoinCode(),
    leaderId: me.id,
    instructor: input.instructor,
    members: [{ id: me.id, name: me.name, accountId: me.id }, ...input.students.map((name, i) => ({ id: `${id}-s${i}`, name }))],
    experiments: [],
    exams: [],
    maxMembers: input.maxMembers,
    labDay: input.labDay,
  };
  updateMedia((s) => ({ ...s, labs: { ...s.labs, [id]: lab } }));
  return id;
}

export const addExperiment = (labId: string, exp: Omit<Experiment, "id" | "submissions">) =>
  editLab(labId, (lab) => ({ ...lab, experiments: [...lab.experiments, { ...exp, id: newId("x"), submissions: [] }].sort((a, b) => a.no - b.no) }));

export const editExperiment = (labId: string, expId: string, fn: (e: Experiment) => Experiment) =>
  editLab(labId, (lab) => ({ ...lab, experiments: lab.experiments.map((e) => (e.id === expId ? fn(e) : e)) }));

/** Hand in a report or a finished-task photo; a new one replaces the member's last of that kind. */
export const handIn = (labId: string, expId: string, s: Omit<LabSubmission, "id">) =>
  editExperiment(labId, expId, (e) => ({ ...e, submissions: [...e.submissions.filter((x) => !(x.by === s.by && x.kind === s.kind)), { ...s, id: newId("h") }] }));

export const addLabExam = (labId: string, exam: Omit<LabExam, "id">) =>
  editLab(labId, (lab) => ({ ...lab, exams: [...lab.exams, { ...exam, id: newId("le") }].sort((a, b) => a.date.localeCompare(b.date)) }));

export const labMemberName = (lab: LabRoom, id: string) => lab.members.find((m) => m.id === id)?.name ?? "প্রাক্তন সদস্য";

/** The lab's duties: the leader's own, else the usual jobs round its lab day. */
export function labRota(lab: LabRoom): Rota {
  if (lab.rota) return lab.rota;
  const first = lab.experiments[0]?.date;
  const day = lab.labDay ?? (first ? bdWeekday(new Date(`${first}T12:00:00+06:00`)) : 1);
  return { duties: labDuties(day), salt: 0, done: {} };
}

export const editLabRota = (id: string, fn: (r: Rota) => Rota) => editLab(id, (lab) => ({ ...lab, rota: fn(labRota(lab)) }));
