import type { Metadata } from "next";
import { CommandCenter } from "@/components/hq/home/command-center";

export const metadata: Metadata = { title: "Command Center" };

export default function HqHomePage() {
  return <CommandCenter />;
}
