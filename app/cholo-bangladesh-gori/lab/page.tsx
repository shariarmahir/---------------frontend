import type { Metadata } from "next";
import { Lab } from "@/components/gori/lab/lab";

export const metadata: Metadata = { title: "বিজ্ঞানাগার — চলো বাংলাদেশ গড়ি | কাণ্ডারী-ল্যাব" };

export default function LabPage() {
  return <Lab />;
}
