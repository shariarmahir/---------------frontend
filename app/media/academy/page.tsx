import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DeptFooter } from "@/components/media/academy/departments/dept-footer";
import { ExploreNav } from "@/components/media/academy/departments/explore-nav";
import { PathArt, ProjectArt, ProofArt } from "@/components/media/academy/home/plus/art";
import { Faq } from "@/components/media/academy/home/plus/faq";
import { PlusHeroArt } from "@/components/media/academy/home/plus/hero-art";
import { PartnerStrip } from "@/components/media/academy/home/plus/partner-strip";
import { Plans } from "@/components/media/academy/home/plus/plans";
import { SkillsPanel } from "@/components/media/academy/home/plus/skills-panel";
import { Voices, type Voice } from "@/components/media/academy/home/plus/voices";
import { mediaButton } from "@/components/media/ui/button-styles";
import { Num } from "@/components/media/ui/numerals";
import { board, getCourse, getDepartment, teacherRecords, workshops } from "@/data/media/academy";
import { DEMO_NOW } from "@/data/media/clock";
import { personOrThrow } from "@/data/media/users";
import { CLASS_MINUTES, COURSE_DAYS } from "@/lib/media/academy";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "কাণ্ডারী তৈরি একাডেমি",
  description: "সবার আমি ছাত্র — পেশাদারদের কাছে অনলাইনে, লাইভে আর সত্যিকারের কর্মশালায় হাতে-কলমে শিখুন; শেষে প্যানেল ইন্টারভিউয়ে দক্ষতা প্রমাণ করে কাজ পান।",
};

const WRAP = "mx-auto max-w-6xl px-4 sm:px-6";
const H2 = "text-[clamp(1.5rem,3vw,2rem)] leading-tight font-bold text-balance text-m-ink";

/*
 * The academy's front page, laid out the way a big course site lays out its
 * subscription page: the course bar, a blue hero with a teacher in an arch,
 * the academies you learn from, a grey panel of courses by school, three
 * "how it works" rows, learners' words, three ways in, a banner, questions,
 * a last call and the big footer. The words and numbers are the academy's
 * own, from its rules and records.
 */
