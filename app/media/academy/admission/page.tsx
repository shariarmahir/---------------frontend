import type { Metadata } from "next";
import { AdmissionScreen } from "@/components/media/academy/admission-screen";

export const metadata: Metadata = { 
  title: "ভর্তি পরীক্ষা — কান্ডারি তৈরি একাডেমি",
  description: "আপনার পূর্ববর্তী স্কিল, আগ্রহ এবং মেধা যাচাই করে একাডেমিতে ভর্তি হোন।" 
};

export default function AcademyAdmissionPage() {
  return <AdmissionScreen />;
}
