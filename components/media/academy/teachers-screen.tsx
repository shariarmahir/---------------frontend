"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle, MessageCircle, PlayCircle, Search, Star, Users } from "lucide-react";
import { FeedRail } from "@/components/media/feed/feed-rail";
import { mediaButton } from "@/components/media/ui/button-styles";

const FADE_UP = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export const TEACHERS = [
  {
    id: 1,
    name: "রাফসান হক",
    role: "সফটওয়্যার আর্কিটেক্ট",
    company: "মেটা বাংলাদেশ",
    rating: 4.9,
    students: "৪.২k",
    courses: 8,
    img: "https://i.pravatar.cc/150?u=rafsan",
    cover: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    dept: "সফটওয়্যার ইঞ্জিনিয়ারিং",
    bio: "১০ বছরের অভিজ্ঞতাসম্পন্ন সফটওয়্যার আর্কিটেক্ট। React, Node.js এবং Cloud Architecture-এ বিশেষজ্ঞ।",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    available: true,
  },
  {
    id: 2,
    name: "নাবিলা রহমান",
    role: "এক্সিকিউটিভ শেফ",
    company: "লে মেরিডিয়ান ঢাকা",
    rating: 4.8,
    students: "২.৮k",
    courses: 5,
    img: "https://i.pravatar.cc/150?u=nabila",
    cover: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
    dept: "প্রফেশনাল রন্ধনশিল্প",
    bio: "ইউরোপ ও এশিয়ায় ১৫ বছরের রন্ধন অভিজ্ঞতা। ফরাসি ও ইতালিয়ান কুইজিনে স্পেশালিস্ট।",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    available: true,
  },
  {
    id: 3,
    name: "আরিফ অর্ক",
    role: "সিনিয়র হার্ডওয়্যার ইঞ্জিনিয়ার",
    company: "স্যামসাং R&D বাংলাদেশ",
    rating: 5.0,
    students: "৩.১k",
    courses: 6,
    img: "https://i.pravatar.cc/150?u=arif",
    cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    dept: "মেকাট্রনিক্স ও হার্ডওয়্যার",
    bio: "IoT, Embedded Systems এবং মেকাট্রনিক্সে ৮ বছরের গবেষণা ও শিল্প অভিজ্ঞতা।",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    available: false,
  },
  {
    id: 4,
    name: "সানজিদা প্রীতি",
    role: "লিড সিঙ্গার ও মিউজিক প্রডিউসার",
    company: "ব্যান্ড 'অর্ণব'",
    rating: 5.0,
    students: "৫.২k",
    courses: 4,
    img: "https://i.pravatar.cc/150?u=sanjida",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80",
    dept: "সংগীত ও আর্টস",
    bio: "বাংলাদেশের অন্যতম জনপ্রিয় মিউজিক আর্টিস্ট। ভোকাল ট্রেনিং, রেকর্ডিং ও প্রডাকশনে বিশেষজ্ঞ।",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    available: true,
  },
  {
    id: 5,
    name: "সাবরিনা জেরিন",
    role: "লিড ইউআই/ইউএক্স ডিজাইনার",
    company: "Pathao Product Team",
    rating: 4.7,
    students: "১.৯k",
    courses: 7,
    img: "https://i.pravatar.cc/150?u=sabrina",
    cover: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80",
    dept: "ডিজাইন ও ক্রিয়েটিভ",
    bio: "Figma, Prototyping এবং User Research-এ ৬ বছরের অভিজ্ঞতা। ১০+ প্রোডাক্ট লঞ্চ করেছেন।",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    available: true,
  },
  {
    id: 6,
    name: "ফারহান আহমেদ",
    role: "সিনেমাটোগ্রাফার ও ভিডিও এডিটর",
    company: "আরটিভি ক্রিয়েটিভ হেড",
    rating: 4.8,
    students: "৯০০",
    courses: 3,
    img: "https://i.pravatar.cc/150?u=farhan",
    cover: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80",
    dept: "ভিডিও ও মিডিয়া প্রডাকশন",
    bio: "ডকুমেন্টারি থেকে কমার্শিয়াল — সব ধরনের ভিডিও প্রডাকশনে পারদর্শী। Adobe Suite-এ মাস্টার।",
    video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    available: false,
  },
];

