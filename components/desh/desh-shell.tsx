import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ChapterPager } from "./chapter-pager";

/** Header, page body, chapter pager and footer shared by the five country pages. */
export function DeshShell({ current, children }: { current: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="relative w-full bg-[#fcfdfd] pt-header lg:pt-header-lg">
        {children}
        <ChapterPager current={current} />
      </main>
      <SiteFooter />
    </>
  );
}
