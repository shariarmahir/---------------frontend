import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PixelMark } from "@/components/ui/section-kit";
import { cn } from "@/lib/utils";

/** Page title row for /media screens. */
export function PageHeader({
  title,
  subtitle,
  actions,
  back,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="live-in mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="group mb-2 inline-flex min-h-8 items-center gap-1.5 text-sm font-semibold text-signal-orange">
            <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" aria-hidden />
            {back.label}
          </Link>
        )}
        <PixelMark tone="dark" className="mb-2" />
        <h1 className="text-2xl font-bold tracking-tight text-balance text-white sm:text-[2rem] sm:leading-tight">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/80">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** White surface for a group of content. Never nest panels. */
export function Panel({
  title,
  action,
  children,
  className,
  as: Tag = "section",
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "aside" | "article";
}) {
  return (
    <Tag className={cn("story-reveal rounded-2xl bg-text-primary p-4 ring-1 ring-white/12 sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h2 className="text-base font-bold text-signal-orange">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </Tag>
  );
}
