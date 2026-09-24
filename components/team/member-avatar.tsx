import { departments, type TeamMember } from "@/data/team";
import { cn } from "@/lib/utils";

/**
 * Photo placeholder — a monogram on the member's department colour. No
 * team photos have been supplied yet; when they are, this is the one
 * place to swap in <Image>.
 */
export function MemberAvatar({
  member,
  className,
  textClassName,
}: {
  member: TeamMember;
  className?: string;
  textClassName?: string;
}) {
  const color = departments[member.depts[0]].color;
  return (
    <span
      aria-hidden
      className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-full", className)}
      style={{ background: `radial-gradient(circle at 30% 25%, ${color}, #0b1220 85%)` }}
    >
      <span className={cn("font-grotesk font-bold text-white", textClassName)}>{member.initials}</span>
    </span>
  );
}
