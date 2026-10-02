import type { Metadata } from "next";
import { Noto_Serif_Bengali } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ResearchShell } from "@/components/research/shell";
import { Toaster } from "@/components/ui/sonner";

// The encyclopedia's serif for titles and section heads, loaded only here.
const wiki = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["500", "700"],
  variable: "--font-wiki",
  display: "swap",
});

// Share cards need absolute links. Set NEXT_PUBLIC_SITE_URL to the live domain; local runs fall back to localhost.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

/**
 * গবেষণাকোষ (Kandari ResearchPedia): Bangladesh's open research library —
 * a journal to read, a community to react, discuss and share — in the
 * home page's world.
 */
export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className={`${wiki.variable} relative w-full flex-1 bg-black pt-header font-bengali lg:pt-header-lg`}>
        <ResearchShell>{children}</ResearchShell>
      </main>
      <SiteFooter />
      <Toaster
        toastOptions={{
          classNames: {
            toast: "!rounded-2xl !border-white/12 !bg-text-primary !font-bengali !text-white",
            description: "!text-white/75",
            success: "[&_[data-icon]]:!text-signal-orange",
            error: "[&_[data-icon]]:!text-crimson-bright",
          },
        }}
      />
    </>
  );
}
