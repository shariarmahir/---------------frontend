/*
 * শিক্ষিতদের মিডিয়া's poster film: the platform's core loop (CLAUDE.md §1:
 * post a skill → self-rate → the community verifies → hire) played as a
 * ten-second motion piece in the poster card's hill (a 416 × 395 box).
 *
 *   0.0s  ০১ a post rises in — your skill, with its photo
 *   2.5s  ০২ you rate yourself, star by star
 *   5.0s  ০৩ the community verifies: faces gather, the badge lands
 *   7.2s  ০৪ "কাজে নিন" appears, a pointer taps it, the hire stamp drops
 *
 * A player bar along the foot runs the ten seconds with the chapter names
 * over it, so it reads as a film. The post sits inside the hill's dome; the
 * captions and bar use the full-width foot. Movement is the .mr-* classes in
 * globals.css: each layer's resting state is its final, fully drawn one, so
 * reduced motion shows the finished post, still, with a one-line summary.
 * The card pauses it off screen (.ms-root[data-paused]).
 */
import type { CSSProperties } from "react";

const d = (ms: number) => ({ "--d": ms }) as CSSProperties;

const CHAPTERS = [
  ["০১", "দক্ষতা পোস্ট"],
  ["০২", "নিজের রেটিং"],
  ["০৩", "কমিউনিটি যাচাই"],
  ["০৪", "কাজ ও আয়"],
] as const;

/** A five-point star centred on (cx, cy), outer radius r. */
function star(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 === 0 ? r : r * 0.45;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return pts.join(" ");
}

/** A small floating tag beside the post. */
function Tag({ x, y, w, label, cls, delay = 0 }: { x: number; y: number; w: number; label: string; cls: string; delay?: number }) {
  return (
    <g className={`mr ${cls}`} style={d(delay)}>
      <g className="ms-float" style={{ "--dur": 2.8 } as CSSProperties}>
        <rect x={x} y={y} width={w} height="24" rx="12" className="fill-white/10 stroke-white/30" strokeWidth="1" />
        <text x={x + w / 2} y={y + 16} textAnchor="middle" className="fill-white font-bengali" fontSize="11" fontWeight="700">
          {label}
        </text>
      </g>
    </g>
  );
}

