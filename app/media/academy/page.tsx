import type { Metadata } from "next";
import { FrontView } from "@/components/media/academy/front/front-view";

export const metadata: Metadata = {
  title: "একাডেমি খুঁজুন · কাণ্ডারী তৈরি একাডেমি",
  description: "দেশের পেশাদারদের ছোট ছোট বিশ্ববিদ্যালয় — সব একাডেমি, তাদের বিভাগ, কোর্স আর এ সপ্তাহের বিনামূল্যের ক্লাস এক জায়গায়। তিন প্রশ্নে নিজের একাডেমি মিলিয়ে নিন।",
};

/** Step one of the road: the academy's front page. */
export default function AcademyPage() {
  return <FrontView />;
}
