import type { Metadata } from "next";
import { Manrope, Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kandari-Lab | কাণ্ডারী-ল্যাব",
  description:
    "Sovereign deep-tech innovation infrastructure engineered for Bangladesh — clinical AI, biosensing wearables, semiconductors, and mechatronics.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable} ${notoBengali.variable} h-full antialiased`}
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
      <body className="min-h-full flex flex-col bg-background font-sans text-body-md text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
