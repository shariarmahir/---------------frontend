"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Award,
  BookOpen,
  ChefHat,
  CheckCircle,
  ChevronRight,
  Clock,
  GraduationCap,
  Library,
  Mic,
  Music,
  PenTool,
  PlayCircle,
  Sparkles,
  Star,
  Trophy,
  Users,
  Video,
  Wrench,
  Zap,
  ArrowRight,
  FileText,
  CheckCircle2,
  MapPin,
  TrendingUp,
  Cpu,
} from "lucide-react";
import { FeedRail } from "@/components/media/feed/feed-rail";
import { mediaButton } from "@/components/media/ui/button-styles";
import { cn } from "@/lib/utils";
import { TEACHERS } from "@/components/media/academy/teachers-screen";

const FADE_UP = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

/* ─── MOCK DATA ─── */

const LIVE_NOW = [
  {
    id: 1,
    title: "ইঞ্জিন ওভারহল লাইভ মাস্টারক্লাস",
    instructor: "আরিফ অর্ক",
    instructorImg: "https://i.pravatar.cc/40?u=arif",
    viewers: "২.৪k",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    poster: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    tag: "মেকাট্রনিক্স",
  },
  {
    id: 2,
    title: "ইতালিয়ান কুইজিন: পাস্তা ফ্রম স্ক্র্যাচ",
    instructor: "নাবিলা রহমান",
    instructorImg: "https://i.pravatar.cc/40?u=nabila",
    viewers: "১.২k",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    poster: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
    tag: "রন্ধনশিল্প",
  },
];

const TRENDING_COURSES = [
  {
    id: 1,
    title: "ফুল-স্ট্যাক ডেভেলপমেন্ট: জিরো টু ডিপ্লয়",
    instructor: "রাফসান হক",
    lessons: 24,
    duration: "৩ মাস",
    students: "৪.২k",
    rating: 4.9,
    price: "৳ ৫,০০০",
    poster: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    badge: "ট্রেন্ডিং",
    color: "from-blue-600/30",
  },
  {
    id: 2,
    title: "প্রফেশনাল মিউজিক প্রোডাকশন",
    instructor: "সানজিদা প্রীতি",
    lessons: 16,
    duration: "২ মাস",
    students: "৫.২k",
    rating: 5.0,
    price: "৳ ৩,৫০০",
    poster: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    badge: "সেরা রেটিং",
    color: "from-purple-600/30",
  },
  {
    id: 3,
    title: "অটোমোবাইল ও বাইক মেকানিক্স",
    instructor: "আরিফ অর্ক",
    lessons: 20,
    duration: "২.৫ মাস",
    students: "৩.১k",
    rating: 5.0,
    price: "৳ ৪,০০০",
    poster: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80",
    badge: "নতুন",
    color: "from-emerald-600/30",
  },
  {
    id: 4,
    title: "সিনেমাটোগ্রাফি ও এডিটিং মাস্টারি",
    instructor: "ফারহান আহমেদ",
    lessons: 14,
    duration: "৬ সপ্তাহ",
    students: "৯০০",
    rating: 4.8,
    price: "৳ ২,৫০০",
    poster: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80",
    badge: "ট্রেন্ডিং",
    color: "from-rose-600/30",
  },
];

const DEPARTMENTS = [
  { id: "eng-software", title: "সফটওয়্যার ইঞ্জিনিয়ারিং", icon: Cpu, count: "১৮", color: "text-blue-400", bg: "bg-blue-400/15", glow: "shadow-blue-500/20" },
  { id: "eng-hardware", title: "মেকাট্রনিক্স ও হার্ডওয়্যার", icon: Wrench, count: "১২", color: "text-emerald-400", bg: "bg-emerald-400/15", glow: "shadow-emerald-500/20" },
  { id: "culinary", title: "প্রফেশনাল রন্ধনশিল্প", icon: ChefHat, count: "১০", color: "text-orange-400", bg: "bg-orange-400/15", glow: "shadow-orange-500/20" },
  { id: "music", title: "সংগীত ও আর্টস", icon: Music, count: "৮", color: "text-purple-400", bg: "bg-purple-400/15", glow: "shadow-purple-500/20" },
  { id: "media", title: "ভিডিও ও মিডিয়া", icon: Video, count: "৬", color: "text-pink-400", bg: "bg-pink-400/15", glow: "shadow-pink-500/20" },
  { id: "design", title: "ডিজাইন ও ক্রিয়েটিভ", icon: PenTool, count: "৯", color: "text-cyan-400", bg: "bg-cyan-400/15", glow: "shadow-cyan-500/20" },
];

