import type { Metadata } from "next";
import { HomeView } from "@/components/media/academy/home/home-view";

export const metadata: Metadata = {
  title: "কাণ্ডারী তৈরি একাডেমি",
  description: "দেশের পেশাদারদের খোলা একাডেমিতে চল্লিশ দিনে হাতে-কলমে শিখুন — কীভাবে কাজ করে, একাডেমি, বিভাগ, কোর্স আর ভর্তি এক পাতায়।",
};

/** The academy's home page: how it works, and the way into its academies, departments and courses. */
export default function AcademyPage() {
  return <HomeView />;
}
