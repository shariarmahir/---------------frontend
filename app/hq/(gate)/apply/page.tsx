import type { Metadata } from "next";
import { ApplyForm } from "@/components/hq/gate-apply";
import { readDb } from "@/lib/hq/server/store";

export const metadata: Metadata = { title: "Apply for a member ID" };
export const dynamic = "force-dynamic";

export default async function HqApplyPage() {
  const { faceLock } = await readDb();
  return <ApplyForm faceLock={faceLock} />;
}
