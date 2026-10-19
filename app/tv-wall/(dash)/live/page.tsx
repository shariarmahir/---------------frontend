import type { Metadata } from "next";
import { LivePage } from "@/components/tv-wall/pages/live";

export const metadata: Metadata = { title: "Live TV" };

export default function Page() {
  return <LivePage />;
}
