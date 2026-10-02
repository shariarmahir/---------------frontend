/*
 * The Classroom banner's four scenes, drawn in the brand's own colours: ink
 * (text-primary) and bottle green for the figures and props, white paper,
 * gold only where the card itself is gold. The students are faceless
 * busts told apart by what they wear — the way the Kandari fist poster is
 * drawn — so nobody is cast as one look. Every element animates through
 * the .cb-* classes in globals.css (transform and opacity only).
 */
import type { CSSProperties, ReactNode } from "react";

/** Animation delay in ms, read by the .cb-* classes. */
const d = (ms: number, extra: Record<string, string | number> = {}) => ({ "--d": ms, ...extra }) as CSSProperties;

export type Student = "ponytail" | "glasses" | "hijab" | "cap";

/** A student from the chest up; (0, 0) is the centre of the bottom edge, so it sits on a desk line. */
function Bust({ kind, x, y, scale = 1, delay = 0, rise = true }: { kind: Student; x: number; y: number; scale?: number; delay?: number; rise?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className={rise ? "cb-rise" : undefined} style={d(delay)}>
        {kind === "ponytail" && (
          <>
            <path d="M12 -78 C44 -86 52 -52 30 -34 C38 -56 28 -66 14 -64 Z" className="fill-text-primary" />
            <path d="M-46 0 C-46 -24 -26 -34 0 -34 C26 -34 46 -24 46 0 Z" className="fill-bd-green" />
            <path d="M-12 -34 L0 -20 L12 -34 Z" className="fill-white" />
            <rect x="-6" y="-48" width="12" height="16" rx="5" className="fill-text-primary" />
            <circle cx="0" cy="-64" r="19" className="fill-text-primary" />
            <path d="M-19 -66 C-16 -84 16 -88 19 -66 C10 -74 -10 -74 -19 -66 Z" className="fill-bd-green" />
          </>
        )}
        {kind === "glasses" && (
          <>
            <path d="M-46 0 C-46 -24 -26 -34 0 -34 C26 -34 46 -24 46 0 Z" className="fill-white" />
            <path d="M-12 -34 L0 -16 L12 -34" className="fill-none stroke-text-primary" strokeWidth="3" strokeLinejoin="round" />
            <rect x="-6" y="-48" width="12" height="16" rx="5" className="fill-text-primary" />
            <circle cx="0" cy="-64" r="19" className="fill-text-primary" />
            <g className="fill-none stroke-white" strokeWidth="2.4">
              <circle cx="-8" cy="-64" r="6.5" />
              <circle cx="8" cy="-64" r="6.5" />
              <path d="M-1.5 -64 H1.5" />
            </g>
          </>
        )}
        {kind === "hijab" && (
          <>
            <path d="M-46 0 C-46 -24 -26 -34 0 -34 C26 -34 46 -24 46 0 Z" className="fill-text-primary" />
            <path d="M-30 -2 C-30 -30 -26 -50 0 -50 C26 -50 30 -30 30 -2 C16 -16 -16 -16 -30 -2 Z" className="fill-bd-green" />
            <circle cx="0" cy="-62" r="25" className="fill-bd-green" />
            <circle cx="0" cy="-60" r="15" className="fill-text-primary" />
          </>
        )}
        {kind === "cap" && (
          <>
            <path d="M-46 0 C-46 -24 -26 -34 0 -34 C26 -34 46 -24 46 0 Z" className="fill-white" />
            <path d="M-40 -14 C-20 -22 20 -22 40 -14 L42 -8 C20 -16 -20 -16 -42 -8 Z" className="fill-bd-green" />
            <rect x="-6" y="-48" width="12" height="16" rx="5" className="fill-text-primary" />
            <circle cx="0" cy="-64" r="19" className="fill-text-primary" />
            <path d="M-20 -66 C-18 -88 18 -88 20 -66 Z" className="fill-bd-green" />
            <path d="M6 -68 H30 C30 -62 22 -60 6 -62 Z" className="fill-bd-green" />
          </>
        )}
      </g>
    </g>
  );
}

/** A four-point spark, the AI helper's mark. */
function Spark({ x, y, r, className, delay, pulse }: { x: number; y: number; r: number; className: string; delay: number; pulse?: boolean }) {
  const k = r * 0.28;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className={`cb-pop ${pulse ? "cb-pulse" : ""} ${className}`} style={d(delay)} d={`M0 ${-r} C${k} ${-k} ${k} ${-k} ${r} 0 C${k} ${k} ${k} ${k} 0 ${r} C${-k} ${k} ${-k} ${k} ${-r} 0 C${-k} ${-k} ${-k} ${-k} 0 ${-r} Z`} />
    </g>
  );
}

const Desk = () => <rect x="36" y="232" width="288" height="14" rx="7" className="fill-text-primary" />;

