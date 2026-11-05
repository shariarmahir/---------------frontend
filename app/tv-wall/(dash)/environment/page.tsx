import type { Metadata } from "next";
import { EnvironmentPage } from "@/components/tv-wall/pages/environment";

export const metadata: Metadata = { title: "Losses & environment" };

export default function Page() {
  return <EnvironmentPage />;
}
