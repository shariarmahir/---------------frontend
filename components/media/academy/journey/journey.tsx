import { Award, BookOpen, Building2, CalendarDays, ClipboardCheck, DoorOpen, Landmark, Search, Ticket, type LucideIcon } from "lucide-react";
import type { StepId } from "@/lib/media/journey";

/** Each step of the university road, drawn: find, academy, department, course, admission, routine, class, exam, graduation. */
export const STEP_ICON: Record<StepId, LucideIcon> = {
  find: Search,
  academy: Landmark,
  dept: Building2,
  course: BookOpen,
  admit: Ticket,
  routine: CalendarDays,
  class: DoorOpen,
  exam: ClipboardCheck,
  graduate: Award,
};
