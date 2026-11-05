import { academies, coursesOf, departments } from "@/data/media/academy";
import { sampleBatches } from "@/data/media/batches";
import { DEMO_NOW } from "@/data/media/clock";
import type { Academy, Course, Department, Mode } from "@/lib/media/academy";
import { batchStage, seatsLeft } from "@/lib/media/batch";
import { factsOf } from "../finder/facts";
import { modesOf } from "../parts";

/** The batch a newcomer would land in: one not yet started with a free seat — or, failing that, a running one that still has room. */
export interface Seat {
  starts: string;
  running: boolean;
  left: number;
}

function seatIn(codes: Set<string>): Seat | undefined {
  const open = sampleBatches.filter((b) => codes.has(b.course) && seatsLeft(b) > 0).sort((x, y) => x.starts.localeCompare(y.starts));
  const upcoming = open.find((b) => batchStage(b, DEMO_NOW) === "upcoming");
  const running = open.find((b) => batchStage(b, DEMO_NOW) === "running");
  const b = upcoming ?? running;
  return b && { starts: b.starts, running: b === running, left: seatsLeft(b) };
}

/** What a department's card shows, worked out once on the server from its records. */
export interface DeptEntry {
  dept: Department;
  /** Its first course's picture, until the academy uploads its own. */
  cover?: { src: string; alt: string };
  courses: number;
  fees: { min: number; max: number };
  seat?: Seat;
  /** Some classes happen in a real workshop, kitchen or field. */
  handsOn: boolean;
}

export function deptEntries(): DeptEntry[] {
  return departments.map((dept) => {
    const courses = coursesOf(dept.id);
    const first = courses.find((c) => c.image);
    return {
      dept,
      cover: first?.image ? { src: first.image, alt: first.title } : undefined,
      courses: courses.length,
      fees: factsOf({ departments: [dept] }).fees,
      seat: seatIn(new Set(courses.map((c) => c.id))),
      handsOn: courses.some((c) => c.lessons.some((l) => l.mode === "hands-on")),
    };
  });
}

/** "রফিকুল মোটরস গ্যারেজ *একাডেমি*": the name's last word in the academy's colour. */
export function splitName(name: string): [string, string] {
  const at = name.lastIndexOf(" ");
  return at < 0 ? ["", name] : [name.slice(0, at + 1), name.slice(at + 1)];
}

/** What an academy's card shows. `tone` is its first department's place in the catalogue, so the academy wears that department's colour. */
export interface AcademyEntry {
  academy: Academy;
  tone: number;
  cover?: { src: string; alt: string };
  courses: number;
  fees: { min: number; max: number };
  graduates: number;
  rating: { avg: number; count: number };
  seat?: Seat;
}

export function academyEntries(): AcademyEntry[] {
  return academies.map((academy) => {
    const facts = factsOf(academy);
    const first = facts.courses.find((c) => c.image);
    return {
      academy,
      tone: departments.findIndex((d) => d.id === academy.departments[0].id),
      cover: first?.image ? { src: first.image, alt: first.title } : undefined,
      courses: facts.courses.length,
      fees: facts.fees,
      graduates: facts.graduates,
      rating: facts.rating,
      seat: seatIn(new Set(facts.courses.map((c) => c.id))),
    };
  });
}

/** What a course's card shows. `tone` is its department's place in the catalogue, so a department's courses share a colour. */
export interface CourseEntry {
  course: Course;
  dept: Department;
  tone: number;
  seat?: Seat;
  modes: Mode[];
}

/** Every course, department by department in catalogue order — or only the given departments'. */
export function courseEntries(only?: string[]): CourseEntry[] {
  return departments.flatMap((dept, tone) =>
    only && !only.includes(dept.id) ? [] : coursesOf(dept.id).map((course) => ({ course, dept, tone, seat: seatIn(new Set([course.id])), modes: modesOf(course) })),
  );
}
