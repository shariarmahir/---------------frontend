import type { Metadata } from "next";
import { AcademyHub } from "@/components/media/academy/hub";

export const metadata: Metadata = { 
  title: "কান্ডারি তৈরি একাডেমি",
  description: "সবার আমি ছাত্র — 실용적인 지식, 기술 습득, 그리고 방글라데시의 인재 양성을 위한 새로운 차원의 대학" 
};

export default function AcademyPage() {
  return <AcademyHub />;
}
