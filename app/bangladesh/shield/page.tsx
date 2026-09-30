import type { Metadata } from "next";
import { ActOpener } from "@/components/desh/act-opener";
import { CitizenShield } from "@/components/desh/citizen-shield";
import { DeshShell } from "@/components/desh/desh-shell";
import { SummaryPlaceholder } from "@/components/desh/summary-placeholder";
import { ruralBackdrops } from "@/data/rural-life";

export const metadata: Metadata = {
  title: "নাগরিক ঢাল — বাংলাদেশ সমস্যা ও সমাধান | কাণ্ডারী-ল্যাব",
  description: "নিজেকে থেকে প্রতিবেশী, পাড়া থেকে দেশ — নিজের এলাকা রক্ষায় নাগরিকের ঢাল ও দায়িত্ব।",
};

export default function BangladeshShieldPage() {
  return (
    <DeshShell current="/bangladesh/shield">
      <ActOpener act="crisis" photo={ruralBackdrops.floodBoat} />
      <CitizenShield />
      <SummaryPlaceholder />
    </DeshShell>
  );
}
