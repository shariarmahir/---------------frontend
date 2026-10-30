import type { Metadata } from "next";
import { NotesBoard } from "@/components/media/notes/notes";
import { PageHeader } from "@/components/media/ui/layout";

export const metadata: Metadata = { title: "নোট" };

export default function NotesPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="নোট"
        subtitle="দিনের সেরা কাজ, কাউকে সাহায্য, মনে রাখার মতো মুহূর্ত — স্টিকি নোটে লিখে রাখুন। চাইলে প্রোফাইলে পিন করুন।"
      />
      <NotesBoard />
    </div>
  );
}
