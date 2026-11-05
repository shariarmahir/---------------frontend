import { foundingBatch, roomName, type Batch, type RoomMessage } from "@/lib/media/batch";
import { courses, getCourse, rosterOf } from "./academy";

/**
 * The sample batches. Every course's first batch is the course itself (its
 * code, start and seats). Courses already running have opened a second
 * batch for 17 October, three days later in the week, so the teacher's
 * hours never clash. Sample data for the demo.
 */
const SECOND = "2026-10-17";

export const sampleBatches: Batch[] = courses.flatMap((c) => {
  const first = foundingBatch(c);
  if (c.starts >= SECOND) return [first];
  const second: Batch = {
    ...first,
    id: `${c.id}-B2`,
    n: 2,
    starts: SECOND,
    day: (first.day + 3) % 7,
    enrolled: Math.floor(c.seats / 3),
    room: roomName(`${c.id}-B2`, `b2${c.id.length}${c.seats}${c.enrolled}`),
    opened: "2026-09-20",
  };
  return [first, second];
});

/**
 * A few lines in each first batch's chat, so a classroom never opens empty:
 * the teacher's welcome, a learner's question, the teacher's answer.
 */
export function sampleChat(batch: Batch): RoomMessage[] {
  const course = getCourse(batch.course);
  if (!course || batch.n !== 1 || course.enrolled < 2) return [];
  const [a, b] = rosterOf(course);
  const l1 = course.lessons[0];
  const l2 = course.lessons[1];
  return [
    { id: `${batch.id}-m1`, by: { handle: course.teacher }, text: `সবাইকে স্বাগতম! প্রথম সপ্তাহ “${l1.title}” — ক্লাসের আগে সিলেবাসটা একবার দেখে আসবেন।`, at: `${batch.starts}T09:00:00.000Z` },
    { id: `${batch.id}-m2`, by: { name: a.name }, text: l1.homework ? `“${l1.homework}” — এটা কি ছবি তুলে দিলে চলবে?` : "রেকর্ডিং কি ক্লাসের পরেই পাওয়া যাবে?", at: `${batch.starts}T14:10:00.000Z` },
    { id: `${batch.id}-m3`, by: { handle: course.teacher }, text: l1.homework ? "হ্যাঁ, ছবি আর দুই লাইনের ব্যাখ্যা দিন — কী দেখলেন, কেন।" : "হ্যাঁ, ক্লাস শেষের এক ঘণ্টার মধ্যে ভিডিও ট্যাবে উঠে যায়।", at: `${batch.starts}T14:32:00.000Z` },
    { id: `${batch.id}-m4`, by: { name: b.name }, text: `পরের ক্লাস “${l2.title}” — আমি তৈরি 🙌`, at: `${batch.starts}T16:05:00.000Z` },
  ];
}
