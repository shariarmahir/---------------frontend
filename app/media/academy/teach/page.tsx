import type { Metadata } from "next";
import { TeachView } from "@/components/media/academy/teach-view";

export const metadata: Metadata = { title: "একাডেমি খুলুন · শিক্ষক হোন" };

/** Apply to teach: open an academy of one's own, or join a team's. */
export default async function TeachPage({ searchParams }: { searchParams: Promise<{ dept?: string }> }) {
  const { dept } = await searchParams;
  return <TeachView dept={dept} />;
}
