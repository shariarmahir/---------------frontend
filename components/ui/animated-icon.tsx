import { LordIcon } from "@lordicon/react";
import { Icon } from "@/components/ui/icon";

/**
 * An animated Lordicon (the "Doodle Color" set), loaded from
 * `/public/lordicon/<name>.json`.
 *
 * Adding one:
 *   1. On lordicon.com pick the icon, set its colours and stroke, and
 *      download it as Lottie JSON.
 *   2. Save it as `public/lordicon/<name>.json`.
 *   3. `<AnimatedIcon name="<name>" fallback="<material symbol>" />`.
 *
 * `fallback` is a Material Symbols name. It is what shows (and keeps
 * showing) until the file loads, or if it is missing or fails, so the page
 * never has a hole and an icon can be swapped in one place at a time. The
 * box has a fixed size, so nothing shifts when the animation arrives.
 *
 * The JSON loads on demand (`loading="lazy"`) rather than with the page,
 * and viewers who ask for less motion get the still last frame (the
 * package handles that). Free-plan Lordicon icons need an attribution link
 * on the site — see the Lordicon licence for the plan you are on.
 */
export function AnimatedIcon({
  name,
  fallback,
  size = 32,
  trigger = "hover",
  state,
  colors,
  target,
  label,
  className,
}: {
  /** File name in `public/lordicon/`, without `.json`. */
  name: string;
  /** Material Symbols name shown until the animation loads. */
  fallback: string;
  /** Square size in px. */
  size?: number;
  /** What plays it: "hover", "click", "loop", "in", "loop-on-hover"… */
  trigger?: string;
  /** Which of the icon's animations to use (see the icon on lordicon.com). */
  state?: string;
  /** Recolour: `{ primary: "#e4b027", secondary: "#0b1849" }`. */
  colors?: Record<string, string>;
  /** Element the trigger listens on, e.g. the button around the icon: `"button"`. */
  target?: string;
  /** Set only when the icon means something on its own; otherwise it is decorative. */
  label?: string;
  className?: string;
}) {
  return (
    <LordIcon
      src={`/lordicon/${name}.json`}
      trigger={trigger}
      state={state}
      colors={colors}
      target={target}
      loading="lazy"
      className={className}
      style={{ width: size, height: size, display: "inline-block" }}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <span
        className="inline-flex items-center justify-center"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.75) }}
      >
        <Icon name={fallback} className="[font-size:inherit]!" />
      </span>
    </LordIcon>
  );
}
