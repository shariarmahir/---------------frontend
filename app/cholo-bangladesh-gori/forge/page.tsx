import type { Metadata } from "next";
import { Forge } from "@/components/gori/forge/forge";

export const metadata: Metadata = { title: "দৃশ্যকল্প কারখানা — চলো বাংলাদেশ গড়ি | কাণ্ডারী-ল্যাব" };

export default function ForgePage() {
  return <Forge />;
}
