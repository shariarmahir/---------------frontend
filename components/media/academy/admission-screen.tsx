"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileQuestion, GraduationCap, Lightbulb, Sparkles, BrainCircuit } from "lucide-react";
import { FeedRail } from "@/components/media/feed/feed-rail";
import { mediaButton } from "@/components/media/ui/button-styles";

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function AdmissionScreen() {
  return (
    <div className="flex items-start gap-6">
      <div className="mx-auto w-full max-w-170 min-w-0 space-y-6">
        
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <Link href="/media/academy" className="rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10">
            <ArrowLeft className="size-5 text-white" />
          </Link>
          <h1 className="text-xl font-bold text-white">ভর্তি ও যোগ্যতা যাচাই</h1>
        </div>

        <motion.section 
          initial="hidden" 
          animate="show" 
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="rounded-3xl border border-signal-orange/20 bg-text-primary p-6 shadow-[0_8px_30px_-12px_rgba(255,107,0,0.15)] sm:p-8"
        >
          <motion.div variants={FADE_UP} className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-signal-orange/10 text-signal-orange">
            <BrainCircuit className="size-7" />
          </motion.div>
          
          <motion.h2 variants={FADE_UP} className="mb-3 text-2xl font-bold text-white">
            প্রাথমিক স্কিল অ্যাসেসমেন্ট
          </motion.h2>
          
          <motion.p variants={FADE_UP} className="mb-8 text-sm leading-relaxed text-white/70">
            কান্ডারি তৈরি একাডেমিতে কোনো সাধারণ ভর্তি পরীক্ষা হয় না। আপনার পূর্ববর্তী জ্ঞান, আগ্রহ এবং শেখার মানসিকতা যাচাই করা হবে। এটি একটি প্রফেশনাল প্ল্যাটফর্ম, তাই আমরা চাই সঠিক ব্যক্তি সঠিক স্কিল ডেভেলপমেন্টে যুক্ত হোক।
          </motion.p>

          <motion.div variants={FADE_UP} className="space-y-4">
            {[
              { icon: Lightbulb, title: "আগ্রহ ও লক্ষ্য", desc: "আপনি কেন এই স্কিলটি শিখতে চান এবং ভবিষ্যতে এটি নিয়ে কী করতে চান?" },
              { icon: FileQuestion, title: "বেসিক নলেজ টেস্ট", desc: "নির্বাচিত বিষয়ের ওপর ১০টি প্র্যাক্টিক্যাল কুইজ।" },
              { icon: Sparkles, title: "ক্রিয়েটিভিটি চেক", desc: "একটি রিয়েল-লাইফ প্রবলেম সলভিং টাস্ক।" }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-signal-orange/20 text-signal-orange">
                  <step.icon className="size-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-xs text-white/60">{step.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={FADE_UP} className="mt-8">
            <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 shadow-xl sm:p-8">
              <h3 className="mb-6 text-xl font-bold text-white">ভর্তি পরীক্ষার আবেদন ফর্ম</h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-signal-orange">১. ব্যক্তিগত তথ্য</h4>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input type="text" placeholder="আপনার পুরো নাম" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50" />
                    <input type="email" placeholder="ইমেইল অ্যাড্রেস" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-signal-orange">২. কাঙ্ক্ষিত ডিপার্টমেন্ট</h4>
                  <select className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50">
                    <option value="">ডিপার্টমেন্ট নির্বাচন করুন</option>
                    <option value="eng">সফটওয়্যার ইঞ্জিনিয়ারিং</option>
                    <option value="mech">মেকাট্রনিক্স ও হার্ডওয়্যার</option>
                    <option value="chef">প্রফেশনাল রন্ধনশিল্প</option>
                    <option value="arts">সংগীত ও আর্টস</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-signal-orange">৩. প্রি-অ্যাসেসমেন্ট প্রশ্ন</h4>
                  <textarea rows={4} placeholder="আপনি এই স্কিলটি কেন শিখতে চান এবং ৫ বছর পর নিজেকে কোথায় দেখতে চান?" className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50" />
                </div>

                <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-black p-5 ring-1 ring-white/10 sm:flex-row">
                  <div>
                    <p className="text-sm font-bold text-white">অ্যাসেসমেন্ট ফি</p>
                    <p className="text-xs text-signal-orange">প্ল্যাটফর্ম মেইনটেন্যান্স ফি</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-2xl font-black text-white">৳ ৫০০</p>
                  </div>
                </div>

                <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "mt-4 w-full gap-2 rounded-full shadow-[0_10px_30px_-10px_var(--color-signal-orange)]" })}>
                  <CheckCircle2 className="size-5" />
                  পেমেন্ট করুন ও টেস্ট শুরু করুন
                </button>
              </form>
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
