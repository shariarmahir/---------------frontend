"use client";

import { Line, OrbitControls, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { moduleLinks } from "@/data/gori/modules";
import { pillarOf } from "@/data/gori/mission";
import { PIXEL_MASK } from "@/data/gori/pixel-mask";
import type { MissionState } from "@/lib/gori/mission/engine";
import { PILLAR_COLOR, PILLAR_SHAPE, pawnOffset, PLAYER_COLOR, pixelToBoard, PIXEL_SIZE, PRESSURE_COLOR, SPOTS } from "@/lib/gori/mission/layout";
import { assignPixels } from "@/lib/gori/pixel-map";
import type { BoardProps } from "./board-types";

/**
 * The mission board in 3D (React Three Fiber). Loaded only on capable
 * devices and on request (CLAUDE.md §6); the 2D board is the same game.
 *
 * Bangladesh is 1,304 voxels, each owned by one of the 32 modules and
 * scattered nationwide; a voxel's colour is its module's pressure, so the
 * map reads as national health at a glance. The modules float in a ring,
 * and the dependency links arch over the country.
 */

const pixels = assignPixels(PIXEL_MASK);
const bnDigits = (v: number | string) => String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

const RAMP = ["#1f6f52", "#9c8a2c", "#c8581c", "#da291c"].map((c) => new THREE.Color(c));
const RESTORED = new THREE.Color("#46d39a");
const at3 = (n: number, lift = 0) => new THREE.Vector3(SPOTS[n].x, SPOTS[n].h + lift, SPOTS[n].y);

/** Labels wait for the Bangla web font, so their cached textures never bake in a fallback. */
const FontsReady = createContext(false);

export default function Board3D(props: BoardProps) {
  const { state, reduce } = props;
  const [fonts, setFonts] = useState(false);
  useEffect(() => {
    let alive = true;
    void document.fonts.ready.then(() => alive && setFonts(true));
    return () => {
      alive = false;
    };
  }, []);
  return (
    <FontsReady.Provider value={fonts}>
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 15, 13], fov: 42 }} gl={{ antialias: true, powerPreference: "high-performance" }} onPointerMissed={() => props.onHover(null)} aria-hidden>
        <color attach="background" args={["#03201a"]} />
        <fog attach="fog" args={["#03201a", 20, 38]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#cfeee0", "#062d25", 0.6]} />
        <directionalLight position={[6, 12, 8]} intensity={1.4} />
        <Ground />
        <VoxelMap state={state} focus={props.focus ?? props.selected} reduce={reduce} />
        <Links {...props} />
        {SPOTS.slice(1).map((s) => (
          <NodeOrb key={s.n} n={s.n} {...props} />
        ))}
        <Pawns state={state} reduce={reduce} />
        <Shockwaves pulses={props.pulses} reduce={reduce} />
        <FitCamera />
        {!reduce && <Sparkles count={60} scale={[18, 4, 16]} position={[0, 2, 0]} size={2} speed={0.25} opacity={0.35} color="#9fe3c6" />}
        <OrbitControls makeDefault enablePan={false} minDistance={9} maxDistance={30} maxPolarAngle={1.2} minPolarAngle={0.25} enableDamping />
      </Canvas>
    </FontsReady.Provider>
  );
}

/** Keep the whole ring in view on narrow and wide boards alike. */
function FitCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(1, size.height);
    camera.position.setLength(17.5 * Math.max(1, 1.35 / aspect));
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height]);
  return null;
}

function Ground() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02}>
        <circleGeometry args={[11, 64]} />
        <meshStandardMaterial color="#052a21" roughness={1} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0}>
        <ringGeometry args={[8.9, 9.0, 96]} />
        <meshBasicMaterial color="#2c6b56" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */

