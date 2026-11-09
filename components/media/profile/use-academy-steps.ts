"use client";

import { useMemo } from "react";
import { getCourse, getDepartment } from "@/data/media/academy";
import { progressOf } from "@/lib/media/academy";
import type { DoneCourse } from "@/lib/media/cv";
import { useHydrated } from "@/lib/media/store";
import { useAcademy } from "../academy/use-academy";

/** One of the viewer's academy courses and how far it has come. */
export interface CourseStep extends DoneCourse {
  /** Attendance, homework and the project are all in. */
  done: boolean;
  /** Classes attended, 0–100. */
  pct: number;
}

/**
 * The viewer's academy courses, read from the academy itself, so a course
 * finished there shows up here — in the skills, the journey and the CV —
 * without the person writing anything twice.
 */
export function useAcademySteps(): CourseStep[] {
  const hydrated = useHydrated();
  const enrolled = useAcademy((a) => a.enrolled);
  return useMemo(() => {
    if (!hydrated) return [];
    return Object.entries(enrolled).flatMap(([id, e]) => {
      const course = getCourse(id);
      if (!course) return [];
      const p = progressOf(course, e);
      return [{ id, title: course.title, dept: getDepartment(course.dept)?.name ?? course.dept, done: p.eligible, pct: Math.round((p.attended / Math.max(1, course.lessons.length)) * 100) }];
    });
  }, [enrolled, hydrated]);
}
