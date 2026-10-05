import type { Metadata, Viewport } from "next";
import {
  Sora,
  Inter,
  Hind_Siliguri,
  JetBrains_Mono,
} from "next/font/google";
import { RevealFallback } from "@/components/ui/reveal-fallback";
import "./globals.css";

// Gilroy is a commercial font with no next/font/google entry and no local
// files in this project; Sora is the closest free geometric-sans match for
// headings, matching Gilroy's rounded, confident letterforms.
// Sora and JetBrains Mono are not on every route (the /media feed uses
// neither above the fold), so they are not preloaded: a preloaded font the
// page never draws makes the browser warn "preloaded but not used". They
// still load the moment text needs them, and next/font's size-matched
// fallback keeps the layout from jumping while they do.
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  preload: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
  // Bengali only renders as a same-stack fallback for mixed-script text
  // (see globals.css font stacks), so it isn't guaranteed to be used on
  // every route. Preloading it unconditionally triggers "preloaded but
  // not used" warnings on pages with no Bengali glyphs.
  preload: false,
});

export const metadata: Metadata = {
  title: "Kandari-Lab | কাণ্ডারী-ল্যাব",
  description:
    "Sovereign deep-tech innovation infrastructure engineered for Bangladesh — clinical AI, biosensing wearables, semiconductors, and mechatronics.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Browser extensions inject attributes onto <html> before hydration.
      suppressHydrationWarning
      // globals.css sets smooth scrolling for in-page links; this tells Next
      // it is deliberate, so route changes still jump to the top instantly.
      data-scroll-behavior="smooth"
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} ${hindSiliguri.variable} h-full antialiased`}
    >
      <head>
        {/* Material Symbols has no next/font/google export; the App Router
            root layout applies this to every route, so the page-font rule
            does not apply. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background font-sans text-body-md text-foreground antialiased"
      >
        {children}
        <RevealFallback />
      </body>
    </html>
  );
}
