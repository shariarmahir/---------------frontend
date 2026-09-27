import type { Metadata } from "next";
import { Profile } from "@/components/gori/profile/profile";

export const metadata: Metadata = { title: "প্রোফাইল ও সেটিংস — চলো বাংলাদেশ গড়ি | কাণ্ডারী-ল্যাব" };

export default function ProfilePage() {
  return <Profile />;
}
