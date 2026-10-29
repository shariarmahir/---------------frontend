import type { CSSProperties } from "react";

export type ServiceSceneKind = "brain" | "factory" | "robot" | "interface";

/** The scenes' palette: the brand's gold and light blue with a few bright notes, so each picture reads at a glance. */
const C = {
  gold: "#e4b027",
  blue: "#8fa1e3",
  white: "#ffffff",
  pink: "#f28ba8",
  teal: "#2ca58d",
  red: "#ef3e4a",
};

/** Delay, in seconds, as a CSS variable. */
const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/**
 * The service cards' pictures (Mahir, 2026-10-29): a small motion graphic
 * for each service, drawn in SVG and swaying slowly in 3D (CSS perspective):
 * the AI's brain with signals running its pathways, the factory, home and
 * office running themselves, the robot on its circuit board sending out its
 * signal, and an app's interface building itself under a clicking cursor.
 * Composited animation only (globals.css, .svc3d); they pause with the card
 * off screen and stand still under reduced motion. Decorative: the card's
 * words say what each is.
 */
export function ServiceScene({ kind }: { kind: ServiceSceneKind }) {
  return (
    <div aria-hidden className="svc3d absolute inset-0 grid place-items-center">
      <div className="svc3d-stage w-[82%]">
        <svg viewBox="0 0 200 200" className="block w-full overflow-visible" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {kind === "brain" && <Brain />}
          {kind === "factory" && <Factory />}
          {kind === "robot" && <Robot />}
          {kind === "interface" && <Interface />}
        </svg>
      </div>
    </div>
  );
}

/** Two hemispheres, their folds, and a network of nodes with signals travelling between them. */
function Brain() {
  const paths = [
    "M62 92 C78 70 96 112 112 88 S140 74 146 98",
    "M58 118 C80 104 92 136 116 118 S138 112 148 126",
    "M76 70 C88 90 100 64 118 76",
    "M100 52 L100 150",
  ];
  const nodes: [number, number, string, number][] = [
    [62, 92, C.gold, 0],
    [112, 88, C.blue, 0.4],
    [146, 98, C.pink, 0.8],
    [58, 118, C.teal, 1.2],
    [116, 118, C.gold, 0.6],
    [148, 126, C.blue, 1],
    [76, 70, C.white, 0.2],
    [118, 76, C.pink, 1.4],
  ];
  return (
    <>
      <circle className="svc3d-halo" cx="100" cy="100" r="78" stroke={C.pink} strokeOpacity="0.35" strokeWidth="1.5" />
      {/* The hemispheres. */}
      <path
        d="M98 40 C72 30 44 44 42 70 C26 80 26 112 40 124 C40 148 66 166 98 158 Z"
        fill={C.pink}
        fillOpacity="0.16"
        stroke={C.pink}
        strokeWidth="3"
      />
      <path
        d="M102 40 C128 30 156 44 158 70 C174 80 174 112 160 124 C160 148 134 166 102 158 Z"
        fill={C.blue}
        fillOpacity="0.16"
        stroke={C.blue}
        strokeWidth="3"
      />
      {/* The folds. */}
      <g stroke={C.white} strokeOpacity="0.55" strokeWidth="2">
        <path d="M54 66 C64 58 74 70 84 62" />
        <path d="M46 98 C56 90 66 104 78 96" />
        <path d="M58 140 C68 132 78 146 90 138" />
        <path d="M116 62 C126 70 136 58 146 66" />
        <path d="M122 96 C134 104 144 90 154 98" />
        <path d="M110 138 C122 146 132 132 142 140" />
      </g>
      {/* The pathways, each with a signal running along it. */}
      {paths.map((p, i) => (
        <g key={p}>
          <path d={p} stroke={C.gold} strokeOpacity="0.35" strokeWidth="1.5" />
          <path className="svc3d-signal" d={p} pathLength={100} stroke={i % 2 ? C.blue : C.gold} strokeWidth="3" style={d(i * 0.55)} />
        </g>
      ))}
      {nodes.map(([x, y, fill, delay]) => (
        <circle key={`${x}-${y}`} className="svc3d-node" cx={x} cy={y} r="4.5" fill={fill} style={d(delay)} />
      ))}
    </>
  );
}

