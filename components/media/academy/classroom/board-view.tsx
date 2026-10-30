"use client";

import { useAuth } from "@/lib/auth/client";
import type { Course } from "@/lib/media/academy";
import { dhakaDay, type Batch } from "@/lib/media/batch";
import type { Notice } from "@/lib/media/notices";
import { NoticeBoard } from "../../classroom/notice-board";
import { updateAcademy, useAcademy } from "../use-academy";

const NONE: Notice[] = [];

/** The notices on a batch's board, newest first. */
export const useBoard = (batchId: string) => useAcademy((a) => a.boards?.[batchId] ?? NONE);

/**
 * A batch's notice board: the same board the classrooms use — class
 * cancelled, an emergency in red, a leave with one word for the reason, late
 * work — kept on this device. The teacher posts and takes down everything;
 * learners post their own leave and late notes.
 */
export function BoardView({ batch, course, lead, me }: { batch: Batch; course: Course; lead: boolean; me: string }) {
  const { account } = useAuth();
  const notices = useBoard(batch.id);
  const meId = account?.id ?? "me";

  return (
    <div className="p-4 md:p-6">
      <NoticeBoard
        notices={notices}
        role={lead ? "teacher" : "member"}
        meId={meId}
        name={(id) => (id === meId ? me : "")}
        today={dhakaDay(new Date())}
        subjects={course.lessons.map((l) => l.title)}
        items={course.lessons.flatMap((l) => (l.homework ? [l.homework] : []))}
        onChange={(fn) => updateAcademy((a) => ({ ...a, boards: { ...a.boards, [batch.id]: fn(a.boards?.[batch.id] ?? []) } }))}
      />
    </div>
  );
}
