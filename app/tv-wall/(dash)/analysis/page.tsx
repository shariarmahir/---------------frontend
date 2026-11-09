import type { Metadata } from "next";
import { AnalysisPage } from "@/components/tv-wall/pages/analysis";

export const metadata: Metadata = { title: "Analysis" };

export default function Page() {
  return <AnalysisPage />;
}
