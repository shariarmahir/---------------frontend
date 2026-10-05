"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Award, Briefcase, ChevronRight, FileSearch, ShieldCheck, Zap } from "lucide-react";
import { FeedRail } from "@/components/media/feed/feed-rail";
import { mediaButton } from "@/components/media/ui/button-styles";

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function ExamScreen() {
  return (
    <div className="flex items-start gap-6">
      <div className="mx-auto w-full max-w-170 min-w-0 space-y-6">
        
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <Link href="/media/academy" className="rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10">
            <ArrowLeft className="size-5 text-white" />
          </Link>
          <h1 className="text-xl font-bold text-white">ফাইনাল এক্সাম ও থিসিস</h1>
        </div>

        <motion.section 
          initial="hidden" 
          animate="show" 
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="relative overflow-hidden rounded-3xl border border-signal-orange/20 bg-text-primary p-6 sm:p-8"
        >
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 size-48 rounded-full bg-signal-orange/10 blur-3xl"></div>
          
          <motion.div variants={FADE_UP} className="relative z-10 mb-6 flex size-14 items-center justify-center rounded-2xl bg-signal-orange/10 text-signal-orange">
            <Award className="size-7" />
          </motion.div>
          
          <motion.h2 variants={FADE_UP} className="relative z-10 mb-3 text-2xl font-bold text-white">
            স্কিলের প্রফেশনাল ভেরিফিকেশন
          </motion.h2>
          
          <motion.p variants={FADE_UP} className="relative z-10 mb-8 text-sm leading-relaxed text-white/70">
            কোর্স শেষ করাই সবকিছু নয়। কান্ডারি একাডেমিতে আপনাকে প্রফেশনাল এক্সাম ও থিসিস প্রজেক্টের মাধ্যমে আপনার দক্ষতা প্রমাণ করতে হবে। এই এক্সামগুলো দেশের সেরা প্রফেশনালদের দ্বারা চেক করা হবে এবং এর মাধ্যমেই আপনি পাবেন প্রেস্টিজিয়াস সার্টিফিকেট যা জব মার্কেটে আপনাকে এক ধাপ এগিয়ে রাখবে।
          </motion.p>

          <motion.div variants={FADE_UP} className="relative z-10 grid gap-4">
            {[
              { icon: FileSearch, title: "রিয়েল-লাইফ থিসিস / প্রজেক্ট", desc: "আপনাকে একটি বাস্তব সমস্যার ওপর থিসিস বা প্রজেক্ট সাবমিট করতে হবে (যেমন: একটি ফুল-স্ট্যাক অ্যাপ বানানো বা ৫ জনের রান্নার মেনু তৈরি করা)।" },
              { icon: Briefcase, title: "প্রফেশনাল ইন্টারভিউ", desc: "আপনার সাবমিট করা প্রজেক্টের ওপর প্রফেশনালদের প্যানেল সরাসরি লাইভ ইন্টারভিউ বা ভাইভা নেবে।" },
              { icon: ShieldCheck, title: "স্কিল ভেরিফিকেশন ও সার্টিফিকেট", desc: "সফলভাবে উত্তীর্ণ হলে আপনাকে একটি ভেরিফায়েড কিউআর কোডসহ সার্টিফিকেট প্রদান করা হবে, যা সরাসরি আপনার প্রোফাইলে যুক্ত হবে।" }
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors hover:border-white/10 hover:bg-white/10">
                <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-signal-orange/10 text-signal-orange">
                  <step.icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{step.title}</h3>
                  <p className="mt-1 text-xs text-white/70">{step.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={FADE_UP} className="relative z-10 mt-8 rounded-2xl bg-signal-orange p-6 text-black shadow-[0_10px_30px_-10px_var(--color-signal-orange)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-black">
                  <Zap className="size-5" />
                  এক্সাম স্লট বুক করুন
                </h3>
                <p className="mt-1 text-sm font-medium opacity-80">
                  আপনার প্রজেক্ট রেডি হলে ইন্টারভিউয়ের জন্য প্যানেল স্লট বেছে নিন।
                </p>
              </div>
              <button className="group flex shrink-0 items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105">
                স্লট বুকিং
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.div>
        </motion.section>

      </div>

      <aside aria-label="আপনার জন্য" className="sticky top-22 hidden max-h-[calc(100dvh-6.5rem)] w-80 shrink-0 overflow-y-auto scrollbar-none xl:block">
        <FeedRail />
      </aside>
    </div>
  );
}
