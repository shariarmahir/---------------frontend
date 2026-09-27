import type { Metadata } from "next";
import { Compare } from "@/components/gori/compare/compare";

export const metadata: Metadata = { title: "দৃশ্যকল্প তুলনা — চলো বাংলাদেশ গড়ি | কাণ্ডারী-ল্যাব" };

export default function ComparePage() {
  return <Compare />;
}
