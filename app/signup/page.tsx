import type { Metadata } from "next";
import { Icon } from "@/components/ui/icon";
import {
  SignupBanner,
  SignupStatusBar,
  SignupSteps,
} from "@/components/signup/signup-masthead";
import {
  SectionAccount,
  SectionBiometric,
  SectionCareer,
  SectionConsent,
  SectionDistrict,
  SectionIdentity,
  SectionLinks,
} from "@/components/signup/signup-form";
import { SignupAside } from "@/components/signup/signup-aside";

export const metadata: Metadata = {
  title: "সার্বভৌম পরিচয় ও রিজিউমে ভেরিফিকেশন | কাণ্ডারী-ল্যাব",
  description:
    "কাণ্ডারী জাতীয় পরিচয়পত্র, ক্যারিয়ার প্রোফাইল ও উদ্ভাবক নিবন্ধন — NID/পাসপোর্ট যাচাই, বায়োমেট্রিক ও স্বয়ংক্রিয় রিজিউমে সিঙ্ক।",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-mint-subtle">
      <main className="relative w-full flex-1 overflow-hidden pt-space-md pb-space-xl sm:pt-space-lg">
        {/* Ambient cleanroom field: a faint rule grid plus two soft blooms. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(3 32 23 / 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgb(3 32 23 / 0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-bd-green/5 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 -left-40 size-96 rounded-full bg-bd-green-light/40 blur-3xl"
        />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-space-lg px-gutter-mobile sm:px-gutter">
          <SignupStatusBar />
          <SignupBanner />
          <SignupSteps />

          <form
            className="grid grid-cols-1 items-start gap-space-lg lg:grid-cols-12"
            action="#"
          >
            <div className="flex flex-col gap-space-lg lg:col-span-8">
              <SectionAccount />
              <SectionIdentity />
              <SectionCareer />
              <SectionLinks />
              <SectionBiometric />
              <SectionDistrict />
              <SectionConsent />
            </div>

            <aside className="lg:col-span-4">
              <SignupAside />
            </aside>
          </form>
        </div>
      </main>

      <footer className="w-full border-t border-card-border bg-white py-space-lg">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-space-md px-gutter-mobile sm:px-gutter md:flex-row">
          <div className="flex flex-col items-center gap-space-md text-center sm:flex-row sm:text-left">
            <span className="flex items-center gap-space-xs">
              <Icon name="verified_user" className="text-lg text-bd-green" />
              <span className="font-grotesk text-label-sm font-semibold text-text-primary">
                সার্বভৌম ডিজিটাল প্ল্যাটফর্ম
              </span>
            </span>
            <span className="hidden text-card-border sm:block">•</span>
            <p className="font-sans text-body-sm text-text-secondary">
              আইসিটি বিভাগ ও জাতীয় ডাটা সেন্টার, গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
              কর্তৃক স্বীকৃত
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-space-md">
            <span className="font-grotesk text-[10px] tracking-wider text-text-secondary">
              PQC PROTOCOL LEVEL-5 • ISO/IEC 27001
            </span>
            <span className="flex items-center gap-1 font-grotesk text-[10px] font-semibold text-bd-green">
              <span className="size-1.5 rounded-full bg-bd-green" />
              সিস্টেম স্ট্যাটাস স্বাভাবিক
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
