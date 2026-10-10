import type { Metadata } from "next";
import { ExamView } from "@/components/media/academy/exam/exam-view";

export const metadata: Metadata = { title: "পরীক্ষা ও সনদ · একাডেমি" };

/** Step ৮ of the road: the final's rules, the open board, those who passed, and the certificate check. */
export default async function ExamPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const asked = (await searchParams).id?.trim().toUpperCase().slice(0, 40) ?? "";
  return <ExamView asked={asked} />;
}
