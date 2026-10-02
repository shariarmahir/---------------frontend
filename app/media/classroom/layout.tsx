import { ClassroomSession } from "@/components/media/classroom/focus/classroom-session";

/** Every classroom page opens behind the entry gate, then full screen with the two chats. */
export default function ClassroomLayout({ children }: { children: React.ReactNode }) {
  return <ClassroomSession>{children}</ClassroomSession>;
}