export default function AcademyPage() {
  const now = DEMO_NOW.getTime();
  const graduates = teacherRecords.reduce((n, r) => n + r.graduates, 0);
  // The best pass on the board: the highest average of the examiners' marks.
  const mean = (m: number[]) => m.reduce((a, b) => a + b, 0) / m.length;
  const passed = board.filter((s) => s.certificate && s.marks).sort((a, b) => mean(b.marks!) - mean(a.marks!))[0];
  const passedCourse = getCourse(passed.course)!;
  const workshop = [...workshops].sort((a, b) => a.at.localeCompare(b.at)).find((w) => new Date(w.at).getTime() > now) ?? workshops[0];
  const projects = board.filter((s) => s.certificate).slice(0, 3).map((s) => s.project);

  const voices: Voice[] = teacherRecords
    .flatMap((r) =>
      r.stories.map((st) => ({
        name: st.name,
        text: st.text,
        from: `${getDepartment(r.dept)?.name ?? ""} · শিক্ষক ${personOrThrow(r.handle).nameBn}`,
        certificate: board.find((b) => b.learner === st.name && b.certificate)?.certificate,
      })),
    )
    .sort((a, b) => Number(Boolean(b.certificate)) - Number(Boolean(a.certificate)))
    .slice(0, 9);

  return (
    <>
      <ExploreNav className="-mt-6" />

      <div className="-mx-3 bg-m-canvas pb-24 sm:-mx-6">
        {/* Hero: the pitch on the left, a teacher in an arch on the right. */}
        <section aria-labelledby="academy-title" className="blue-band relative overflow-hidden">
          <div className={`${WRAP} grid items-end gap-4 pt-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:pt-12`}>
            <div className="pb-10 lg:pb-14">
              <Wordmark tone="on" />
              <h1 id="academy-title" className="mt-3 text-[clamp(1.75rem,3.3vw,2.6rem)] leading-[1.22] font-bold">
                আজই শুরু করুন, কয়েক মিনিটে।
                <br />
                এই সপ্তাহেই দক্ষতা গড়ুন।
              </h1>
              <p className="mt-5 max-w-[36rem] text-[15px] leading-relaxed text-white/90">
                দেশের পেশাদারদের কাছে নিজের গতিতে শিখুন — <Num value={CLASS_MINUTES} /> মিনিটের অনলাইন ক্লাস থেকে <Num value={COURSE_DAYS} /> দিনে যাচাইযোগ্য সনদ।
                <br />
                যোগ দেওয়া বিনামূল্যে, ফি থাকে এসক্রোতে
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="/media/academy/videos"
                  className="inline-flex h-12 items-center rounded-lg bg-white px-6 text-[15px] font-bold text-m-blue shadow-[0_10px_24px_-12px_rgb(0_0_0/0.45)] transition-[background-color,translate] duration-200 hover:-translate-y-0.5 hover:bg-m-amber-soft active:translate-y-0 motion-reduce:transition-none"
                >
                  বিনামূল্যে প্রথম ক্লাস দেখুন
                </Link>
                <Link href="/media/academy/admission" className="text-[15px] font-bold text-white underline-offset-4 hover:underline">
                  অথবা চার প্রশ্নের ভর্তি পরীক্ষা দিন
                </Link>
              </div>
            </div>
            <PlusHeroArt src="/media/calculus.webp" alt="বোর্ডে অঙ্ক বোঝাচ্ছেন একজন শিক্ষক" />
          </div>
        </section>

        <PartnerStrip />
        <SkillsPanel graduates={graduates} />

        <FeatureRow
          id="proof"
          title="শেখাকে প্রমাণে বদলান"
          body="প্রতিটি কোর্স শেষ হয় পেশাদারদের প্যানেলের সামনে — দুই পরীক্ষক আলাদা নম্বর দেন। পাস করলে যাচাইযোগ্য সনদ; আইডি দিয়ে যে কেউ প্রকাশ্য বোর্ডে মিলিয়ে দেখতে পারেন।"
          link={{ href: "/media/academy/exam", label: "প্রকাশ্য বোর্ড দেখুন" }}
          art={<ProofArt course={passedCourse.title} learner={passed.learner} certificate={passed.certificate!} marks={passed.marks!} />}
        />
        <FeatureRow
          id="path"
          flip
          title="কোথা থেকে শুরু করবেন জানুন — অল্প অল্প করে এগোন"
          body={
            <>
              চার প্রশ্নের ভর্তি পরীক্ষা ঠিক করে দেয় কোন স্তরে বসবেন। তারপর <Num value={5} /> সপ্তাহ অনলাইনে <Num value={CLASS_MINUTES} /> মিনিটের ক্লাস, শেষ <Num value={5} /> দিন প্রজেক্ট আর প্যানেল — মোট <Num value={COURSE_DAYS} /> দিন।
            </>
          }
          link={{ href: "/media/academy/admission", label: "ভর্তি পরীক্ষা দিন" }}
          art={<PathArt />}
        />
        <FeatureRow
          id="projects"
          title="প্রথম ক্লাস থেকে পোর্টফোলিওর মতো কাজ"
          body="খাতার পরীক্ষা নয় — সার্ভিস করা বাইক, ১২০ জনের মেন্যু, চালু অ্যাপ। শিক্ষক নিজের গ্যারেজ, রান্নাঘর বা ল্যাবে ডাকেন হাতে-কলমের কর্মশালায়।"
          link={{ href: "/media/academy/departments", label: "বিভাগগুলো দেখুন" }}
          art={<ProjectArt image={workshop.image} alt={workshop.title} projects={projects} />}
        />

        <Voices voices={voices} />
        <Plans />

        {/* The banner: a short promise and the first step. */}
        <section aria-labelledby="banner" className={`${WRAP} pt-20`}>
          <div className="grid overflow-hidden rounded-3xl bg-m-blue-soft shadow-m-tile ring-1 ring-m-ink/6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="self-center p-7 sm:p-10">
              <Wordmark tone="ink" />
              <h2 id="banner" className={cn(H2, "mt-4")}>
                সময় আপনার পক্ষে। <Num value={CLASS_MINUTES} /> মিনিটের ক্লাসকে সত্যিকারের দক্ষতায় বদলান।
              </h2>
              <p className="mt-3 max-w-[34rem] text-[15px] leading-relaxed text-m-ink/80">প্রতি সপ্তাহে প্রত্যেক শিক্ষকের একটা ক্লাস বিনামূল্যে — দেখে পছন্দ হলে বিভাগে যোগ দিন।</p>
              <Link href="/media/academy/videos" className={mediaButton({ size: "lg", className: "mt-6" })}>
                বিনামূল্যে প্রথম ক্লাস দেখুন <ArrowRight aria-hidden />
              </Link>
            </div>
            <div className="relative min-h-64 lg:min-h-full">
              <Image src={passedCourse.image} alt={passedCourse.title} fill sizes="(min-width: 1024px) 32rem, 100vw" className="object-cover" />
            </div>
          </div>
        </section>

        <Faq />

        {/* The last call. */}
        <section aria-labelledby="last-call" className="mx-auto max-w-3xl px-4 pt-20 text-center sm:px-6">
          <div className="flex justify-center">
            <Wordmark tone="ink" />
          </div>
          <h2 id="last-call" className={cn(H2, "mt-4")}>
            আজ শুরু করুন — <Num value={COURSE_DAYS} /> দিনে প্রমাণ দিন
          </h2>
          <p className="mt-3 text-[15px] text-m-ink/75">যোগ দেওয়া বিনামূল্যে · ফি এসক্রোতে · ফাইনাল প্রকাশ্য</p>
          <Link href="/media/academy/departments" className={mediaButton({ size: "lg", className: "mt-6 h-13 px-8" })}>
            বিভাগে যোগ দিন
          </Link>
        </section>
      </div>

      <DeptFooter />
    </>
  );
}