/** A robot arm working a conveyor, a gear turning, and an office and a home whose windows light up on their own. */
function Factory() {
  return (
    <>
      {/* The floor and the belt. */}
      <path d="M20 150 L100 186 L180 150 L100 114 Z" fill={C.blue} fillOpacity="0.14" stroke={C.blue} strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M44 146 L100 172 L156 146" stroke={C.white} strokeOpacity="0.6" strokeWidth="6" />
      <path className="svc3d-belt" d="M44 146 L100 172 L156 146" pathLength={100} stroke={C.gold} strokeWidth="2" />
      {/* Boxes riding the belt. */}
      {[0, 1.3, 2.6].map((delay) => (
        <g key={delay} className="svc3d-box" style={d(delay)}>
          <path d="M0 -10 L10 -5 L0 0 L-10 -5 Z" fill={C.gold} />
          <path d="M-10 -5 L0 0 L0 10 L-10 5 Z" fill={C.red} />
          <path d="M0 0 L10 -5 L10 5 L0 10 Z" fill="#b8860b" />
        </g>
      ))}
      {/* The arm. */}
      <g className="svc3d-arm">
        <rect x="92" y="96" width="16" height="24" rx="3" fill={C.white} />
        <g className="svc3d-forearm">
          <rect x="97" y="58" width="6" height="42" rx="3" fill={C.gold} />
          <circle cx="100" cy="58" r="6" fill={C.teal} />
          <path d="M94 50 L100 40 L106 50" stroke={C.white} strokeWidth="3" />
        </g>
        <circle cx="100" cy="98" r="7" fill={C.blue} />
      </g>
      {/* The gear. */}
      <g className="svc3d-gear" style={{ transformOrigin: "160px 60px" }}>
        <circle cx="160" cy="60" r="14" stroke={C.gold} strokeWidth="5" strokeDasharray="6 4" />
        <circle cx="160" cy="60" r="5" fill={C.gold} />
      </g>
      {/* The office. */}
      <rect x="22" y="38" width="34" height="56" rx="3" fill={C.blue} fillOpacity="0.2" stroke={C.blue} strokeWidth="2.5" />
      {[0, 1, 2].map((r) =>
        [0, 1].map((c) => (
          <rect key={`o${r}${c}`} className="svc3d-window" x={29 + c * 12} y={46 + r * 14} width="8" height="8" rx="1.5" fill={C.gold} style={d(r * 0.7 + c * 0.35)} />
        )),
      )}
      {/* The home. */}
      <path d="M140 108 L160 92 L180 108" stroke={C.pink} strokeWidth="3" />
      <rect x="144" y="106" width="32" height="24" rx="2" fill={C.pink} fillOpacity="0.2" stroke={C.pink} strokeWidth="2.5" />
      <rect className="svc3d-window" x="152" y="113" width="8" height="8" rx="1.5" fill={C.gold} style={d(0.9)} />
      <rect className="svc3d-window" x="164" y="113" width="8" height="8" rx="1.5" fill={C.white} style={d(1.8)} />
    </>
  );
}

