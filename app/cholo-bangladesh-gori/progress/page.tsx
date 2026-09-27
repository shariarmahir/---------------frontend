import type { Metadata } from "next";
import { ProgressView } from "@/components/gori/progress/progress-view";

export const metadata: Metadata = { title: "অগ্রগতি — চলো বাংলাদেশ গড়ি | কাণ্ডারী-ল্যাব" };

export default function ProgressPage() {
  return <ProgressView />;
}
