import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: { default: "Kandari HQ", template: "%s · Kandari HQ" },
  description: "Kandari Lab's own control room: TaskBook, teams, chat, calendars, HR, clients and finance.",
  robots: { index: false, follow: false },
};

/**
 * কাণ্ডারী HQ (/hq): the company's own control room, members only, in the
 * landing page's pitch-black dress. Sign-in pages live in (gate), the rest
 * in (app) behind the server-checked session.
 */
export default function HqLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="en" className="hq flex min-h-dvh flex-col bg-black text-white">
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "!rounded-xl !border-white/15 !bg-bdnavy-900 !font-sans !text-white",
            description: "!text-white/70",
            success: "[&_[data-icon]]:!text-signal-orange",
            error: "[&_[data-icon]]:!text-crimson-bright",
          },
        }}
      />
    </div>
  );
}
