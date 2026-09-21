import type { Metadata } from "next";

// The page itself is a client component (the session gate reads
// localStorage), so its metadata lives here.
export const metadata: Metadata = {
  title: "প্রোফাইল | কাণ্ডারী-ল্যাব",
  description:
    "কাণ্ডারী-ল্যাব সদস্য প্রোফাইল — আপনার পোস্ট, উদ্ভাবন ফিড, অনুসরণ তালিকা ও জাতীয় ট্রেন্ড।",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
