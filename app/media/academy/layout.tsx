import { AcademyShell } from "@/components/media/academy/shell/academy-shell";

/** Every academy page opens full screen, in the academy's own frame. */
export default function AcademyLayout({ children }: { children: React.ReactNode }) {
  return <AcademyShell>{children}</AcademyShell>;
}
