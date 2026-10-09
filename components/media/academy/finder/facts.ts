import { coursesOf, teacherRecords } from "@/data/media/academy";
import { sampleBatches } from "@/data/media/batches";
import { DEMO_NOW } from "@/data/media/clock";
import type { Academy, Course } from "@/lib/media/academy";
import { batchStage, seatsLeft, type Batch } from "@/lib/media/batch";
import { fitScore, type FinderAnswers } from "@/lib/media/journey";

export interface AcademyFacts {
  courses: Course[];
  /** Learners who passed with its teachers. */
  graduates: number;
  /** The teachers' class rating, weighted by how many rated. */
  rating: { avg: number; count: number };
  fees: { min: number; max: number };
  /** The soonest batch a learner can still take a seat in. */
  next?: Batch;
  stories: number;
}

/** An academy's numbers, all from its records: graduates, rating, fees, the next open batch, stories. */
export function factsOf(a: Pick<Academy, "departments">): AcademyFacts {
  const deptIds = new Set(a.departments.map((d) => d.id));
  const courses = a.departments.flatMap((d) => coursesOf(d.id));
  const records = teacherRecords.filter((t) => deptIds.has(t.dept));
  const count = records.reduce((n, r) => n + r.rating.count, 0);
  const avg = count ? records.reduce((n, r) => n + r.rating.avg * r.rating.count, 0) / count : 0;
  const ids = new Set(courses.map((c) => c.id));
  const next = sampleBatches
    .filter((b) => ids.has(b.course) && ["upcoming", "running"].includes(batchStage(b, DEMO_NOW)) && seatsLeft(b) > 0)
    .sort((x, y) => x.starts.localeCompare(y.starts))[0];
  const fees = courses.map((c) => c.fee);
  return {
    courses,
    graduates: records.reduce((n, r) => n + r.graduates, 0),
    rating: { avg: Math.round(avg * 10) / 10, count },
    fees: { min: Math.min(...fees), max: Math.max(...fees) },
    next,
    stories: records.reduce((n, r) => n + r.stories.length, 0),
  };
}

/** How well an academy suits the answers: its best-suited department. */
export const academyFit = (a: Pick<Academy, "departments">, answers: FinderAnswers) => Math.max(0, ...a.departments.map((d) => fitScore(d.fit, answers)));
