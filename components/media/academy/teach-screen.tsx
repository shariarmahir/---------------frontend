"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Users, CheckCircle2, ShieldCheck, PlaySquare, FileText } from "lucide-react";
import { FeedRail } from "@/components/media/feed/feed-rail";
import { mediaButton } from "@/components/media/ui/button-styles";

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function TeachScreen() {
  return (
    <div className="flex items-start gap-6">
      <div className="mx-auto w-full max-w-170 min-w-0 space-y-6">
        
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <Link href="/media/academy" className="rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10">
            <ArrowLeft className="size-5 text-white" />
          </Link>
          <h1 className="text-xl font-bold text-white">শিক্ষক ও মেন্টরশিপ</h1>
        </div>

        <motion.section 
          initial="hidden" 
          animate="show" 
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="rounded-3xl border border-white/10 bg-text-primary p-6 sm:p-8"
        >
          <motion.div variants={FADE_UP} className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-signal-orange/10 text-signal-orange">
            <Users className="size-7" />
          </motion.div>
          
          <motion.h2 variants={FADE_UP} className="mb-3 text-2xl font-bold text-white">
            নিজে শেখান অথবা টিম/ডিপার্টমেন্ট তৈরি করুন
          </motion.h2>
          
          <motion.p variants={FADE_UP} className="mb-8 text-sm leading-relaxed text-white/70">
            আপনি কি প্রফেশনাল মিউজিশিয়ান, শেফ, মেকানিক বা ইঞ্জিনিয়ার? আপনার প্র্যাক্টিক্যাল স্কিল অন্যদের সাথে শেয়ার করুন। একা অথবা ৫-১০ জন বন্ধুর টিম মিলে নতুন ডিপার্টমেন্ট তৈরি করে প্রফেশনাল ক্লাস নিতে পারেন।
          </motion.p>

          <motion.div variants={FADE_UP} className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, title: "প্রফেশনাল ইন্টারভিউ", desc: "শিক্ষক হিসেবে যোগ দিতে হলে আপনার পূর্ব অভিজ্ঞতা ও প্র্যাক্টিক্যাল ইন্টারভিউ নেওয়া হবে।" },
              { icon: Users, title: "টিম ডিপার্টমেন্ট", desc: "কয়েকজন মিলে একটি முழு ডিপার্টমেন্ট (যেমন: ফুল-স্ট্যাক ওয়েব, অটোমোবাইল রিপেয়ার) চালাতে পারবেন।" },
              { icon: PlaySquare, title: "লাইভ ও ফিজিক্যাল ক্লাস", desc: "অনলাইন লাইভ ভিডিও অথবা রিয়েল-লাইফ কিচেন/ল্যাবে ফিজিক্যাল ক্লাসের সুবিধা।" },
              { icon: FileText, title: "নোটস ও ডকুমেন্টস", desc: "পিডিএফ, এক্সেল বা ডেটাশিট আপলোড করে ছাত্রদের ম্যাটেরিয়াল প্রোভাইড করুন।" }
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
              <h3 className="mb-6 text-xl font-bold text-white">মেন্টর / ইনস্ট্রাক্টর আবেদন ফর্ম</h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80">পুরো নাম</label>
                    <input type="text" placeholder="e.g. রাফসান হক" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white/80">পেশা বা স্কিল টাইটেল</label>
                    <input type="text" placeholder="e.g. সিনিয়র সফটওয়্যার ইঞ্জিনিয়ার" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/80">আপনার পোর্টফোলিও / প্রজেক্ট লিংক</label>
                  <input type="url" placeholder="https://..." className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-white/80">টিচিং বা মেন্টরিং প্ল্যান (সংক্ষেপে)</label>
                  <textarea rows={3} placeholder="আপনি কীভাবে শেখাতে চান? প্র্যাক্টিক্যাল ক্লাস কীভাবে নিবেন?" className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50" />
                </div>

                <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center">
                  <button type="submit" className={mediaButton({ variant: "primary", size: "lg", className: "w-full flex-1 gap-2 rounded-full shadow-[0_10px_30px_-10px_var(--color-signal-orange)]" })}>
                    <CheckCircle2 className="size-5" />
                    অ্যাপ্লিকেশন সাবমিট করুন
                  </button>
                  <button type="button" className={mediaButton({ variant: "secondary", size: "lg", className: "w-full flex-1 rounded-full border-white/20 bg-white/5 hover:bg-white/10" })}>
                    নতুন ডিপার্টমেন্ট খুলতে রিকোয়েস্ট
                  </button>
                </div>
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
