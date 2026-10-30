import type { Metadata } from "next";
import { NotificationList } from "@/components/media/notifications/notifications";
import { PageHeader } from "@/components/media/ui/layout";

export const metadata: Metadata = { title: "নোটিফিকেশন" };

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="নোটিফিকেশন" subtitle="রেটিং, দরদাম, কাজ, উদ্যোগ আর এলাকার খবর — শুধু যা আপনার কাজে লাগে।" />
      <NotificationList />
    </div>
  );
}
