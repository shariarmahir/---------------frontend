"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  ChevronRight,
  MessageCircle,
  PlayCircle,
  Star,
  Users,
  Video,
} from "lucide-react";
import { FeedRail } from "@/components/media/feed/feed-rail";
import { mediaButton } from "@/components/media/ui/button-styles";
import { TEACHERS } from "@/components/media/academy/teachers-screen";

const FADE_UP = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const MOCK_COURSES = [
  {
    title: "অ্যাডভান্সড প্রজেক্ট-বেজড মাস্টারক্লাস",
    lessons: 24,
    duration: "৩ মাস",
    level: "অ্যাডভান্সড",
    students: "১.২k",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster: "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&w=600&q=80",
    price: "৳ ৫,০০০",
  },
  {
    title: "ইন্ডাস্ট্রি স্ট্যান্ডার্ড প্র্যাক্টিক্যাল ওয়ার্কশপ",
    lessons: 12,
    duration: "৬ সপ্তাহ",
    level: "ইন্টারমিডিয়েট",
    students: "৮৫০",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80",
    price: "৳ ৩,০০০",
  },
  {
    title: "বিগিনার্স ফাউন্ডেশন কোর্স",
    lessons: 8,
    duration: "৪ সপ্তাহ",
    level: "বিগিনার",
    students: "৩.৫k",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    poster: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=80",
    price: "৳ ১,৫০০",
  },
];

const MOCK_REVIEWS = [
  { name: "সজীব আহমেদ", rating: 5, text: "অসাধারণ শেখানোর পদ্ধতি! রিয়েল প্রজেক্টে কাজ করতে পেরে দারুণ লেগেছে।", avatar: "https://i.pravatar.cc/50?img=21" },
  { name: "তানিশা মল্লিক", rating: 5, text: "এত সহজ করে বুঝিয়েছেন যে কঠিন কনসেপ্টগুলোও স্পষ্ট হয়ে গেছে।", avatar: "https://i.pravatar.cc/50?img=22" },
  { name: "ইমরান খান", rating: 5, text: "এই মেন্টরের ক্লাস না করলে সত্যিই অনেক মিস করতাম। হাইলি রেকমেন্ডেড!", avatar: "https://i.pravatar.cc/50?img=23" },
];

