"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, Camera, ChefHat, Code, Cpu, Database, LayoutTemplate, Mic, MonitorPlay, Music, PenTool, PlayCircle, Users, Wrench, ArrowRight } from "lucide-react";
import { FeedRail } from "@/components/media/feed/feed-rail";
import { mediaButton } from "@/components/media/ui/button-styles";

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const ALL_DEPARTMENTS: Record<string, any> = {
  "eng-software": { title: "সফটওয়্যার ইঞ্জিনিয়ারিং", icon: Code, count: 42, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  "eng-hardware": { title: "হার্ডওয়্যার ও সার্কিট", icon: Cpu, count: 18, color: "text-teal-400", bg: "bg-teal-400/10", border: "border-teal-400/20" },
  "eng-auto": { title: "অটোমোবাইল ও মেকানিক্স", icon: Wrench, count: 12, color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20" },
  "chef": { title: "প্রফেশনাল রন্ধনশিল্প", icon: ChefHat, count: 25, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
  "arts-music": { title: "সংগীত ও ইনস্ট্রুমেন্ট", icon: Music, count: 30, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
};

export function DeptScreen({ id }: { id: string }) {
  const dept = ALL_DEPARTMENTS[id] || { title: "ডিপার্টমেন্ট", icon: BookOpen, color: "text-white", bg: "bg-white/10", border: "border-white/10" };
  const Icon = dept.icon;

  return (
    <div className="flex items-start gap-6">
      <div className="mx-auto w-full max-w-170 min-w-0 space-y-6">
        
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <Link href="/media/academy/departments" className="rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10">
            <ArrowLeft className="size-5 text-white" />
          </Link>
          <div className="flex items-center gap-3">
            <div className={`flex size-8 items-center justify-center rounded-lg ${dept.bg} ${dept.color}`}>
              <Icon className="size-4" />
            </div>
            <h1 className="text-xl font-bold text-white">{dept.title}</h1>
          </div>
        </div>

        {/* ACTIVE WORKSHOPS WITH VIDEO MOCKS */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-white drop-shadow-md">চলমান রিয়েল-লাইফ ক্লাস</h2>
          <div className="grid gap-5">
            {[
              { id: 1, title: "অ্যাডভান্সড প্রজেক্ট-বেজড মাস্টারক্লাস", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", poster: "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&w=600&q=80", students: 1.2 },
              { id: 2, title: "ইন্ডাস্ট্রি স্ট্যান্ডার্ড প্র্যাক্টিক্যাল ওয়ার্কশপ", video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", poster: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80", students: 3.5 }
            ].map((course, i) => (
              <motion.div 
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`group flex flex-col gap-5 overflow-hidden rounded-3xl border ${dept.border} bg-[#0a0a0a] p-5 shadow-2xl sm:flex-row sm:items-center`}
              >
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-black sm:w-60">
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
                    <div className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                      <PlayCircle className="size-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 rounded bg-crimson-bright px-2 py-0.5 text-[10px] font-black tracking-wider text-white shadow-lg animate-pulse">LIVE</div>
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-bold text-white leading-tight group-hover:text-signal-orange transition-colors">{course.title}</h3>
                  <p className="text-sm text-white/60">১০ জন প্রফেশনালের সাথে সরাসরি প্র্যাক্টিক্যাল ল্যাবে কাজ করুন।</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-white/50">
                    <span className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1"><Users className="size-4 text-signal-orange" /> {course.students}k দেখছেন</span>
                    <span className="rounded-full bg-signal-orange/20 px-3 py-1 text-signal-orange">ভর্তি চলছে</span>
                  </div>
                </div>
                <Link href="/media/academy/join" className={mediaButton({ variant: "primary", size: "lg", className: "w-full shrink-0 gap-2 rounded-full shadow-lg sm:w-auto" })}>
                  জয়েন করুন
                  <ArrowRight className="size-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* JOIN FORM */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-text-primary p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className={`flex size-12 items-center justify-center rounded-2xl ${dept.bg} ${dept.color}`}>
              <Icon className="size-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">ডিপার্টমেন্টে যুক্ত হোন</h2>
              <p className="text-sm text-white/60">নতুন ব্যাচের সিট বুকিং করতে নিচের ফর্মটি পূরণ করুন</p>
            </div>
          </div>
          
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/80">আপনার নাম</label>
                <input type="text" placeholder="পুরো নাম" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/80">ফোন নাম্বার</label>
                <input type="tel" placeholder="017********" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-white/80">কেন এই কোর্সটি করতে চান?</label>
              <textarea rows={3} placeholder="আপনার লক্ষ্য ও আগ্রহ সম্পর্কে লিখুন..." className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50" />
            </div>
            <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full rounded-full" })}>
              রেজিস্ট্রেশন কমপ্লিট করুন
            </button>
          </form>
        </section>

      </div>

      <aside aria-label="আপনার জন্য" className="sticky top-22 hidden max-h-[calc(100dvh-6.5rem)] w-80 shrink-0 overflow-y-auto scrollbar-none xl:block">
        <FeedRail />
      </aside>
    </div>
  );
}
