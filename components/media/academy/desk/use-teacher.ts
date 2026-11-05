"use client";

import { useMemo } from "react";
import { coursesBy, departments, teacherRecord } from "@/data/media/academy";
import { currentUser } from "@/data/media/users";
import type { Course } from "@/lib/media/academy";
import { useAcademy } from "../use-academy";

/**
 * The signed-in member as a teacher: their interview record (none until the
 * panel passes them), their departments, live courses and the drafts built
 * on this device.
 */
export function useTeacher() {
  const drafts = useAcademy((a) => a.drafts);
  const handle = currentUser.handle;
  return useMemo(() => {
    const mine = drafts.filter((c) => c.teacher === handle);
    return {
      handle,
      person: currentUser,
      record: teacherRecord(handle),
      depts: departments.filter((d) => d.teachers.includes(handle)),
      live: coursesBy(handle),
      drafts: mine,
      find: (code: string): { course: Course; draft: boolean } | undefined => {
        const live = coursesBy(handle).find((c) => c.id === code);
        if (live) return { course: live, draft: false };
        const draft = mine.find((c) => c.id === code);
        return draft ? { course: draft, draft: true } : undefined;
      },
    };
  }, [drafts, handle]);
}