/** The academy's name with its motto in an amber tag, like a subscription's name and badge. */
function Wordmark({ tone }: { tone: "on" | "ink" }) {
  return (
    <p className="flex flex-wrap items-center gap-2">
      <span className={cn("font-display-m text-[1.3rem] leading-none font-bold", tone === "on" ? "text-m-on" : "text-m-blue")}>কাণ্ডারী একাডেমি</span>
      <span className="rounded-md bg-m-yellow px-2 py-1 text-xs leading-none font-bold text-m-ink">সবার আমি ছাত্র</span>
    </p>
  );
}

/** A "how it works" row: words on one side, a picture from the records on the other. */
function FeatureRow({ id, title, body, link, art, flip }: { id: string; title: string; body: React.ReactNode; link: { href: string; label: string }; art: React.ReactNode; flip?: boolean }) {
  return (
    <section aria-labelledby={id} className={`${WRAP} grid items-center gap-10 pt-20 lg:grid-cols-2 lg:gap-16`}>
      <div className={cn(flip && "lg:order-2")}>
        <h2 id={id} className={H2}>
          {title}
        </h2>
        <p className="mt-4 max-w-[34rem] text-[17px] leading-relaxed text-m-ink/80">{body}</p>
        <Link href={link.href} className="group mt-6 inline-flex items-center gap-1.5 font-bold text-m-blue hover:underline">
          {link.label} <ArrowRight className="size-4.5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
        </Link>
      </div>
      <div className={cn(flip && "lg:order-1")}>{art}</div>
    </section>
  );
}
