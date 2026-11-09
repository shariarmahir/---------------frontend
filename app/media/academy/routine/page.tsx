import type { Metadata } from "next";
import { RoutineView } from "@/components/media/academy/routine/routine-view";

export const metadata: Metadata = { title: "রুটিন · একাডেমি" };

/** Step ৬: the learner's weekly class routine. */
export default function RoutinePage() {
  return <RoutineView />;
}
