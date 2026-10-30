import type { Metadata } from "next";
import { EconomyPage } from "@/components/tv-wall/pages/economy";

export const metadata: Metadata = { title: "Economy" };

export default function Page() {
  return <EconomyPage />;
}
