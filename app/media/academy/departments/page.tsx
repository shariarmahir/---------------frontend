import type { Metadata } from "next";
import { DepartmentsView } from "@/components/media/academy/departments/departments-view";

export const metadata: Metadata = {
  title: "বিভাগ · একাডেমি",
  description: "পেশাদারদের হাতে গড়া দক্ষতার বিভাগ — দল মিলে খোলা, প্যানেলে যাচাই, প্রতি সপ্তাহে একটা ক্লাস বিনামূল্যে।",
};

export default function DepartmentsPage() {
  return <DepartmentsView />;
}
