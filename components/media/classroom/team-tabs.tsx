"use client";

import { useState } from "react";
import type { Exam } from "@/lib/media/classroom";
import { newId } from "@/lib/media/store";
import { classDuties } from "@/lib/media/teamwork";
import { InnovationTab } from "../research/start-research";
import { DutyBoard } from "./duty-board";
import { ExamDesk } from "./exam-desk";
import type { ClassTab } from "./room";
import { ShareDialog, type SharePreset } from "./share-work";
import { classNow, classRota, editClassRota, editClassroom, nameOf } from "./use-classroom";

export const DutyTab: ClassTab = ({ room, me, member, leader }) => (
  <DutyBoard
    team={room.name}
    members={room.members}
    rota={classRota(room)}
    seed={room.id}
    now={classNow(room.id)}
    meId={me?.id}
    member={member}
    leader={leader}
    onChange={(fn) => editClassRota(room.id, fn)}
    defaults={classDuties(room.routine.map((s) => s.day))}
  />
);

const EXAM_KINDS: Record<Exam["kind"], string> = { class: "ক্লাস পরীক্ষা", public: "পাবলিক পরীক্ষা" };

/** Exams and the teacher's question papers. */
export const ExamTab: ClassTab = ({ room, me, member, leader, teacher }) => (
  <ExamDesk
    exams={room.exams}
    kinds={EXAM_KINDS}
    now={classNow(room.id)}
    meId={me?.id}
    member={member}
    manager={leader}
    teacher={teacher}
    teacherName={room.teacher?.name}
    name={(id) => nameOf(room, id)}
    onAdd={(e) => editClassroom(room.id, (r) => ({ ...r, exams: [...r.exams, { ...e, id: newId("e"), kind: e.kind as Exam["kind"] }] }))}
    onPaper={(id, paper) => editClassroom(room.id, (r) => ({ ...r, exams: r.exams.map((x) => (x.id === id ? { ...x, paper } : x)) }))}
  />
);

export const ShowTab: ClassTab = ({ room, me, member }) => {
  const [sharing, setSharing] = useState<SharePreset | null>(null);
  return (
    <>
      <InnovationTab from={{ kind: "classroom", id: room.id, name: room.name }} members={room.members} member={member} shares={room.shares ?? []} onShare={() => setSharing({ kind: "innovation" })} />
      <ClassShareDialog room={room} me={me} preset={sharing} onClose={() => setSharing(null)} />
    </>
  );
};

/** The share dialog bound to a classroom: credits go to its members, the record to its shares. */
export function ClassShareDialog({ room, me, preset, onClose }: Pick<Parameters<ClassTab>[0], "room" | "me"> & { preset: SharePreset | null; onClose: () => void }) {
  return (
    <ShareDialog
      open={preset !== null}
      onOpenChange={(o) => !o && onClose()}
      from={{ kind: "classroom", id: room.id, name: room.name }}
      members={room.members}
      meId={me?.id}
      preset={preset ?? undefined}
      onShared={(ref) => editClassroom(room.id, (r) => ({ ...r, shares: [ref, ...(r.shares ?? [])] }))}
    />
  );
}