function VoxelMap({ state, focus, reduce }: { state: MissionState; focus: number | null | undefined; reduce: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const heights = useRef(new Float32Array(pixels.length).fill(0.1));
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const settled = useRef(false);

  const targetOf = (i: number) => {
    const p = pixels[i];
    const n = p.module + 1;
    const restored = state.reforms[pillarOf(n)] === "restored";
    let h = 0.1 + p.noise * 0.06 + state.pressure[n] * 0.05 + (restored ? 0.14 : 0);
    if (focus === n) h += 0.32;
    return h;
  };

  // Colours follow pressure; recomputed only when the board changes.
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const c = new THREE.Color();
    pixels.forEach((p, i) => {
      const n = p.module + 1;
      if (state.reforms[pillarOf(n)] === "restored") c.copy(RESTORED);
      else c.copy(RAMP[state.pressure[n]]);
      c.offsetHSL(0, 0, (p.noise - 0.5) * 0.08);
      if (focus === n) c.lerp(new THREE.Color("#ffffff"), 0.25);
      mesh.setColorAt(i, c);
    });
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    settled.current = false;
  }, [state.pressure, state.reforms, focus]);

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh || settled.current) return;
    let moving = false;
    const k = reduce ? 1 : Math.min(1, dt * 9);
    pixels.forEach((p, i) => {
      const t = targetOf(i);
      const h = heights.current[i] + (t - heights.current[i]) * k;
      if (Math.abs(t - h) > 0.002) moving = true;
      heights.current[i] = h;
      const { x, y } = pixelToBoard(p.x, p.y);
      dummy.position.set(x, h / 2, y);
      dummy.scale.set(1, h / 0.1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (!moving) settled.current = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, pixels.length]}>
      <boxGeometry args={[PIXEL_SIZE * 0.86, 0.1, PIXEL_SIZE * 0.86]} />
      <meshStandardMaterial roughness={0.55} metalness={0.05} />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ */

const LINKS = moduleLinks.map((l) => {
  const a = Number(l.from.slice(3));
  const b = Number(l.to.slice(3));
  const p0 = at3(a);
  const p2 = at3(b);
  const mid = p0.clone().add(p2).multiplyScalar(0.5);
  mid.multiplyScalar(0.55);
  mid.y = Math.max(p0.y, p2.y) + 1 + p0.distanceTo(p2) * 0.14;
  const curve = new THREE.QuadraticBezierCurve3(p0, mid, p2);
  return {
    a,
    b,
    assumption: l.basis === "assumption",
    curve,
    points: curve.getPoints(28),
  };
});

function Links({ state, focus, selected, highlight, reduce }: BoardProps) {
  const f = focus ?? selected ?? null;
  const chain = new Set(highlight?.collapsed ?? []);
  return (
    <group>
      {LINKS.map((l, i) => {
        const hot = chain.has(l.a);
        const up = f !== null && l.b === f;
        const down = f !== null && l.a === f;
        const quiet = (f !== null || chain.size > 0) && !hot && !up && !down;
        const color = hot ? "#ff5a4a" : up ? "#ffb454" : down ? "#6ee7b7" : "#a8dcc6";
        const pressured = state.pressure[l.a] >= 2;
        return (
          <group key={i}>
            <Line
              points={l.points}
              color={color}
              lineWidth={hot || up || down ? 2.4 : 1.1}
              transparent
              opacity={quiet ? 0.05 : hot || up || down ? 0.95 : pressured ? 0.32 : 0.16}
              dashed={l.assumption}
              dashSize={0.25}
              gapSize={0.18}
            />
            {!reduce && (hot || down || (f === null && !chain.size && state.pressure[l.a] === 3)) && (
              <FlowDot curve={l.curve} offset={(i * 0.37) % 1} color={hot || state.pressure[l.a] === 3 ? "#ff5a4a" : color} />
            )}
          </group>
        );
      })}
    </group>
  );
}

/** A spark travelling along a link in its causal direction. */
function FlowDot({ curve, color, offset }: { curve: THREE.QuadraticBezierCurve3; color: string; offset: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(offset);
  useFrame((_, dt) => {
    t.current = (t.current + dt * 0.45) % 1;
    ref.current?.position.copy(curve.getPoint(t.current));
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.07, 10, 10]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */

function OrbGeometry({ shape }: { shape: (typeof PILLAR_SHAPE)[keyof typeof PILLAR_SHAPE] }) {
  switch (shape) {
    case "sphere":
      return <sphereGeometry args={[0.34, 28, 28]} />;
    case "box":
      return <boxGeometry args={[0.5, 0.5, 0.5]} />;
    case "octa":
      return <octahedronGeometry args={[0.42]} />;
    case "cone":
      return <coneGeometry args={[0.36, 0.62, 24]} />;
  }
}

function NodeOrb({ n, state, selected, focus, highlight, onSelect, onHover, reduce, current }: BoardProps & { n: number }) {
  const spot = SPOTS[n];
  const pillar = pillarOf(n);
  const reform = state.reforms[pillar];
  const p = state.pressure[n];
  const hub = state.hubs.includes(n);
  const on = selected === n || focus === n;
  const inChain = highlight?.collapsed.includes(n);
  const isHit = highlight?.hit.includes(n);
  const here = state.players[current]?.at === n;
  const orb = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (orb.current && !reduce) {
      orb.current.rotation.y = t * 0.4 + n;
      orb.current.position.y = Math.sin(t * 1.3 + n) * 0.05;
    }
    if (halo.current) {
      const s = 1 + (reduce ? 0.1 : Math.sin(t * 5) * 0.12 + 0.1);
      halo.current.scale.setScalar(s);
    }
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    onHover(n);
  };
  const out = () => {
    document.body.style.cursor = "";
    onHover(null);
  };
  useEffect(() => () => void (document.body.style.cursor = ""), []);

  const color = PILLAR_COLOR[pillar];
  return (
    <group position={[spot.x, spot.h, spot.y]}>
      {/* Stem to the ground. */}
      <mesh position-y={-spot.h / 2}>
        <cylinderGeometry args={[0.02, 0.02, spot.h, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
      <mesh position-y={-spot.h + 0.01} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.28, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
      </mesh>
      {hub && (
        <mesh position-y={-0.42}>
          <cylinderGeometry args={[0.55, 0.6, 0.08, 6]} />
          <meshStandardMaterial color="#ffb454" emissive="#e4b027" emissiveIntensity={0.7} />
        </mesh>
      )}
      <mesh ref={orb} onClick={(e) => (e.stopPropagation(), onSelect(n))} onPointerOver={over} onPointerOut={out}>
        <OrbGeometry shape={PILLAR_SHAPE[pillar]} />
        <meshStandardMaterial
          color={reform === "restored" ? "#bff5dc" : color}
          emissive={inChain ? PRESSURE_COLOR : color}
          emissiveIntensity={inChain ? 1.2 : on ? 0.9 : reform !== "open" ? 0.7 : 0.25}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>
      {(p === 3 || inChain) && (
        <mesh ref={halo} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.62, 0.035, 8, 40]} />
          <meshBasicMaterial color={PRESSURE_COLOR} transparent opacity={0.85} />
        </mesh>
      )}
      {isHit && !inChain && (
        <mesh rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.55, 0.025, 8, 40]} />
          <meshBasicMaterial color="#ffb454" />
        </mesh>
      )}
      {on && (
        <mesh rotation-x={Math.PI / 2} position-y={-0.1}>
          <torusGeometry args={[0.72, 0.03, 8, 48]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
      {Array.from({ length: p }, (_, k) => (
        <PressureCube key={k} k={k} reduce={reduce} />
      ))}
      <Label text={bnDigits(String(n).padStart(2, "0"))} bg={on ? "#ffffff" : here ? "#e4b027" : "rgba(0,0,0,0.62)"} fg={on || here ? "#17211d" : "#ffffff"} y={0.8} height={0.4} />
    </group>
  );
}

function PressureCube({ k, reduce }: { k: number; reduce: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const a = (k / 3) * Math.PI * 2;
  const target = new THREE.Vector3(Math.cos(a) * 0.42, 0.42, Math.sin(a) * 0.42);
  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    if (reduce) {
      m.position.copy(target);
      return;
    }
    m.position.lerp(target, 0.12);
    m.rotation.y = clock.elapsedTime * 1.5 + k;
  });
  return (
    <mesh ref={ref} position={[target.x, target.y + 1.6, target.z]}>
      <boxGeometry args={[0.16, 0.16, 0.16]} />
      <meshStandardMaterial color={PRESSURE_COLOR} emissive={PRESSURE_COLOR} emissiveIntensity={0.55} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */

function Pawns({ state, reduce }: { state: MissionState; reduce: boolean }) {
  return (
    <group>
      {state.players.map((p, i) => {
        const here = state.players.map((q, j) => ({ q, j })).filter(({ q }) => q.at === p.at);
        const off = pawnOffset(
          here.findIndex((x) => x.j === i),
          here.length,
        );
        const target = at3(p.at, 0.05);
        target.x += off.x;
        target.z += off.y;
        return <Pawn key={i} i={i} target={target} active={state.current === i && !state.outcome} reduce={reduce} name={p.name} />;
      })}
    </group>
  );
}

function Pawn({ i, target, active, reduce, name }: { i: number; target: THREE.Vector3; active: boolean; reduce: boolean; name: string }) {
  const ref = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const from = useRef(target.clone());
  const t = useRef(1);
  const last = useRef(target.clone());

  useFrame(({ clock }, dt) => {
    const g = ref.current;
    if (!g) return;
    if (!last.current.equals(target)) {
      from.current.copy(g.position);
      last.current.copy(target);
      t.current = 0;
    }
    if (reduce) {
      g.position.copy(target);
    } else if (t.current < 1) {
      t.current = Math.min(1, t.current + dt * 1.6);
      const e = 1 - (1 - t.current) ** 3;
      g.position.lerpVectors(from.current, target, e);
      g.position.y += Math.sin(t.current * Math.PI) * Math.min(2.4, from.current.distanceTo(target) * 0.35);
    } else {
      g.position.copy(target);
      if (active) g.position.y += Math.abs(Math.sin(clock.elapsedTime * 3)) * 0.08;
    }
    if (ring.current) ring.current.rotation.z = clock.elapsedTime * 2;
  });

  const color = PLAYER_COLOR[i];
  return (
    <group ref={ref} position={target}>
      <mesh position-y={0.2}>
        <capsuleGeometry args={[0.1, 0.2, 6, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.5 : 0.15} />
      </mesh>
      <mesh position-y={0.46}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 0.5 : 0.15} />
      </mesh>
      {active && (
        <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.02}>
          <ringGeometry args={[0.18, 0.24, 24, 1, 0, Math.PI * 1.5]} />
          <meshBasicMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
      )}
      <Label text={active ? `${bnDigits(i + 1)} ${name}` : bnDigits(i + 1)} bg={color} fg="#17211d" y={0.86} height={0.32} round />
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Labels: text drawn by the browser into a canvas texture, so Bangla
 * shapes correctly and nothing lives in the DOM (drei's <Html> portals
 * break on unmount under React 19).
 * ------------------------------------------------------------------ */

const labels = new Map<string, THREE.CanvasTexture>();
let fontFamily: string | null = null;

function bengaliFont(): string {
  if (fontFamily) return fontFamily;
  const probe = document.createElement("span");
  probe.className = "font-bengali";
  document.body.appendChild(probe);
  fontFamily = getComputedStyle(probe).fontFamily || "sans-serif";
  probe.remove();
  return fontFamily;
}

function labelTexture(text: string, bg: string, fg: string, round: boolean): THREE.CanvasTexture {
  const key = `${text}|${bg}|${fg}|${round}`;
  const hit = labels.get(key);
  if (hit) return hit;
  const H = 64;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  const font = `700 40px ${bengaliFont()}`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 30;
  c.width = w;
  c.height = H;
  ctx.font = font;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, H, round ? H / 2 : 14);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, H / 2 + 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  labels.set(key, tex);
  return tex;
}

function Label({ text, bg, fg, y, height, round = false }: { text: string; bg: string; fg: string; y: number; height: number; round?: boolean }) {
  const ready = useContext(FontsReady);
  const tex = useMemo(() => (ready ? labelTexture(text, bg, fg, round) : null), [ready, text, bg, fg, round]);
  if (!tex) return null;
  const aspect = tex.image.width / tex.image.height;
  return (
    <sprite position={[0, y, 0]} scale={[height * aspect, height, 1]} renderOrder={10}>
      <spriteMaterial map={tex} depthTest={false} transparent />
    </sprite>
  );
}

/* ------------------------------------------------------------------ */

function Shockwaves({ pulses, reduce }: { pulses: BoardProps["pulses"]; reduce: boolean }) {
  if (reduce) return null;
  return (
    <group>
      {pulses.map((p) => (
        <Shock key={p.key} n={p.n} kind={p.kind} />
      ))}
    </group>
  );
}

function Shock({ n, kind }: { n: number; kind: "collapse" | "treat" | "reform" }) {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current = Math.min(1, t.current + dt / (kind === "reform" ? 1.6 : 1.1));
    const s = 0.4 + t.current * (kind === "collapse" ? 3.2 : kind === "reform" ? 8 : 1.6);
    ref.current?.scale.setScalar(s);
    if (mat.current) mat.current.opacity = (1 - t.current) * 0.9;
  });
  const color = kind === "collapse" ? PRESSURE_COLOR : kind === "reform" ? "#ffd166" : "#6ee7b7";
  return (
    <mesh ref={ref} position={kind === "reform" ? [0, 0.3, 0] : at3(n)} rotation-x={Math.PI / 2}>
      <torusGeometry args={[1, 0.04, 8, 64]} />
      <meshBasicMaterial ref={mat} color={color} transparent opacity={0.9} />
    </mesh>
  );
}