/** A robot standing on a circuit chip, eyes blinking, its antenna sending signal waves while data runs the traces to the sensors. */
function Robot() {
  const traces = ["M100 160 L100 186", "M60 140 L22 140", "M140 140 L178 140", "M70 168 L46 186", "M130 168 L154 186"];
  return (
    <>
      {/* The chip and its pins. */}
      <rect x="56" y="124" width="88" height="48" rx="8" fill={C.teal} fillOpacity="0.2" stroke={C.teal} strokeWidth="2.5" />
      {[66, 82, 98, 114, 130].map((x) => (
        <path key={x} d={`M${x} 124 L${x} 118 M${x} 172 L${x} 178`} stroke={C.teal} strokeWidth="2.5" />
      ))}
      {traces.map((t, i) => (
        <g key={t}>
          <path d={t} stroke={C.white} strokeOpacity="0.3" strokeWidth="2" />
          <path className="svc3d-signal" d={t} pathLength={100} stroke={i % 2 ? C.gold : C.blue} strokeWidth="3" style={d(i * 0.4)} />
        </g>
      ))}
      {[[22, 140], [178, 140], [100, 190], [46, 188], [154, 188]].map(([x, y], i) => (
        <circle key={`${x}-${y}`} className="svc3d-node" cx={x} cy={y} r="4.5" fill={[C.gold, C.blue, C.pink, C.teal, C.gold][i]} style={d(i * 0.3)} />
      ))}
      {/* The robot. */}
      <g className="svc3d-float">
        <rect x="68" y="58" width="64" height="52" rx="14" fill={C.blue} fillOpacity="0.25" stroke={C.blue} strokeWidth="3" />
        <rect x="78" y="70" width="44" height="26" rx="8" fill="#0b1849" />
        <g className="svc3d-blink" style={{ transformOrigin: "100px 83px" }}>
          <circle cx="90" cy="83" r="5" fill={C.gold} />
          <circle cx="110" cy="83" r="5" fill={C.gold} />
        </g>
        <path d="M100 58 L100 42" stroke={C.white} strokeWidth="3" />
        <circle cx="100" cy="38" r="5" fill={C.red} />
        <path d="M60 80 L68 80 M132 80 L140 80" stroke={C.white} strokeWidth="5" />
        <path d="M88 110 L88 124 M112 110 L112 124" stroke={C.white} strokeWidth="4" />
      </g>
      {/* The signal, in waves off the antenna. */}
      {[0, 0.7, 1.4].map((delay) => (
        <circle key={delay} className="svc3d-wave" cx="100" cy="38" r="12" stroke={C.gold} strokeWidth="2.5" style={d(delay)} />
      ))}
    </>
  );
}

/** A browser window whose layout builds itself, a phone in front, and a cursor clicking the button. */
function Interface() {
  return (
    <>
      {/* The browser. */}
      <rect x="18" y="34" width="140" height="104" rx="10" fill={C.blue} fillOpacity="0.16" stroke={C.blue} strokeWidth="2.5" />
      <path d="M18 52 L158 52" stroke={C.blue} strokeWidth="2" />
      {[C.red, C.gold, C.teal].map((fill, i) => (
        <circle key={fill} cx={30 + i * 10} cy="43" r="3" fill={fill} />
      ))}
      {/* The layout, block by block. */}
      <rect className="svc3d-build" x="30" y="62" width="70" height="10" rx="3" fill={C.gold} style={d(0)} />
      <rect className="svc3d-build" x="30" y="78" width="104" height="6" rx="3" fill={C.white} fillOpacity="0.7" style={d(0.3)} />
      <rect className="svc3d-build" x="30" y="90" width="88" height="6" rx="3" fill={C.white} fillOpacity="0.5" style={d(0.6)} />
      <rect className="svc3d-build" x="30" y="104" width="38" height="22" rx="4" fill={C.pink} fillOpacity="0.8" style={d(0.9)} />
      <rect className="svc3d-build svc3d-press" x="76" y="110" width="44" height="14" rx="7" fill={C.gold} style={d(1.2)} />
      {/* The phone. */}
      <g className="svc3d-float">
        <rect x="132" y="72" width="50" height="96" rx="10" fill="#0b1849" stroke={C.white} strokeWidth="2.5" />
        <rect x="140" y="86" width="34" height="22" rx="4" fill={C.teal} />
        <rect x="140" y="114" width="34" height="6" rx="3" fill={C.white} fillOpacity="0.7" />
        <rect x="140" y="126" width="24" height="6" rx="3" fill={C.white} fillOpacity="0.5" />
        <rect x="140" y="142" width="34" height="12" rx="6" fill={C.gold} />
      </g>
      {/* The cursor, travelling to the button and clicking it. */}
      <g className="svc3d-cursor">
        <path d="M0 0 L0 18 L5 13 L9 22 L12 21 L8 12 L15 12 Z" fill={C.white} stroke="#0b1849" strokeWidth="1.5" />
      </g>
    </>
  );
}
