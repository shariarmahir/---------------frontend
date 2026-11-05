import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

/** What every MOTHERLAND and BD Guide page shares when it is linked elsewhere: absolute share images and a large card. */
export const metadata: Metadata = {
  metadataBase: SITE_URL,
  twitter: { card: "summary_large_image" },
  openGraph: { siteName: "MOTHERLAND", locale: "en_GB", type: "website", images: ["/motherland/photos/flag-mural.jpg"] },
};

export default function BangladeshLayout({ children }: { children: React.ReactNode }) {
  return children;
}