export function MediaReel() {
  return (
    <svg
      role="img"
      aria-label="শিক্ষিতদের মিডিয়া: দক্ষতা পোস্ট, নিজের রেটিং, কমিউনিটি যাচাই, তারপর কাজ"
      viewBox="0 0 416 395"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <clipPath id="media-reel-photo">
          <rect x="120" y="132" width="156" height="88" rx="10" />
        </clipPath>
      </defs>

      {/* The stage: solid ink, one soft gold light behind the post. */}
      <rect width="416" height="395" className="fill-text-primary" />
      <circle cx="198" cy="206" r="150" className="fill-signal-orange" opacity="0.07" />
      <circle cx="198" cy="206" r="96" className="fill-signal-orange" opacity="0.06" />

      {/* Tags that drift beside the post. */}
      <Tag x={18} y={232} w={84} label="#হস্তশিল্প" cls="mr-at1" delay={500} />
      <Tag x={296} y={252} w={100} label="ন্যায্য মজুরি" cls="mr-at3" delay={900} />

      {/* ০১ — the post. */}
      <g className="mr mr-at0">
        <rect x="110" y="100" width="176" height="226" rx="16" className="fill-black" opacity="0.35" />
        <rect x="110" y="92" width="176" height="226" rx="16" className="fill-white" />

        <circle cx="128" cy="112" r="10" className="fill-bd-green" />
        <text x="128" y="116" textAnchor="middle" className="fill-white font-bengali" fontSize="10" fontWeight="700">আ</text>
        <text x="144" y="110" className="fill-text-primary font-bengali" fontSize="11" fontWeight="700">আপনি</text>
        <text x="144" y="123" className="fill-text-primary font-bengali" fontSize="8.5" opacity="0.55">নতুন দক্ষতা পোস্ট</text>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={264 + i * 5} cy="112" r="1.6" className="fill-text-primary" opacity="0.4" />
        ))}

        <image
          href="/media/kantha-closeup.webp"
          x="120"
          y="132"
          width="156"
          height="88"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#media-reel-photo)"
        />

        <text x="120" y="240" className="fill-text-primary font-bengali" fontSize="13" fontWeight="700">নকশিকাঁথা সেলাই</text>

        {/* Where the hire button will land: a quiet placeholder until then. */}
        <rect x="120" y="276" width="156" height="30" rx="15" className="fill-text-primary" opacity="0.07" />
        <text x="198" y="295" textAnchor="middle" className="fill-text-primary font-bengali" fontSize="9.5" opacity="0.45">যাচাইয়ের অপেক্ষায়</text>
      </g>

      {/* ০২ — the self-rating, star by star. */}
      {[0, 1, 2, 3, 4].map((i) => (
        <polygon
          key={i}
          points={star(127 + i * 15, 256, 6.5)}
          className={i < 4 ? "mr mr-at1 fill-signal-orange" : "mr mr-at1 fill-none stroke-signal-orange"}
          strokeWidth="1.4"
          style={d(i * 160)}
        />
      ))}
      <text x="208" y="259.5" className="mr mr-at1 fill-text-primary font-bengali" fontSize="9" opacity="0.6" style={d(800)}>
        নিজের রেটিং
      </text>

      {/* ০৩ — the community verifies: three faces, then the badge. */}
      {["fill-signal-orange", "fill-bdnavy-500", "fill-bdgreen-500"].map((fill, i) => (
        <circle key={fill} cx={246 + i * 12} cy="210" r="9" className={`mr mr-at2 ${fill} stroke-white`} strokeWidth="2" style={d(i * 140)} />
      ))}
      <g className="mr mr-at2" style={d(520)}>
        <rect x="126" y="138" width="74" height="19" rx="9.5" className="fill-bd-green" />
        <text x="163" y="151" textAnchor="middle" className="fill-white font-bengali" fontSize="9" fontWeight="700">✓ যাচাইকৃত</text>
      </g>

      {/* ০৪ — the hire: the button, a tap, the stamp. */}
      <g className="mr mr-at3">
        <rect x="120" y="276" width="156" height="30" rx="15" className="fill-signal-orange" />
        <text x="198" y="295.5" textAnchor="middle" className="fill-text-primary font-bengali" fontSize="12" fontWeight="800">কাজে নিন</text>
      </g>
      <circle cx="236" cy="292" r="12" className="mr mr-click fill-none stroke-white" strokeWidth="2" />
      <g transform="translate(234 290)">
        <path d="M0 0 L0 18 L5 13.5 L8.5 21 L12 19.5 L8.5 12 L15 12 Z" className="mr mr-cursor fill-white stroke-text-primary" strokeWidth="1.5" strokeLinejoin="round" />
      </g>
      <g transform="rotate(-12 198 176)">
        <g className="mr mr-stamp">
          <rect x="140" y="158" width="116" height="36" rx="7" className="fill-white stroke-bd-green" strokeWidth="3" opacity="0.95" />
          <text x="198" y="182" textAnchor="middle" className="fill-bd-green font-bengali" fontSize="15" fontWeight="800">নিয়োগ হয়েছে ✓</text>
        </g>
      </g>

      {/* The player: chapter captions over a ten-second bar cut in four. */}
      <g className="font-bengali" fontSize="13" fontWeight="700">
        {CHAPTERS.map(([n, label], i) => (
          <text key={n} x="24" y="354" className="mr mr-chapter fill-white" style={d(i * 2500)}>
            <tspan className="fill-signal-orange">{n}</tspan>
            <tspan dx="8">{label}</tspan>
          </text>
        ))}
        <text x="24" y="354" className="mr-still fill-white">
          পোস্ট → রেটিং → যাচাই → <tspan className="fill-signal-orange">কাজ</tspan>
        </text>
      </g>
      <rect x="24" y="366" width="368" height="3" rx="1.5" className="fill-white/20" />
      <rect x="24" y="366" width="368" height="3" rx="1.5" className="mr-progress fill-signal-orange" />
      {[1, 2, 3].map((i) => (
        <rect key={i} x={24 + i * 92 - 3} y="364" width="6" height="7" className="fill-text-primary" />
      ))}
    </svg>
  );
}
