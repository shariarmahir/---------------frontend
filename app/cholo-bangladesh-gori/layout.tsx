import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { GoriProvider } from "@/components/gori/provider";
import { GoriNav } from "@/components/gori/shell";

export default function GoriLayout({ children }: { children: React.ReactNode }) {
  return (
    <GoriProvider>
      <SiteHeader />
      <main className="w-full bg-gori-deep pt-header text-white lg:pt-header-lg">
        <GoriNav />
        {children}
      </main>
      <SiteFooter />
    </GoriProvider>
  );
}
