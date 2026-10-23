import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm, SetupNotice } from "@/components/hq/gate";
import { demoOffer } from "@/lib/hq/server/demo";
import { currentSession } from "@/lib/hq/server/session";
import { missingSetup } from "@/lib/hq/server/setup";
import { readDb } from "@/lib/hq/server/store";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function HqLoginPage() {
  const missing = missingSetup();
  if (missing.length) return <SetupNotice missing={missing} />;
  if (await currentSession()) redirect("/hq");
  const { faceLock } = await readDb();
  return (
    <Suspense>
      <LoginForm faceLock={faceLock} demo={demoOffer()} />
    </Suspense>
  );
}
