import type { Metadata } from "next";
import { DeptScreen } from "@/components/media/academy/dept-screen";

export const metadata: Metadata = { 
  title: "ডিপার্টমেন্ট — কান্ডারি তৈরি একাডেমি"
};

export default async function AcademyDeptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DeptScreen id={id} />;
}
