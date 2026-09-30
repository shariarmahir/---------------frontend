import Image from "next/image";
import { toneOf, type TeamMember } from "@/data/team";
import { cn } from "@/lib/utils";

/**
 * A member's round face: their portrait when one is supplied, otherwise
 * their initials on the department's solid colour (no gradients — the home
 * page's solid Pixel-Map fields).
 */
export function MemberAvatar({
  member,
  className,
  textClassName,
  sizes = "96px",
}: {
  member: TeamMember;
  className?: string;
  textClassName?: string;
  /** `sizes` for the portrait, so a large avatar loads a sharp file. */
  sizes?: string;
}) {
  const dept = toneOf(member);
  return (
    <span aria-hidden className={cn("relative flex shrink-0 items-center justify-center overflow-hidden rounded-full", dept.surface, className)}>
      {member.photo ? (
        <Image src={member.photo} alt="" fill sizes={sizes} className="object-cover object-top" />
      ) : (
        <span className={cn("font-grotesk font-bold", textClassName)}>{member.initials}</span>
      )}
    </span>
  );
}
