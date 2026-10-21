import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LoginForm } from "@/components/hq/gate";
import { currentSession } from "@/lib/hq/server/session";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default async function HqLoginPage() {
  if (await currentSession()) redirect("/hq");
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
