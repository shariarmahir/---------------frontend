import { DateText, Num, Taka } from "../../ui/numerals";
import { BATCH_MAX, COURSE_DAYS, DEPT_KINDS, MIN_ATTENDANCE, MIN_HOMEWORK, courseTimeline, type Course, type Department } from "@/lib/media/academy";
import { computeFees } from "@/lib/media/fees";
import type { QA } from "../home/plus/faq";

/** The questions asked about one course, each answered from the course's own record and the academy's rules. */
export function courseFaq(course: Course, dept: Department): QA[] {
  const fees = computeFees(course.fee);
  const timeline = courseTimeline(course.starts);
  const left = Math.max(0, course.seats - course.enrolled);
  return [
    {
      q: "ফি কত, আর টাকা কোথায় যায়?",
      a:
        course.fee === 0 ? (
          <>এই কোর্স বিনা ফির। শুধু বিভাগে যোগ দিয়ে ভর্তি হন।</>
        ) : (
          <>
            আপনি দেন <Taka amount={fees.buyerPays} />, শিক্ষক পান <Taka amount={fees.sellerReceives} />; প্ল্যাটফর্ম দুই পক্ষে ৫% করে রাখে (<Taka amount={fees.platformTotal} />
            )। ক্লাস না হওয়া পর্যন্ত টাকা থাকে এসক্রোতে।
          </>
        ),
    },
    {
      q: "কবে শুরু, কবে শেষ?",
      a: (
        <>
          ব্যাচ শুরু <DateText iso={course.starts} />, শেষ <DateText iso={timeline.ends} /> — মোট <Num value={COURSE_DAYS} /> দিন। <DateText iso={timeline.final.from} /> থেকে <DateText iso={timeline.final.to} /> প্রজেক্ট আর প্যানেল।
        </>
      ),
    },
    {
      q: "আগে বিভাগে যোগ দিতে হয়?",
      a: <>হ্যাঁ, {dept.name} বিভাগে — বিনামূল্যে। আলাদা কিছু করতে হয় না: কোর্সের ভর্তির ফর্মেই বিভাগে যোগ হয়ে যায়।</>,
    },
    {
      q: "এক ব্যাচে কতজন?",
      a: (
        <>
          এই ব্যাচে <Num value={course.seats} />
          টি আসন, এখন বাকি <Num value={left} />
          টি। {DEPT_KINDS[dept.kind]}তে এক ব্যাচে সর্বোচ্চ <Num value={BATCH_MAX[dept.kind]} /> জন।
        </>
      ),
    },
    ...(dept.place ? [{ q: "হাতে-কলমের ক্লাস কোথায় হয়?", a: <>{dept.place}</> }] : []),
    {
      q: "ফাইনালে বসতে কী লাগে?",
      a: (
        <>
          অন্তত <Num value={MIN_ATTENDANCE * 100} />% ক্লাসে হাজিরা, <Num value={MIN_HOMEWORK * 100} />% বাড়ির কাজ আর ফাইনাল প্রজেক্ট জমা। তারপর প্যানেল ইন্টারভিউয়ের সময় বেছে নেন।
        </>
      ),
    },
    { q: "সনদ কীভাবে যাচাই হয়?", a: <>পাস করলে নাম ওঠে প্রকাশ্য বোর্ডে। সনদের আইডি দিয়ে যে কেউ — নিয়োগকর্তাও — মিলিয়ে দেখতে পারেন।</> },
    { q: "শিক্ষক নিয়ে অভিযোগ করব কীভাবে?", a: <>শিক্ষকের অংশে অভিযোগ বাক্স আছে। আপনার নাম শিক্ষক দেখেন না, আর প্রতিটি অভিযোগ প্যানেল খতিয়ে দেখে।</> },
  ];
}