export function TeacherProfileScreen({ id }: { id: number }) {
  const teacher = TEACHERS.find((t) => t.id === id) ?? TEACHERS[0];

  return (
    <div className="flex items-start gap-6">
      <div className="mx-auto w-full max-w-170 min-w-0 space-y-6">

        {/* BACK HEADER */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <Link href="/media/academy/teachers" className="rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10">
            <ArrowLeft className="size-5 text-white" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">মেন্টর প্রোফাইল</h1>
            <p className="text-xs text-white/60">{teacher.dept}</p>
          </div>
        </div>

        {/* HERO PROFILE CARD */}
        <motion.div initial="hidden" animate="show" variants={FADE_UP}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]"
        >
          {/* Cover */}
          <div className="relative h-48 w-full overflow-hidden bg-black">
            <img src={teacher.cover} alt="cover" className="size-full object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/20 to-transparent" />

            {/* Availability badge */}
            <div className={`absolute right-5 top-5 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md ring-1 ${teacher.available ? "bg-green-500/20 ring-green-500/40 text-green-400" : "bg-white/10 ring-white/20 text-white/60"}`}>
              <span className={`size-2 rounded-full ${teacher.available ? "animate-pulse bg-green-400" : "bg-white/40"}`} />
              {teacher.available ? "ক্লাস নিচ্ছেন" : "বিরতিতে"}
            </div>
          </div>

          {/* Info section */}
          <div className="relative px-6 pb-6 pt-2">
            {/* Avatar */}
            <div className="absolute -top-14 left-6 size-24 overflow-hidden rounded-2xl border-4 border-[#0a0a0a] bg-black shadow-2xl">
              <img src={teacher.img} alt={teacher.name} className="size-full object-cover" />
            </div>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black text-white">
                  {teacher.name}
                  <CheckCircle className="size-5 shrink-0 text-signal-orange" />
                </h2>
                <p className="text-base font-semibold text-white/70">{teacher.role}</p>
                <p className="mt-0.5 text-sm font-bold text-signal-orange">{teacher.company}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/media/academy/join" className={mediaButton({ variant: "primary", size: "lg", className: "gap-2 rounded-full shadow-lg" })}>
                  <PlayCircle className="size-4" /> কোর্সে যুক্ত হোন
                </Link>
                <button className={mediaButton({ variant: "secondary", size: "lg", className: "gap-2 rounded-full border-white/20 bg-white/5" })}>
                  <MessageCircle className="size-4" /> মেসেজ করুন
                </button>
              </div>
            </div>

            <p className="mt-4 text-sm text-white/65 leading-relaxed">{teacher.bio}</p>

            {/* Stats Row */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Star, label: "রেটিং", value: String(teacher.rating), fill: true },
                { icon: Users, label: "মোট ছাত্র", value: teacher.students, fill: false },
                { icon: PlayCircle, label: "কোর্স", value: `${teacher.courses}টি`, fill: false },
                { icon: Award, label: "ডিপার্টমেন্ট", value: "ভেরিফায়েড", fill: false },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                  <stat.icon className={`size-4 ${stat.fill ? "fill-signal-orange text-signal-orange" : "text-signal-orange"}`} />
                  <p className="text-lg font-black text-white">{stat.value}</p>
                  <p className="text-[11px] font-medium text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* INTRO VIDEO */}
        <motion.section initial="hidden" animate="show" variants={FADE_UP} className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Video className="size-5 text-signal-orange" /> পরিচয় ভিডিও
          </h2>
          <div className="group relative aspect-video w-full overflow-hidden rounded-3xl bg-black">
            <video
              src={teacher.video}
              className="size-full object-cover opacity-80"
              muted
              loop
              onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
              onMouseOut={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
            />
            <div className="absolute inset-0 flex items-center justify-center transition-opacity group-hover:opacity-0">
              <div className="flex size-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-md ring-1 ring-white/20">
                <PlayCircle className="size-8 text-white" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* COURSES */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="size-5 text-signal-orange" /> কোর্সসমূহ ({MOCK_COURSES.length}টি)
          </h2>
          <div className="grid gap-4">
            {MOCK_COURSES.map((course, i) => (
              <motion.div key={i} variants={FADE_UP}
                className="group flex flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] p-5 transition-all hover:border-signal-orange/30 sm:flex-row sm:items-center"
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-black sm:w-48">
                  <video
                    src={course.video}
                    poster={course.poster}
                    className="size-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
                    muted
                    loop
                    onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseOut={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 transition-opacity group-hover:opacity-0">
                    <div className="flex size-10 items-center justify-center rounded-full bg-white/25 backdrop-blur-md">
                      <PlayCircle className="size-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-white leading-tight group-hover:text-signal-orange transition-colors">{course.title}</h3>
                  <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/60">{course.level}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/60">{course.lessons} ক্লাস</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/60">{course.duration}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-white/60">
                      <Users className="inline size-3 mr-0.5" />{course.students}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-3">
                  <p className="text-xl font-black text-signal-orange">{course.price}</p>
                  <Link href="/media/academy/join" className={mediaButton({ variant: "primary", size: "sm", className: "gap-1 rounded-full" })}>
                    যুক্ত হোন <ChevronRight className="size-3.5" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* REVIEWS */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Star className="size-5 fill-signal-orange text-signal-orange" /> ছাত্রদের রিভিউ
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {MOCK_REVIEWS.map((review, i) => (
              <motion.div key={i} variants={FADE_UP}
                className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#0a0a0a] p-5"
              >
                <div className="flex items-center gap-3">
                  <img src={review.avatar} alt={review.name} className="size-10 rounded-full" />
                  <div>
                    <p className="text-sm font-bold text-white">{review.name}</p>
                    <div className="flex">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="size-3 fill-signal-orange text-signal-orange" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-white/65 leading-relaxed">{review.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA BANNER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center justify-between gap-5 rounded-3xl border border-signal-orange/30 bg-signal-orange/5 p-8 sm:flex-row"
        >
          <div>
            <h3 className="text-xl font-bold text-white">{teacher.name}-এর সাথে শেখা শুরু করুন</h3>
            <p className="mt-1 text-sm text-white/60">আজই রেজিস্ট্রেশন করুন এবং প্রথম ক্লাস বিনামূল্যে পান।</p>
          </div>
          <Link href="/media/academy/join" className={mediaButton({ variant: "primary", size: "lg", className: "w-full shrink-0 gap-2 rounded-full shadow-[0_8px_30px_-10px_var(--color-signal-orange)] sm:w-auto" })}>
            <PlayCircle className="size-5" /> এখনই যুক্ত হোন
          </Link>
        </motion.div>

      </div>

      <aside aria-label="আপনার জন্য" className="sticky top-22 hidden max-h-[calc(100dvh-6.5rem)] w-80 shrink-0 overflow-y-auto scrollbar-none xl:block">
        <FeedRail />
      </aside>
    </div>
  );
}
