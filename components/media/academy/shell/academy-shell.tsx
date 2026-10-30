"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/client";
import { useTeacher } from "../desk/use-teacher";
import { AcademyGate, type AcademyRole } from "./academy-gate";
import { AcademyStory } from "./academy-story";

/**
 * The academy as its own full-screen place, like the classroom. Entering
 * asks whether you come to learn or to teach and plays the opening story;
 * then every page takes the whole screen with its own catalogue bar and
 * ruler (see components/media/academy/catalogue). Leaving ends the visit;
 * coming back asks again.
 */
export function AcademyShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { account } = useAuth();
  const { record } = useTeacher();
  const main = useRef<HTMLElement>(null);
  const [stage, setStage] = useState<"gate" | "story" | "on">("gate");
  const [role, setRole] = useState<AcademyRole>("learner");
  const leave = useCallback(() => router.push("/media"), [router]);
  const open = useCallback(() => setStage("on"), []);

  function enter(as: AcademyRole) {
    setRole(as);
    setStage("story");
    // A teacher coming in at the front door lands at their classrooms, or at the application.
    if (as === "teacher" && pathname === "/media/academy") router.replace(record ? "/media/academy/classroom" : "/media/academy/teach");
  }

  // The page behind stays still while the academy is open.
  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = before;
    };
  }, []);

  // A new page starts at its top; an #anchor is left to the browser.
  useEffect(() => {
    if (!window.location.hash) main.current?.scrollTo({ top: 0 });
  }, [pathname]);

  if (stage === "gate") return <AcademyGate onEnter={enter} onLeave={leave} />;
  if (stage === "story") return <AcademyStory role={role} name={account?.name} onDone={open} />;

  return (
    <div className="fixed inset-0 z-45 flex flex-col font-sans">
      <main ref={main} id="academy-main" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {children}
      </main>
    </div>
  );
}
