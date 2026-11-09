"use client";

import { useMemo } from "react";
import { getCourse, getDepartment } from "@/data/media/academy";
import { sampleBatches, sampleChat } from "@/data/media/batches";
import { DEMO_NOW } from "@/data/media/clock";
import { currentUser } from "@/data/media/users";
import type { Course } from "@/lib/media/academy";
import { batchStage, seatsLeft, type Batch, type RoomMessage } from "@/lib/media/batch";
import { useAcademy } from "../use-academy";

const NONE: RoomMessage[] = [];

/** Every classroom: the sample batches, then the ones opened on this device. */
export function useBatches(): Batch[] {
  const mine = useAcademy((a) => a.batches);
  return useMemo(() => [...sampleBatches, ...(mine ?? [])], [mine]);
}

/** A course's batches, soonest first. */
export function useCourseBatches(course: string): Batch[] {
  const all = useBatches();
  return useMemo(() => all.filter((b) => b.course === course).sort((a, b) => a.starts.localeCompare(b.starts) || a.n - b.n), [all, course]);
}

/** Can a learner still take a seat: not yet in its project days, and seats left. */
export const joinable = (b: Batch, mine = false) => ["upcoming", "running"].includes(batchStage(b, DEMO_NOW)) && seatsLeft(b, mine) > 0;

/** The batch a learner would land in by default: the soonest they can still join. */
export const defaultBatch = (batches: Batch[]) => batches.find((b) => joinable(b));

/** Does the signed-in member teach this course — its lead, or a member of its academy? */
export function teaches(course: Pick<Course, "teacher" | "dept">, handle = currentUser.handle): boolean {
  return course.teacher === handle || Boolean(getDepartment(course.dept)?.teachers.includes(handle));
}

/** A batch's chat: the sample opening lines, then what was written on this device. */
export function useRoomChat(batch: Batch | undefined): RoomMessage[] {
  const kept = useAcademy((a) => (batch ? a.roomChat?.[batch.id] : undefined) ?? NONE);
  return useMemo(() => (batch ? [...sampleChat(batch), ...kept] : NONE), [batch, kept]);
}

/** The viewer's classrooms as a learner: each enrolled course's batch. */
export function useMyRooms(): { batch: Batch; course: Course }[] {
  const all = useBatches();
  const enrolled = useAcademy((a) => a.enrolled);
  return useMemo(
    () =>
      Object.entries(enrolled).flatMap(([code, e]) => {
        const course = getCourse(code);
        const batch = all.find((b) => b.id === (e.batch ?? code));
        return course && batch ? [{ batch, course }] : [];
      }),
    [all, enrolled],
  );
}