export function TeachersScreen() {
  return (
    <div className="flex items-start gap-6">
      <div className="mx-auto w-full max-w-170 min-w-0 space-y-6">

        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <Link href="/media/academy" className="rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10">
            <ArrowLeft className="size-5 text-white" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">প্রফেশনাল মেন্টর প্যানেল</h1>
            <p className="text-xs text-white/60">দেশসেরা ইন্ডাস্ট্রি এক্সপার্টদের সাথে সরাসরি শিখুন</p>
          </div>
        </div>

        {/* PREMIUM HERO BANNER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-black p-8 sm:p-10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-signal-orange/15 via-black to-black" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-white">দেশসেরা মেন্টর প্যানেল</h2>
            <p className="mt-2 max-w-lg text-sm text-white/70 leading-relaxed">
              যারা ইন্ডাস্ট্রিতে কাজ করছেন, তারাই আপনাকে শেখাবেন। কোনো থিওরিটিক্যাল লেকচার নয়,
              শিখুন সরাসরি রিয়েল-লাইফ প্রফেশনালদের কাছ থেকে।
            </p>
          </div>
        </motion.div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="শিক্ষক বা ডিপার্টমেন্ট খুঁজুন..."
            className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] py-3 pr-4 pl-12 text-sm text-white outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50"
          />
        </div>

        {/* TEACHER CARDS - PREMIUM GRID */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="grid gap-5 sm:grid-cols-2"
        >
          {TEACHERS.map((teacher) => (
            <motion.div key={teacher.id} variants={FADE_UP}>
              <Link
                href={`/media/academy/teachers/${teacher.id}`}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] transition-all duration-300 hover:-translate-y-1 hover:border-signal-orange/40 hover:shadow-[0_12px_40px_-15px_var(--color-signal-orange)]"
              >
                {/* Cover photo */}
                <div className="relative h-36 w-full overflow-hidden bg-black">
                  <img
                    src={teacher.cover}
                    alt="cover"
                    className="size-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/30 to-transparent" />

                  {/* Live indicator */}
                  <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 backdrop-blur-md ring-1 ring-white/20">
                    <span className={`size-2 rounded-full ${teacher.available ? "animate-pulse bg-green-400" : "bg-white/40"}`} />
                    <span className="text-[10px] font-bold text-white">{teacher.available ? "ক্লাস নিচ্ছেন" : "বিরতিতে"}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative px-5 pb-5 pt-3">
                  {/* Avatar absolutely positioned */}
                  <div className="absolute -top-10 left-5 size-[68px] overflow-hidden rounded-2xl border-2 border-[#0a0a0a] bg-black shadow-xl ring-1 ring-white/10">
                    <img src={teacher.img} alt={teacher.name} className="size-full object-cover" />
                  </div>

                  <div className="mt-9">
                    <h3 className="flex items-center gap-1.5 text-lg font-bold text-white group-hover:text-signal-orange transition-colors">
                      {teacher.name}
                      <CheckCircle className="size-4 shrink-0 text-signal-orange" />
                    </h3>
                    <p className="text-sm font-medium text-white/60">{teacher.role}</p>
                    <p className="mt-0.5 text-xs font-semibold text-signal-orange/80">{teacher.company}</p>
                  </div>

                  <p className="mt-3 text-xs text-white/50 leading-relaxed line-clamp-2">{teacher.bio}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
                    <div className="flex items-center gap-4 text-xs font-semibold text-white/70">
                      <span className="flex items-center gap-1.5">
                        <Star className="size-3.5 fill-signal-orange text-signal-orange" />
                        {teacher.rating}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        {teacher.students}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <PlayCircle className="size-3.5" />
                        {teacher.courses} কোর্স
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-signal-orange opacity-0 transition-opacity group-hover:opacity-100">
                      প্রোফাইল →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* BECOME MENTOR CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-dashed border-signal-orange/40 bg-signal-orange/5 p-8 sm:flex-row"
        >
          <div>
            <h3 className="text-xl font-bold text-white">আপনিও মেন্টর হতে পারেন</h3>
            <p className="mt-1 text-sm text-white/60">আপনার দক্ষতা শেয়ার করুন এবং নিজের কমিউনিটি তৈরি করুন।</p>
          </div>
          <Link href="/media/academy/teach" className={mediaButton({ variant: "primary", size: "lg", className: "w-full shrink-0 rounded-full sm:w-auto" })}>
            মেন্টর হিসেবে আবেদন করুন
          </Link>
        </motion.div>

      </div>

      <aside aria-label="আপনার জন্য" className="sticky top-22 hidden max-h-[calc(100dvh-6.5rem)] w-80 shrink-0 overflow-y-auto scrollbar-none xl:block">
        <FeedRail />
      </aside>
    </div>
  );
}
