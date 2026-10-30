import type { Metadata } from "next";
import { GraduationView } from "@/components/media/academy/graduation/graduation-view";

export const metadata: Metadata = { title: "সমাবর্তন · একাডেমি" };

/** Step ৯: the road to graduating, and the graduates wall. */
export default function GraduationPage() {
  return <GraduationView />;
}
