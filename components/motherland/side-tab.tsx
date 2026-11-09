import { Icon } from "@/components/ui/icon";

/** The reference site's tab on the right edge, here a standing way to the closing call. Wide screens only. */
export function SideTab({ href = "#join" }: { href?: string }) {
  return (
    <a
      href={href}
      className="fixed top-1/2 right-0 z-40 hidden -translate-y-1/2 items-center gap-2 rounded-l-xl bg-black px-2 py-5 text-sm font-semibold text-white shadow-lg ring-1 ring-white/20 transition-colors flex-col hover:bg-ml-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green lg:flex"
    >
      <span className="rotate-180 [writing-mode:vertical-rl]">Join with us</span>
      <Icon name="bolt" className="text-lg text-signal-orange" />
    </a>
  );
}
