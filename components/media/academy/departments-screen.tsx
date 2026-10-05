"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, Camera, ChefHat, Code, Cpu, Database, LayoutTemplate, Mic, MonitorPlay, Music, PenTool, Wrench, ArrowRight } from "lucide-react";
import { FeedRail } from "@/components/media/feed/feed-rail";

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ALL_DEPARTMENTS = [
  { id: "eng-software", title: "সফটওয়্যার ইঞ্জিনিয়ারিং", icon: Code, count: 42, color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: "eng-hardware", title: "হার্ডওয়্যার ও সার্কিট", icon: Cpu, count: 18, color: "text-teal-400", bg: "bg-teal-400/10" },
  { id: "eng-auto", title: "অটোমোবাইল ও মেকানিক্স", icon: Wrench, count: 12, color: "text-gray-400", bg: "bg-gray-400/10" },
  { id: "chef", title: "প্রফেশনাল রন্ধনশিল্প", icon: ChefHat, count: 25, color: "text-orange-400", bg: "bg-orange-400/10" },
  { id: "arts-music", title: "সংগীত ও ইনস্ট্রুমেন্ট", icon: Music, count: 30, color: "text-purple-400", bg: "bg-purple-400/10" },
  { id: "arts-tattoo", title: "ট্যাটু ও বডি আর্ট", icon: PenTool, count: 8, color: "text-rose-400", bg: "bg-rose-400/10" },
  { id: "media-video", title: "ভিডিওগ্রাফি ও ইউটিউবিং", icon: MonitorPlay, count: 56, color: "text-pink-400", bg: "bg-pink-400/10" },
  { id: "media-content", title: "কনটেন্ট রাইটিং", icon: BookOpen, count: 34, color: "text-amber-400", bg: "bg-amber-400/10" },
  { id: "media-photo", title: "ফটোগ্রাফি", icon: Camera, count: 21, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  { id: "media-podcast", title: "পডকাস্টিং ও ভয়েসওভার", icon: Mic, count: 15, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { id: "tech-design", title: "ইউআই/ইউএক্স ডিজাইন", icon: LayoutTemplate, count: 28, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { id: "tech-data", title: "ডেটা সায়েন্স ও এআই", icon: Database, count: 19, color: "text-fuchsia-400", bg: "bg-fuchsia-400/10" },
];

export function DepartmentsScreen() {
  return (
    <div className="flex items-start gap-6">
      <div className="mx-auto w-full max-w-170 min-w-0 space-y-6">
        
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <Link href="/media/academy" className="rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10">
            <ArrowLeft className="size-5 text-white" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">ডিপার্টমেন্টস</h1>
            <p className="text-xs text-white/60">কান্ডারি একাডেমির সকল প্র্যাক্টিক্যাল স্কিল বিভাগ</p>
          </div>
        </div>

        {/* PREMIUM BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-signal-orange/20 to-black p-8 sm:p-10"
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-black text-white">আপনার প্যাশন খুঁজে নিন</h2>
            <p className="mt-2 text-sm text-white/70 leading-relaxed">
              যেকোনো বয়সে, যেকোনো ব্যাকগ্রাউন্ড থেকে নতুন কিছু শুরু করার সুযোগ। প্রফেশনালদের তৈরি করা ডজনখানেক ডিপার্টমেন্ট থেকে আপনার পছন্দের স্কিলটি বেছে নিন এবং প্র্যাক্টিক্যালি শিখুন।
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial="hidden" 
          animate="show" 
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {ALL_DEPARTMENTS.map((dept) => (
            <motion.div key={dept.id} variants={FADE_UP}>
              <Link href={`/media/academy/dept/${dept.id}`} className="group relative flex h-full flex-col items-start gap-4 overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 transition-all hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl">
                {/* Background glow effect on hover */}
                <div className={`absolute -right-10 -top-10 size-32 rounded-full blur-3xl transition-opacity duration-500 opacity-0 group-hover:opacity-20 ${dept.bg}`} />
                
                <div className={`flex size-14 shrink-0 items-center justify-center rounded-2xl shadow-lg ${dept.bg} ${dept.color}`}>
                  <dept.icon className="size-7" />
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-signal-orange transition-colors">{dept.title}</h3>
                  <p className="text-sm font-medium text-white/50">{dept.count} টি রিয়েল-লাইফ ওয়ার্কশপ</p>
                </div>
                <div className="mt-2 text-xs font-bold text-signal-orange flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  জয়েন করুন <ArrowRight className="size-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>

      <aside aria-label="আপনার জন্য" className="sticky top-22 hidden max-h-[calc(100dvh-6.5rem)] w-80 shrink-0 overflow-y-auto scrollbar-none xl:block">
        <FeedRail />
      </aside>
    </div>
  );
}
