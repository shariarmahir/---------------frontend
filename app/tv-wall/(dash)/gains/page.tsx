import type { Metadata } from "next";
import { GainsPage } from "@/components/tv-wall/pages/gains";

export const metadata: Metadata = { title: "Achievements" };

export default function Page() {
  return <GainsPage />;
}
