import { redirect } from "next/navigation";
import { HqProvider } from "@/components/hq/provider";
import { HqShell } from "@/components/hq/shell";
import { currentSession, viewOf } from "@/lib/hq/server/session";

export const dynamic = "force-dynamic";

/** Every signed-in HQ page: the session is verified here on the server, then the member's own view seeds the browser. */
export default async function HqAppLayout({ children }: { children: React.ReactNode }) {
  const s = await currentSession();
  if (!s) redirect("/hq/login");
  return (
    <HqProvider initial={viewOf(s)}>
      <HqShell>{children}</HqShell>
    </HqProvider>
  );
}
