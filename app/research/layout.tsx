import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ResearchShell } from "@/components/research/shell";
import { Toaster } from "@/components/ui/sonner";

// Share cards need absolute links. Set NEXT_PUBLIC_SITE_URL to the live domain; local runs fall back to localhost.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Genius",
  description: "Bangladesh's open research library: theses, papers, innovations, projects and ideas on the country's culture, technology and real problems, free to read, download and cite.",
};

/**
 * Genius: Bangladesh's open research library, laid out after
 * JSTOR and dressed as the landing page: the site header, a pitch-black
 * ground, and one footer that carries the library's links too.
 */
export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main lang="en" className="research-ground relative w-full flex-1 bg-black pt-header font-sans text-white scheme-dark lg:pt-header-lg">
        <ResearchShell>{children}</ResearchShell>
      </main>
      <SiteFooter research />
      <Toaster
        toastOptions={{
          classNames: {
            toast: "!rounded-2xl !border-white/12 !bg-bdnavy-900 !font-sans !text-white",
            description: "!text-white/80",
            actionButton: "!bg-signal-orange !font-semibold !text-text-primary",
            success: "[&_[data-icon]]:!text-signal-orange",
            error: "[&_[data-icon]]:!text-national-crimson",
          },
        }}
      />
    </>
  );
}
