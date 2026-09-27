import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, SIGN_IN_PANEL } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "সাইন ইন | কাণ্ডারী-ল্যাব",
  description: "মোবাইল কোড বা ইমেইলে Kandari Profile-এ সাইন ইন করুন — গবেষণা ও পণ্যের আপডেট, শিক্ষিতদের মিডিয়া আর আপনার অগ্রগতি এক অ্যাকাউন্টে।",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <AuthShell panel={SIGN_IN_PANEL}>
      {/* The form reads ?next= and ?token=, which needs a Suspense boundary. */}
      <Suspense fallback={<div className="h-96" aria-hidden />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
