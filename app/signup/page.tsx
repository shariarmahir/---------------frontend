import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell, SIGN_UP_PANEL } from "@/components/auth/auth-shell";
import { SignupFlow } from "@/components/auth/signup-flow";

export const metadata: Metadata = {
  title: "অ্যাকাউন্ট খুলুন | কাণ্ডারী-ল্যাব",
  description: "Kandari Profile খুলুন — মোবাইল নম্বর যাচাই করে পছন্দের খাত ও পণ্যের গবেষণা, রিলিজ আর এলাকার আপডেট পান। বিনামূল্যে।",
};

export default function SignupPage() {
  return (
    <AuthShell panel={SIGN_UP_PANEL}>
      <Suspense fallback={<div className="h-96" aria-hidden />}>
        <SignupFlow />
      </Suspense>
    </AuthShell>
  );
}
