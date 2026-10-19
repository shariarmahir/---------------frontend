import type { Metadata } from "next";
import { CrimePage } from "@/components/tv-wall/pages/crime";

export const metadata: Metadata = { title: "Crime & corruption" };

export default function Page() {
  return <CrimePage />;
}