/** 1 · Stuck on a question, alone at a desk. */
function SceneStuck() {
  return (
    <g>
      <Desk />
      <Bust kind="glasses" x={158} y={236} scale={1.5} delay={80} />
      <g className="cb-rise" style={d(250)}>
        <rect x="96" y="204" width="124" height="32" rx="6" className="fill-white" />
        <path d="M158 204 V236" className="stroke-text-primary" strokeWidth="2.4" />
        <g className="stroke-text-primary/35" strokeWidth="2.6" strokeLinecap="round">
          <path d="M108 214 H146" /><path d="M108 223 H138" /><path d="M170 214 H208" /><path d="M170 223 H200" />
        </g>
      </g>
      <circle cx="206" cy="124" r="5" className="cb-pop fill-white" style={d(700)} />
      <circle cx="222" cy="104" r="8" className="cb-pop fill-white" style={d(840)} />
      <g className="cb-pop" style={d(1000)}>
        <ellipse cx="268" cy="66" rx="56" ry="40" className="fill-white" />
        <text x="268" y="85" textAnchor="middle" className="cb-pulse fill-text-primary font-bold" style={d(1700)} fontSize="56">?</text>
      </g>
      <text x="44" y="120" className="cb-float fill-text-primary/80 font-bold" style={d(0)} fontSize="32">?</text>
      <text x="326" y="176" textAnchor="middle" className="cb-float fill-text-primary/80 font-bold" style={d(600)} fontSize="24">?</text>
      <text x="62" y="190" className="cb-float fill-bd-green font-bold" style={d(1100)} fontSize="22">?</text>
    </g>
  );
}

const CODE = ["S", "S", "C", "2", "7", "N"];

/** 2 · A class code opens the door; classmates are already inside. */
function SceneJoin() {
  return (
    <g>
      <g className="cb-rise" style={d(60)}>
        <rect x="62" y="40" width="236" height="144" rx="22" className="fill-white" />
        <text x="82" y="70" className="fill-text-primary font-bold" fontSize="15">ক্লাস কোড</text>
        {CODE.map((c, i) => (
          <g key={i}>
            <rect x={80 + i * 34} y="84" width="30" height="42" rx="9" className="fill-text-primary/10" />
            <text x={95 + i * 34} y="114" textAnchor="middle" className="cb-pop fill-text-primary font-bold" style={d(500 + i * 170)} fontSize="26">{c}</text>
          </g>
        ))}
        <g className="cb-pop" style={d(1700)}>
          <rect x="80" y="140" width="200" height="30" rx="15" className="fill-bd-green" />
          <text x="180" y="161" textAnchor="middle" className="fill-white font-bold" fontSize="15">যোগ দিন</text>
        </g>
      </g>
      <g className="cb-pop" style={d(2150)}>
        <circle cx="298" cy="40" r="25" className="fill-bd-green stroke-signal-orange" strokeWidth="5" />
        <path pathLength={1} d="M286 40 L295 49 L311 31" className="cb-draw fill-none stroke-white" style={d(2350)} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <Bust kind="ponytail" x={62} y={304} scale={0.66} delay={2300} />
      <Bust kind="cap" x={142} y={304} scale={0.66} delay={2450} />
      <Bust kind="hijab" x={222} y={304} scale={0.66} delay={2600} />
      <Bust kind="glasses" x={302} y={304} scale={0.66} delay={2750} />
    </g>
  );
}

/** 3 · Together at the discussion board, chat and AI helper beside them. */
function SceneTogether() {
  return (
    <g>
      <g className="cb-rise" style={d(40)}>
        <rect x="92" y="30" width="176" height="130" rx="16" className="fill-white" />
        <rect x="92" y="30" width="176" height="28" rx="16" className="fill-text-primary" />
        <rect x="92" y="44" width="176" height="14" className="fill-text-primary" />
        <text x="180" y="50" textAnchor="middle" className="fill-white font-bold" fontSize="13">ডিসকাশন রুম</text>
      </g>
      {[
        { x: 106, y: 74, tone: "fill-signal-orange", r: -6, delay: 600 },
        { x: 156, y: 84, tone: "fill-bd-green", r: 4, delay: 900 },
        { x: 206, y: 72, tone: "fill-text-primary", r: -3, delay: 1200 },
      ].map((n, i) => (
        <g key={i} className="cb-drop" style={d(n.delay)}>
          <g transform={`rotate(${n.r} ${n.x + 27} ${n.y + 27})`}>
            <rect x={n.x} y={n.y} width="54" height="56" rx="7" className={n.tone} />
            <g className="stroke-white" strokeWidth="2.6" strokeLinecap="round" opacity="0.9">
              <path d={`M${n.x + 10} ${n.y + 22} H${n.x + 44}`} /><path d={`M${n.x + 10} ${n.y + 32} H${n.x + 36}`} /><path d={`M${n.x + 10} ${n.y + 42} H${n.x + 40}`} />
            </g>
            <circle cx={n.x + 27} cy={n.y + 7} r="4.5" className="fill-white" />
          </g>
        </g>
      ))}
      <g className="cb-slide" style={d(1500, { "--dx": "-34px" })}>
        <rect x="14" y="132" width="96" height="40" rx="16" className="fill-text-primary" />
        <path d="M30 172 L24 184 L46 172 Z" className="fill-text-primary" />
        <g className="stroke-white" strokeWidth="3" strokeLinecap="round"><path d="M30 146 H92" /><path d="M30 158 H70" /></g>
      </g>
      <g className="cb-slide" style={d(1900, { "--dx": "34px" })}>
        <rect x="252" y="112" width="96" height="40" rx="16" className="fill-white" />
        <path d="M330 152 L338 164 L316 152 Z" className="fill-white" />
        <g className="stroke-text-primary" strokeWidth="3" strokeLinecap="round"><path d="M268 126 H330" /><path d="M268 138 H312" /></g>
      </g>
      <Spark x={296} y={52} r={19} className="fill-bd-green" delay={1050} pulse />
      <Spark x={322} y={84} r={8} className="fill-text-primary" delay={1250} />
      <Spark x={272} y={86} r={6} className="fill-white" delay={1400} />
      <Bust kind="ponytail" x={86} y={306} scale={0.98} delay={120} />
      <Bust kind="hijab" x={180} y={306} scale={0.98} delay={260} />
      <Bust kind="cap" x={274} y={306} scale={0.98} delay={400} />
    </g>
  );
}

