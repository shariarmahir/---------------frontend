import localFont from "next/font/local";
import { ClassroomSession } from "@/components/media/classroom/focus/classroom-session";

/**
 * The brand's Li Sirajee 3D face, cut down to the letters of the classroom's
 * proverbs. It is Bijoy-encoded, so a fallback would show Latin letters:
 * "block" keeps the text hidden until the font is in.
 */
const slogan = localFont({ src: "../../../public/font/kandari-slogan.woff2", variable: "--font-slogan", display: "block" });

/** Every classroom page opens behind the entry gate, then full screen with the two chats. */
export default function ClassroomLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={slogan.variable}>
      <ClassroomSession>{children}</ClassroomSession>
    </div>
  );
}
