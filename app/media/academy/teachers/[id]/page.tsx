import type { Metadata } from "next";
import { TeacherProfileScreen } from "@/components/media/academy/teacher-profile-screen";

export const metadata: Metadata = {
  title: "মেন্টর প্রোফাইল — কান্ডারি তৈরি একাডেমি",
};

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeacherProfileScreen id={Number(id)} />;
}
