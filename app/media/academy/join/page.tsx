import type { Metadata } from "next";
import { JoinScreen } from "@/components/media/academy/join-screen";

export const metadata: Metadata = { 
  title: "কোর্সে যুক্ত হোন — কান্ডারি তৈরি একাডেমি"
};

export default function AcademyJoinPage() {
  return <JoinScreen />;
}