const STATS = [
  { label: "সক্রিয় ছাত্র", value: "১২.৫k+", icon: Users },
  { label: "ভেরিফায়েড মেন্টর", value: "১২০+", icon: GraduationCap },
  { label: "সফল গ্র্যাজুয়েট", value: "৪.৮k+", icon: Trophy },
  { label: "লাইভ ওয়ার্কশপ", value: "৬০+", icon: Zap },
];

export function AcademyHub() {
  return (
    <div className="flex items-start gap-6">
      <div className="mx-auto w-full max-w-170 min-w-0 space-y-5">

        {/* ─── HERO ─── */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="relative isolate overflow-hidden rounded-2xl border border-white/12 bg-text-primary"
        >
          {/* subtle video bg */}
          <video autoPlay loop muted playsInline className="absolute inset-0 z-0 size-full object-cover opacity-[0.12]" poster="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80">
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-text-primary/80 to-text-primary" />

          <div className="relative z-[2] flex flex-col items-center px-5 pt-10 pb-8 text-center sm:px-10 sm:pt-14 sm:pb-10">
            <motion.div variants={FADE_UP} className="mb-5 flex size-14 items-center justify-center rounded-[18px] bg-signal-orange text-text-primary shadow-[0_0_50px_-8px_var(--color-signal-orange)]">
              <Library className="size-7" />
            </motion.div>
            <motion.span variants={FADE_UP} className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-signal-orange/25 bg-signal-orange/10 px-3 py-1 text-[11px] font-bold tracking-wider text-signal-orange uppercase">
              <Sparkles className="size-3" /> স্কিল ইউনিভার্সিটি
            </motion.span>
            <motion.h1 variants={FADE_UP} className="mb-2 text-[clamp(1.75rem,5vw,2.75rem)] font-black leading-none tracking-tight text-white">
              কান্ডারি তৈরি একাডেমি
            </motion.h1>
            <motion.p variants={FADE_UP} className="mb-6 text-base font-bold text-signal-orange">
              "সবার আমি ছাত্র"
            </motion.p>
            <motion.p variants={FADE_UP} className="mx-auto mb-8 max-w-xl text-sm leading-relaxed text-white/70">
              ইঞ্জিনিয়ারিং, মেকানিক্স, রন্ধনশিল্প, সংগীত, ডিজাইন — যেকোনো স্কিল শিখুন
              ইন্ডাস্ট্রি প্রফেশনালদের কাছ থেকে, সরাসরি রিয়েল-লাইফ প্র্যাক্টিক্যাল ক্লাসে।
            </motion.p>

            <motion.div variants={FADE_UP} className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/media/academy/admission" className={mediaButton({ variant: "primary", size: "lg", className: "w-full gap-2 rounded-full sm:w-auto" })}>
                <CheckCircle2 className="size-5" /> ভর্তি পরীক্ষা দিন
              </Link>
              <Link href="/media/academy/teach" className={mediaButton({ variant: "quiet", size: "lg", className: "w-full gap-2 rounded-full sm:w-auto" })}>
                <GraduationCap className="size-5" /> মেন্টর হোন
              </Link>
            </motion.div>
          </div>

          {/* Live stats ribbon */}
          <div className="relative z-[2] grid grid-cols-2 gap-px border-t border-white/8 bg-white/5 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                className="flex flex-col items-center gap-1 py-4"
              >
                <s.icon className="size-4 text-signal-orange" />
                <span className="text-lg font-black text-white">{s.value}</span>
                <span className="text-[10px] font-medium text-white/50">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ─── LIVE NOW ─── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-white">
              <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex size-2 rounded-full bg-red-500" /></span>
              এখন লাইভ চলছে
            </h2>
            <Link href="/media/academy/departments" className="text-xs font-semibold text-signal-orange hover:underline">সবগুলো →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {LIVE_NOW.map((live) => (
              <Link key={live.id} href="/media/academy/join"
                className="group relative overflow-hidden rounded-2xl border border-white/12 bg-text-primary transition-all hover:-translate-y-0.5 hover:border-signal-orange/30 hover:shadow-tile"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                  <video
                    src={live.video}
                    poster={live.poster}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    muted loop
                    onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseOut={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  {/* play button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-100 transition-opacity group-hover:opacity-0">
                    <div className="flex size-11 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/25">
                      <PlayCircle className="size-6 text-white" />
                    </div>
                  </div>
                  {/* live badge */}
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-black tracking-wider text-white shadow-lg">
                    <span className="size-1.5 animate-pulse rounded-full bg-white" /> LIVE
                  </span>
                  {/* viewers */}
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                    <Users className="size-3" /> {live.viewers}
                  </span>
                  {/* tag */}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                    {live.tag}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-4">
                  <img src={live.instructorImg} alt={live.instructor} className="size-9 rounded-full ring-2 ring-white/10" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-white group-hover:text-signal-orange transition-colors">{live.title}</h3>
                    <p className="text-xs text-white/50">{live.instructor}</p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-signal-orange" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── TRENDING COURSES ─── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-white">
              <TrendingUp className="size-4 text-signal-orange" />
              ট্রেন্ডিং কোর্স
            </h2>
            <Link href="/media/academy/departments" className="text-xs font-semibold text-signal-orange hover:underline">সব কোর্স →</Link>
          </div>
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {TRENDING_COURSES.map((course) => (
              <motion.div key={course.id} variants={FADE_UP}>
                <Link href="/media/academy/join"
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/12 bg-text-primary transition-all hover:-translate-y-0.5 hover:border-signal-orange/30 hover:shadow-tile"
                >
                  {/* Image */}
                  <div className={cn("relative h-36 overflow-hidden bg-gradient-to-br to-black", course.color)}>
                    <img src={course.poster} alt={course.title} className="size-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-text-primary via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 rounded-md bg-signal-orange px-2 py-0.5 text-[10px] font-black text-text-primary shadow">{course.badge}</span>
                    <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                      <Star className="size-3 fill-signal-orange text-signal-orange" /> {course.rating}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="mb-1 text-sm font-bold leading-snug text-white group-hover:text-signal-orange transition-colors">{course.title}</h3>
                    <p className="mb-3 text-xs text-white/50">ইন্সট্রাক্টর: {course.instructor}</p>
                    <div className="mt-auto flex flex-wrap gap-1.5 text-[10px] font-bold text-white/40">
                      <span className="inline-flex items-center gap-0.5 rounded-full border border-white/8 px-2 py-0.5"><BookOpen className="size-3" /> {course.lessons} ক্লাস</span>
                      <span className="inline-flex items-center gap-0.5 rounded-full border border-white/8 px-2 py-0.5"><Clock className="size-3" /> {course.duration}</span>
                      <span className="inline-flex items-center gap-0.5 rounded-full border border-white/8 px-2 py-0.5"><Users className="size-3" /> {course.students}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-white/8 pt-3">
                      <span className="text-base font-black text-signal-orange">{course.price}</span>
                      <span className="text-xs font-bold text-signal-orange opacity-0 transition-opacity group-hover:opacity-100">যুক্ত হোন →</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ─── DEPARTMENTS ─── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">স্কিল ডিপার্টমেন্ট</h2>
            <Link href="/media/academy/departments" className="text-xs font-semibold text-signal-orange hover:underline">সব দেখুন →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DEPARTMENTS.map((dept) => (
              <Link key={dept.id} href={`/media/academy/dept/${dept.id}`}
                className={cn(
                  "group flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-text-primary p-4 text-center transition-all hover:-translate-y-0.5 hover:border-white/25 hover:shadow-lg",
                  `hover:${dept.glow}`,
                )}
              >
                <div className={cn("flex size-11 items-center justify-center rounded-xl transition-transform group-hover:scale-110", dept.bg, dept.color)}>
                  <dept.icon className="size-5" />
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-signal-orange transition-colors">{dept.title}</h3>
                <p className="text-[10px] font-medium text-white/40">{dept.count}টি কোর্স</p>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── MENTORS ─── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">টপ মেন্টর</h2>
            <Link href="/media/academy/teachers" className="text-xs font-semibold text-signal-orange hover:underline">সব দেখুন →</Link>
          </div>
          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-none">
            <div className="flex w-max gap-3 sm:grid sm:w-auto sm:grid-cols-3">
              {TEACHERS.slice(0, 3).map((t) => (
                <Link key={t.id} href={`/media/academy/teachers/${t.id}`}
                  className="group flex w-44 shrink-0 flex-col items-center rounded-2xl border border-white/12 bg-text-primary p-4 text-center transition-all hover:-translate-y-0.5 hover:border-signal-orange/30 hover:shadow-tile sm:w-auto"
                >
                  <div className="relative mb-3">
                    <img src={t.img} alt={t.name} className="size-14 rounded-full ring-2 ring-white/10 transition-transform group-hover:scale-105" />
                    {t.available && <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-text-primary bg-green-400" />}
                  </div>
                  <h3 className="flex items-center gap-1 text-sm font-bold text-white group-hover:text-signal-orange transition-colors">
                    {t.name} <CheckCircle className="size-3 text-signal-orange" />
                  </h3>
                  <p className="text-[11px] text-white/50">{t.role}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-signal-orange/70">{t.company}</p>
                  <div className="mt-3 flex items-center gap-3 text-[11px] font-bold text-white/40">
                    <span className="flex items-center gap-0.5"><Star className="size-3 fill-signal-orange text-signal-orange" /> {t.rating}</span>
                    <span className="flex items-center gap-0.5"><Users className="size-3" /> {t.students}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="rounded-2xl border border-white/12 bg-text-primary p-5 sm:p-6">
          <h2 className="mb-5 text-center text-lg font-bold text-white">কীভাবে কাজ করে?</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { step: "১", title: "ভর্তি পরীক্ষা", desc: "অনলাইনে অ্যাসেসমেন্ট দিন", icon: FileText, color: "text-blue-400 bg-blue-400/15" },
              { step: "২", title: "লাইভ ক্লাস", desc: "প্র্যাক্টিক্যাল সেশনে শিখুন", icon: PlayCircle, color: "text-emerald-400 bg-emerald-400/15" },
              { step: "৩", title: "প্রজেক্ট করুন", desc: "রিয়েল প্রজেক্ট বিল্ড করুন", icon: Wrench, color: "text-signal-orange bg-signal-orange/15" },
              { step: "৪", title: "সার্টিফিকেট", desc: "প্রফেশনাল সার্টিফিকেট পান", icon: Award, color: "text-purple-400 bg-purple-400/15" },
            ].map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                {i < 3 && <div className="absolute top-5 left-[calc(50%+24px)] hidden h-px w-[calc(100%-48px)] bg-white/10 sm:block" />}
                <div className={cn("mb-3 flex size-10 items-center justify-center rounded-xl", s.color)}>
                  <s.icon className="size-5" />
                </div>
                <span className="mb-0.5 text-[10px] font-bold text-signal-orange/60">ধাপ {s.step}</span>
                <h3 className="text-sm font-bold text-white">{s.title}</h3>
                <p className="text-[11px] text-white/50">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── EXAM BANNER ─── */}
        <Link href="/media/academy/exam"
          className="group flex flex-col items-start gap-4 rounded-2xl border border-signal-orange/20 bg-signal-orange/5 p-5 transition-colors hover:bg-signal-orange/10 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-signal-orange/15 text-signal-orange">
              <Trophy className="size-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">ফাইনাল থিসিস ও প্রফেশনাল এক্সাম</h2>
              <p className="mt-1 text-xs text-white/60">কোর্স শেষে প্রফেশনাল ইন্টারভিউ এবং বাস্তব প্রজেক্টে স্কিল যাচাই। সফল হলে পাবেন প্রেস্টিজিয়াস সার্টিফিকেট।</p>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-signal-orange">
            বিস্তারিত <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        {/* ─── QUICK REGISTER CTA ─── */}
        <section className="relative overflow-hidden rounded-2xl border border-white/12 bg-text-primary p-5 sm:p-6">
          <div className="absolute -right-20 -top-20 size-48 rounded-full bg-signal-orange/5 blur-3xl" />
          <div className="relative z-10 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-signal-orange text-text-primary shadow-[0_0_40px_-12px_var(--color-signal-orange)]">
              <Sparkles className="size-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white">আজই শুরু করুন — প্রথম ক্লাস ফ্রি!</h3>
              <p className="mt-0.5 text-xs text-white/60">যেকোনো কোর্সের প্রথম ক্লাসে বিনামূল্যে অংশ নিন এবং মেন্টরদের সাথে কথা বলুন।</p>
            </div>
            <Link href="/media/academy/join" className={mediaButton({ variant: "primary", size: "md", className: "w-full shrink-0 gap-2 rounded-full sm:w-auto" })}>
              ফ্রি ক্লাস নিন <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>

      </div>

      <aside aria-label="আপনার জন্য" className="sticky top-22 hidden max-h-[calc(100dvh-6.5rem)] w-80 shrink-0 overflow-y-auto scrollbar-none xl:block">
        <FeedRail />
      </aside>
    </div>
  );
}
