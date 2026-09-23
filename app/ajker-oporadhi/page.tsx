import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { OffenderConsole } from "@/components/offender/offender-console";
import { OffenderMasthead } from "@/components/offender/offender-masthead";
import { OffenderRegister } from "@/components/offender/offender-register";
import { OffenderTipoff } from "@/components/offender/offender-tipoff";

export const metadata: Metadata = {
  title: "আজকের অপরাধী | Offender Index — কাণ্ডারী-ল্যাব",
  description:
    "অপরাধের পুনরাবৃত্তি প্যাটার্ন ও আদালতে দণ্ডপ্রাপ্তদের প্রকাশ্য রেজিস্ট্রি। দোষী সাব্যস্ত না হওয়া পর্যন্ত কারও নাম বা ছবি প্রকাশ করা হয় না।",
};

export default function AjkerOporadhiPage() {
  return (
    <>
      <SiteHeader />
      <main className="w-full bg-slate-50 pt-header lg:pt-header-lg">
        <OffenderMasthead />
        <OffenderConsole />
        <OffenderRegister />
        <OffenderTipoff />
      </main>
      <SiteFooter />
    </>
  );
}
