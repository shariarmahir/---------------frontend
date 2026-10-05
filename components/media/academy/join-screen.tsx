"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, CreditCard, PlayCircle, ShieldCheck, User } from "lucide-react";
import { FeedRail } from "@/components/media/feed/feed-rail";
import { mediaButton } from "@/components/media/ui/button-styles";
import { useState } from "react";

const FADE_UP = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export function JoinScreen() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleNext = () => setStep(2);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="flex items-start gap-6">
      <div className="mx-auto w-full max-w-170 min-w-0 space-y-6">
        
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          <Link href="/media/academy" className="rounded-full bg-white/5 p-2 transition-colors hover:bg-white/10">
            <ArrowLeft className="size-5 text-white" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">কোর্স রেজিস্ট্রেশন</h1>
            <p className="text-xs text-white/60">অ্যাডভান্সড প্রজেক্ট-বেজড মাস্টারক্লাস</p>
          </div>
        </div>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-signal-orange/30 bg-signal-orange/10 p-12 text-center"
          >
            <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-signal-orange text-black">
              <CheckCircle2 className="size-10" />
            </div>
            <h2 className="mb-2 text-2xl font-black text-white">স্বাগতম ক্লাসরুমে!</h2>
            <p className="mb-8 text-sm text-white/70">আপনার রেজিস্ট্রেশন সফল হয়েছে। ক্লাসের শিডিউল এবং মেটেরিয়ালস আপনার ড্যাশবোর্ডে যুক্ত করা হয়েছে।</p>
            <Link href="/media/classroom" className={mediaButton({ variant: "primary", size: "lg", className: "rounded-full" })}>
              আমার ক্লাসরুমে যান
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial="hidden" 
            animate="show" 
            variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            className="grid gap-6 md:grid-cols-[1fr_300px]"
          >
            {/* Form Section */}
            <motion.div variants={FADE_UP} className="space-y-6">
              
              {/* STEPS INDICATOR */}
              <div className="flex items-center justify-between px-2">
                <div className={`flex items-center gap-2 ${step >= 1 ? "text-signal-orange" : "text-white/40"}`}>
                  <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${step >= 1 ? "bg-signal-orange text-black" : "bg-white/10"}`}>1</div>
                  <span className="text-sm font-bold">ব্যক্তিগত তথ্য</span>
                </div>
                <div className={`h-[1px] flex-1 mx-4 ${step >= 2 ? "bg-signal-orange" : "bg-white/10"}`} />
                <div className={`flex items-center gap-2 ${step >= 2 ? "text-signal-orange" : "text-white/40"}`}>
                  <div className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${step >= 2 ? "bg-signal-orange text-black" : "bg-white/10"}`}>2</div>
                  <span className="text-sm font-bold">পেমেন্ট</span>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 sm:p-8 shadow-2xl">
                {step === 1 ? (
                  <div className="space-y-5">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-white"><User className="size-5 text-signal-orange" /> আপনার বিস্তারিত</h3>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
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
                      <label className="text-xs font-bold text-white/80">বর্তমান পেশা/স্ট্যাটাস</label>
                      <select className="w-full appearance-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50">
                        <option value="">নির্বাচন করুন</option>
                        <option value="student">স্টুডেন্ট</option>
                        <option value="professional">প্রফেশনাল</option>
                        <option value="freelancer">ফ্রিল্যান্সার</option>
                        <option value="business">ব্যবসায়ী</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-white/80">প্রত্যাশা</label>
                      <textarea rows={3} placeholder="এই কোর্স থেকে আপনি কী শিখতে চান?" className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-signal-orange/50 focus:ring-1 focus:ring-signal-orange/50" />
                    </div>

                    <button type="button" onClick={handleNext} className={mediaButton({ variant: "primary", size: "lg", className: "mt-4 w-full gap-2 rounded-full" })}>
                      পরবর্তী ধাপ <ChevronRight className="size-5" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-white"><CreditCard className="size-5 text-signal-orange" /> পেমেন্ট ডিটেইলস</h3>
                    
                    <div className="rounded-2xl border border-signal-orange/30 bg-signal-orange/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-white">কোর্স ফি</span>
                        <span className="text-sm font-bold text-white">৳ ৫,০০০</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/10 pt-2">
                        <span className="text-lg font-bold text-white">সর্বমোট</span>
                        <span className="text-2xl font-black text-signal-orange">৳ ৫,০০০</span>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-signal-orange/50">
                        <div className="flex items-center gap-3">
                          <div className="size-4 rounded-full border-2 border-signal-orange bg-signal-orange" />
                          <span className="font-semibold text-white">বিকাশ পেমেন্ট</span>
                        </div>
                        <img src="https://www.bkash.com/logo/bkash_logo.svg" alt="bKash" className="h-6" />
                      </label>
                      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:border-signal-orange/50">
                        <div className="flex items-center gap-3">
                          <div className="size-4 rounded-full border-2 border-white/20" />
                          <span className="font-semibold text-white">ক্রেডিট/ডেবিট কার্ড</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-6 w-10 rounded bg-white/10" />
                          <div className="h-6 w-10 rounded bg-white/10" />
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <button type="button" onClick={() => setStep(1)} className="text-sm font-bold text-white/60 hover:text-white">
                        ← পেছনে যান
                      </button>
                      <button type="submit" disabled={isSubmitting} className={mediaButton({ variant: "primary", size: "lg", className: "gap-2 rounded-full shadow-[0_10px_30px_-10px_var(--color-signal-orange)]" })}>
                        {isSubmitting ? "প্রসেসিং..." : "পেমেন্ট কমপ্লিট করুন"}
                        {!isSubmitting && <CheckCircle2 className="size-5" />}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Premium Summary Sidebar */}
            <motion.div variants={FADE_UP} className="hidden flex-col gap-4 md:flex">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]">
                <div className="relative aspect-video w-full bg-black">
                  <img src="https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&w=600&q=80" alt="Course Cover" className="size-full object-cover opacity-60" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="size-12 text-white/80" />
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-white">অ্যাডভান্সড প্রজেক্ট-বেজড মাস্টারক্লাস</h4>
                  <p className="mt-2 text-xs text-white/60">ইন্সট্রাক্টর: আরিফ অর্ক</p>
                  
                  <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-xs font-medium text-white/80">
                    <div className="flex items-center gap-2"><BookOpen className="size-4 text-signal-orange" /> ২৪টি লাইভ ক্লাস</div>
                    <div className="flex items-center gap-2"><ShieldCheck className="size-4 text-signal-orange" /> থিসিস ও প্রজেক্ট চেকিং</div>
                    <div className="flex items-center gap-2"><CheckCircle2 className="size-4 text-signal-orange" /> প্রফেশনাল সার্টিফিকেট</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      </div>

      <aside aria-label="আপনার জন্য" className="sticky top-22 hidden max-h-[calc(100dvh-6.5rem)] w-80 shrink-0 overflow-y-auto scrollbar-none xl:block">
        <FeedRail />
      </aside>
    </div>
  );
}