const CONFETTI = [
  { x: 40, tone: "fill-text-primary", delay: 200 }, { x: 78, tone: "fill-bd-green", delay: 900 }, { x: 118, tone: "fill-white", delay: 500 },
  { x: 160, tone: "fill-text-primary", delay: 1400 }, { x: 204, tone: "fill-bd-green", delay: 300 }, { x: 244, tone: "fill-white", delay: 1100 },
  { x: 286, tone: "fill-text-primary", delay: 700 }, { x: 322, tone: "fill-bd-green", delay: 1600 },
];

/** 4 · The team's work goes on the feed, with a certificate for it. */
function SceneShow() {
  return (
    <g>
      <g className="cb-rise" style={d(60)}>
        <rect x="104" y="20" width="160" height="196" rx="24" className="fill-white" />
        <circle cx="130" cy="52" r="10" className="fill-text-primary" />
        <rect x="148" y="43" width="62" height="7" rx="3.5" className="fill-text-primary" />
        <rect x="148" y="55" width="40" height="6" rx="3" className="fill-text-primary/30" />
        <rect x="120" y="76" width="128" height="86" rx="12" className="fill-bd-green" />
        <circle cx="146" cy="104" r="11" className="fill-signal-orange" />
        <g className="fill-white"><rect x="170" y="126" width="14" height="24" rx="3" /><rect x="190" y="110" width="14" height="40" rx="3" /><rect x="210" y="94" width="14" height="56" rx="3" /></g>
        <rect x="120" y="176" width="40" height="8" rx="4" className="fill-text-primary/25" />
        <rect x="120" y="190" width="70" height="8" rx="4" className="fill-text-primary/15" />
      </g>
      <path className="cb-pop cb-pulse fill-signal-orange" style={d(1700)} d="M232 190 C232 180 222 176 217 183 C212 176 202 180 202 190 C202 200 217 208 217 208 C217 208 232 200 232 190 Z" />
      <g className="cb-slide" style={d(900, { "--dx": "-36px" })}>
        <rect x="14" y="100" width="104" height="32" rx="16" className="fill-text-primary" />
        <text x="66" y="121" textAnchor="middle" className="fill-white font-bold" fontSize="14">দলের নামে</text>
      </g>
      <g className="cb-drop" style={d(2100)}>
        <path d="M282 174 L270 214 L284 206 L292 220 L300 176 Z" className="fill-text-primary" />
        <circle cx="290" cy="164" r="28" className="fill-bd-green stroke-white" strokeWidth="4" />
        <path d="M290 150 L294.5 159 L304.5 160.5 L297 167.5 L299 177.5 L290 172.5 L281 177.5 L283 167.5 L275.5 160.5 L285.5 159 Z" className="fill-white" />
      </g>
      <Bust kind="glasses" x={46} y={308} scale={0.78} delay={300} />
      <Bust kind="ponytail" x={316} y={308} scale={0.78} delay={450} />
      <g className="motion-reduce:hidden" aria-hidden>
        {CONFETTI.map((c, i) => (
          <rect key={i} x={c.x} y="8" width="9" height="13" rx="2" className={`cb-fall ${c.tone}`} style={d(c.delay + 2000)} />
        ))}
      </g>
    </g>
  );
}

const SCENE_ART: Record<number, () => ReactNode> = { 0: SceneStuck, 1: SceneJoin, 2: SceneTogether, 3: SceneShow };

/** The art panel: a soft ink disc behind the scene, which is re-mounted per scene so its motion plays again. */
export function ClassroomArt({ scene }: { scene: number }) {
  const Scene = SCENE_ART[scene] ?? SceneStuck;
  return (
    <svg viewBox="0 0 360 310" role="img" aria-hidden className="block h-auto w-full overflow-visible">
      <circle cx="180" cy="160" r="138" className="fill-text-primary/10" />
      <g key={scene}><Scene /></g>
    </svg>
  );
}
