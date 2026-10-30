import type { Metadata } from "next";
import { PrivacySettings } from "@/components/media/settings/privacy-settings";
import { PageHeader } from "@/components/media/ui/layout";

export const metadata: Metadata = { title: "গোপনীয়তা ও সময়" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="গোপনীয়তা ও সময়" subtitle="কে কী দেখবে, আর কতক্ষণ পর বিরতি — আপনি ঠিক করুন।" />
      <PrivacySettings />
    </div>
  );
}
