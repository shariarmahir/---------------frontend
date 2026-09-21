import type { Metadata } from "next";

// The page is a client component (session gate + follow state), so its
// metadata lives here.
export const metadata: Metadata = {
  title: "সদস্য প্রোফাইল | কাণ্ডারী-ল্যাব",
  description:
    "কাণ্ডারী-ল্যাব সদস্যের পাবলিক প্রোফাইল — উদ্ভাবন, ক্লিনিক্যাল টেলিমেট্রি ও মার্জ করা সলিউশন।",
};

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
