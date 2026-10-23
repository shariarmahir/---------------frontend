import type { Metadata } from "next";
import { Profile } from "@/components/hq/admin/people";

export const metadata: Metadata = { title: "Profile" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Profile id={id} />
  );
}
