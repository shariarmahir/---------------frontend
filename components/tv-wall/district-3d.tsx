"use client";

import { Line, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { districtShapes } from "@/data/tv-wall/districts-map";
import { ZONE_HEX, type DistrictReading, type MapLayerProps } from "@/lib/tv-wall/geo";
import { cn } from "@/lib/utils";

const GOLD = "#e4b027";
const PING = "#ff6a5c";
const NAVY = "#0b1849";
const EDGE = "#02040c";
const PING_PERIOD = 2.4;
const LIFT = 0.18;
const FOV = 32;
const POLAR = THREE.MathUtils.degToRad(50);
const SWAY = THREE.MathUtils.degToRad(12);
const TARGET: [number, number, number] = [0, 0.5, 0.55];

type Vec3 = [number, number, number];

interface Built {
  id: string;
  en: string;
  geometry: THREE.ExtrudeGeometry;
  edges: THREE.EdgesGeometry;
  /** The top outline as segment pairs, for the selection line. */
  outline: Vec3[];
  /** Label point in the country frame. */
  cx: number;
  cy: number;
}

/* ------------------------------------------------------------------ *
 * Geometry: built once per page load from the SVG paths, then shared.
 * Country frame: x east, y north, z up, 10 units tall, centred.
 * ------------------------------------------------------------------ */

let built: { districts: Built[]; width: number } | null = null;

function parseSubpaths(d: string): [number, number][][] {
  return d
    .split("Z")
    .map((part) => {
      const nums = part.replace(/[ML]/g, " ").trim().split(/[\s,]+/).filter(Boolean).map(Number);
      const pts: [number, number][] = [];
      for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
      const first = pts[0];
      const last = pts[pts.length - 1];
      if (pts.length > 1 && first[0] === last[0] && first[1] === last[1]) pts.pop();
      return pts;
    })
    .filter((pts) => pts.length >= 3);
}

function buildDistricts() {
  if (built) return built;
  const parsed = districtShapes.map((s) => ({ s, subs: parseSubpaths(s.d) }));
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const { subs } of parsed)
    for (const sub of subs)
      for (const [x, y] of sub) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
  const k = 10 / (maxY - minY);
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  const px = (x: number) => (x - midX) * k;
  const py = (y: number) => -(y - midY) * k;

  const districts = parsed.map(({ s, subs }): Built => {
    const outline: Vec3[] = [];
    const shapes = subs.map((sub) => {
      const pts = sub.map(([x, y]) => new THREE.Vector2(px(x), py(y)));
      pts.forEach((p, i) => {
        const q = pts[(i + 1) % pts.length];
        outline.push([p.x, p.y, 1.002], [q.x, q.y, 1.002]);
      });
      return new THREE.Shape(pts);
    });
    const geometry = new THREE.ExtrudeGeometry(shapes, { depth: 1, bevelEnabled: false, curveSegments: 1 });
    return { id: s.id, en: s.en, geometry, edges: new THREE.EdgesGeometry(geometry, 25), outline, cx: px(s.cx), cy: py(s.cy) };
  });
  built = { districts, width: (maxX - minX) * k };
  return built;
}

let ringGeometry: THREE.RingGeometry | null = null;
let discGeometry: THREE.CircleGeometry | null = null;
const ring = () => (ringGeometry ??= new THREE.RingGeometry(0.14, 0.2, 48));
const disc = () => (discGeometry ??= new THREE.CircleGeometry(7, 96));

/** Column height for a reading: a thin slab when quiet, else growing with the root of the score. */
function heightOf(reading: DistrictReading | undefined) {
  if (!reading || reading.level === 0) return 0.08;
  return Math.min(2.2, 0.15 + Math.sqrt(Math.max(0, reading.score)) * 0.35);
}

/** Mixes a hex colour toward white by `amount` (0–1). */
function lighten(hex: string, amount: number) {
  return "#" + new THREE.Color(hex).lerp(new THREE.Color("#ffffff"), amount).getHexString();
}

const noRaycast = () => undefined;

/* ------------------------------------------------------------------ *
 * Scene pieces
 * ------------------------------------------------------------------ */

function Ping({ x, y, top, reduce }: { x: number; y: number; top: RefObject<number>; reduce: boolean }) {
  const group = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  useFrame((state) => {
    if (group.current) group.current.position.z = (top.current ?? 0) + 0.02;
    meshes.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshBasicMaterial;
      if (reduce) {
        m.visible = i === 0;
        m.scale.setScalar(1.6);
        mat.opacity = 0.85;
        return;
      }
      m.visible = true;
      const p = (((state.clock.elapsedTime + i * PING_PERIOD * 0.5) / PING_PERIOD) % 1 + 1) % 1;
      m.scale.setScalar(0.4 + p * 2.8);
      mat.opacity = Math.pow(1 - p, 1.5) * 0.95;
    });
  });
  return (
    <group ref={group} position={[x, y, 0]}>
      {[0, 1].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            meshes.current[i] = m;
          }}
          geometry={ring()}
          raycast={noRaycast}
          renderOrder={2}
        >
          <meshBasicMaterial color={PING} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

function District({
  shape,
  reading,
  ping,
  hovered,
  selected,
  reduce,
  tops,
  onHover,
  onLeave,
  onPick,
}: {
  shape: Built;
  reading: DistrictReading | undefined;
  ping: boolean;
  hovered: boolean;
  selected: boolean;
  reduce: boolean;
  tops: RefObject<Map<string, number>>;
  onHover: (id: string) => void;
  onLeave: (id: string) => void;
  onPick: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const height = useRef(0.001);
  const lift = useRef(0);
  const top = useRef(0);
  const target = heightOf(reading);
  const base = ZONE_HEX[reading?.level ?? 0];
  const colour = hovered ? lighten(base, 0.18) : base;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const lifted = selected ? LIFT : 0;
    height.current = reduce ? target : THREE.MathUtils.damp(height.current, target, 3, dt);
    lift.current = reduce ? lifted : THREE.MathUtils.damp(lift.current, lifted, 6, dt);
    if (mesh.current) mesh.current.scale.z = Math.max(0.001, height.current);
    if (group.current) group.current.position.z = lift.current;
    top.current = height.current + lift.current;
    tops.current.set(shape.id, top.current);
  });

  return (
    <group>
      <group ref={group}>
        <mesh
          ref={mesh}
          geometry={shape.geometry}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            onHover(shape.id);
          }}
          onPointerOut={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            onLeave(shape.id);
          }}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            if (e.delta > 6) return;
            onPick(shape.id);
          }}
        >
          <meshStandardMaterial color={colour} roughness={0.85} metalness={0} />
          <lineSegments geometry={shape.edges} raycast={noRaycast}>
            <lineBasicMaterial color={selected ? GOLD : EDGE} transparent opacity={selected ? 0.9 : 0.45} />
          </lineSegments>
          {selected ? <Line points={shape.outline} segments color={GOLD} lineWidth={2.5} raycast={noRaycast} /> : null}
        </mesh>
      </group>
      {ping ? <Ping x={shape.cx} y={shape.cy} top={top} reduce={reduce} /> : null}
    </group>
  );
}

const scratch = new THREE.Vector3();

function Country({
  readings,
  pings,
  selected,
  hovered,
  reduce,
  overlay,
  onHover,
  onLeave,
  onPick,
}: {
  readings: DistrictReading[];
  pings: string[];
  selected: string | null;
  hovered: string | null;
  reduce: boolean;
  overlay: RefObject<HTMLDivElement | null>;
  onHover: (id: string) => void;
  onLeave: (id: string) => void;
  onPick: (id: string) => void;
}) {
  const { districts } = buildDistricts();
  const byId = useMemo(() => new Map(readings.map((r) => [r.id, r])), [readings]);
  const pinged = useMemo(() => new Set(pings), [pings]);
  const anchors = useMemo(() => new Map(districts.map((d) => [d.id, d] as const)), [districts]);
  const tops = useRef(new Map<string, number>());
  const sway = useRef<THREE.Group>(null);
  const frame = useRef<THREE.Group>(null);
  const clock = useRef(0);

  useFrame((state, delta) => {
    clock.current += Math.min(delta, 0.05);
    if (sway.current) sway.current.rotation.y = reduce ? 0 : Math.sin(clock.current * 0.22) * SWAY;

    // Pin the HTML labels to their columns.
    const box = overlay.current;
    const country = frame.current;
    if (!box || !country) return;
    country.updateWorldMatrix(true, false);
    const { width, height } = state.size;
    for (const el of Array.from(box.children) as HTMLElement[]) {
      const anchor = el.dataset.anchor ? anchors.get(el.dataset.anchor) : undefined;
      if (!anchor) continue;
      const z = (tops.current.get(anchor.id) ?? 0) + 0.12;
      scratch.set(anchor.cx, anchor.cy, z).applyMatrix4(country.matrixWorld).project(state.camera);
      if (scratch.z > 1) {
        el.style.visibility = "hidden";
        continue;
      }
      el.style.visibility = "visible";
      el.style.transform = `translate(${((scratch.x + 1) / 2) * width}px, ${((1 - scratch.y) / 2) * height}px) translate(-50%, -100%)`;
    }
  });

  return (
    <group ref={sway}>
      <mesh geometry={disc()} rotation-x={-Math.PI / 2} position-y={-0.02} raycast={noRaycast}>
        <meshBasicMaterial color={NAVY} transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <group ref={frame} rotation-x={-Math.PI / 2}>
        {districts.map((d) => (
          <District
            key={d.id}
            shape={d}
            reading={byId.get(d.id)}
            ping={pinged.has(d.id)}
            hovered={hovered === d.id}
            selected={selected === d.id}
            reduce={reduce}
            tops={tops}
            onHover={onHover}
            onLeave={onLeave}
            onPick={onPick}
          />
        ))}
      </group>
    </group>
  );
}

/** Camera distance that keeps the whole country (and its sway) in frame at this aspect. */
function fitDistance(aspect: number, width: number) {
  const t = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  // Seen at a tilt, the country spans less than its full height on screen.
  const halfH = 3.7;
  const halfW = (width / 2) * Math.cos(SWAY) + 5 * Math.sin(SWAY) + 0.4;
  return Math.max(halfH / t, halfW / (t * Math.max(0.2, aspect)));
}

function Rig({ fit }: { fit: number }) {
  const last = useRef(0);
  useFrame((state) => {
    if (last.current === fit) return;
    const first = last.current === 0;
    last.current = fit;
    const cam = state.camera;
    const offset = first
      ? new THREE.Vector3(0, Math.cos(POLAR), Math.sin(POLAR))
      : cam.position.clone().sub(new THREE.Vector3(...TARGET)).normalize();
    cam.position.copy(offset.multiplyScalar(fit).add(new THREE.Vector3(...TARGET)));
    cam.lookAt(...TARGET);
  });
  return null;
}

function Controls() {
  const size = useThree((s) => s.size);
  const fit = fitDistance(size.width / Math.max(1, size.height), buildDistricts().width);
  return (
    <>
      <Rig fit={fit} />
      <OrbitControls
        makeDefault
        target={TARGET}
        enablePan={false}
        enableZoom
        enableDamping
        rotateSpeed={0.6}
        minDistance={fit * 0.5}
        maxDistance={fit * 1.5}
        minPolarAngle={0.2}
        maxPolarAngle={1.2}
        minAzimuthAngle={-0.8}
        maxAzimuthAngle={0.8}
      />
    </>
  );
}

/** Whether the wrapper is on screen and the page is showing, so the frame loop can rest otherwise. */
function useLive(ref: RefObject<HTMLDivElement | null>) {
  const [onScreen, setOnScreen] = useState(true);
  const [pageShown, setPageShown] = useState(true);
  useEffect(() => {
    const el = ref.current;
    const onVisibility = () => setPageShown(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    const io = el ? new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.05 }) : null;
    if (el) io?.observe(el);
    const t = window.setTimeout(onVisibility, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [ref]);
  return onScreen && pageShown;
}

/**
 * Bangladesh as a 3D relief of its 64 districts: each column's height and
 * colour show the window's crime and corruption risk, violent reports from
 * the last six hours ripple on top, and the selected district lifts in
 * gold. It sways slowly and can be dragged within limits; under reduced
 * motion it renders the final state still. Load it through
 * District3DLazy, which falls back to a light map on weak devices.
 */
export default function District3D({ readings, pings, selected, onSelect, className, windowHours }: MapLayerProps & { windowHours: number }) {
  const wrapper = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const reduce = useReducedMotion() ?? false;
  const live = useLive(wrapper);
  const [hovered, setHovered] = useState<string | null>(null);

  const top5 = useMemo(
    () => readings.filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 5),
    [readings],
  );
  const hoveredReading = hovered ? readings.find((r) => r.id === hovered) : undefined;
  const hoveredName = hovered ? (hoveredReading?.name ?? districtShapes.find((d) => d.id === hovered)?.en ?? hovered) : null;
  const hoveredCount = hoveredReading?.count ?? 0;

  const placeTip = (el: HTMLDivElement) => {
    el.style.transform = `translate(${pointer.current.x + 14}px, ${pointer.current.y + 14}px)`;
  };

  return (
    <div
      ref={wrapper}
      className={cn("relative h-full min-h-[22rem] w-full", hovered && "cursor-pointer", className)}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        if (tip.current) placeTip(tip.current);
      }}
      onPointerLeave={() => setHovered(null)}
    >
      <p className="sr-only">3D map of Bangladesh: district height and colour show reported crime and corruption.</p>
      <div className="absolute inset-0">
        <Canvas
          aria-hidden
          flat
          frameloop={live ? "always" : "demand"}
          dpr={[1, 1.75]}
          camera={{ fov: FOV, near: 0.5, far: 120, position: [0, 12, 14] }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 6]} intensity={1.6} />
          <Country
            readings={readings}
            pings={pings}
            selected={selected}
            hovered={hovered}
            reduce={reduce}
            overlay={overlay}
            onHover={setHovered}
            onLeave={(id) => setHovered((cur) => (cur === id ? null : cur))}
            onPick={(id) => onSelect(selected === id ? null : id)}
          />
          <Controls />
        </Canvas>
      </div>

      <div ref={overlay} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {top5.map((r) => (
          <div
            key={r.id}
            data-anchor={r.id}
            className="absolute top-0 left-0 rounded-md bg-black/70 px-2 py-0.5 font-sans text-xs whitespace-nowrap text-white ring-1 ring-white/15"
            style={{ transform: "translate(-9999px, 0)" }}
          >
            {r.name} <span className="text-signal-orange tabular-nums">{r.count}</span>
          </div>
        ))}
      </div>

      {hoveredName ? (
        <div
          ref={(el) => {
            tip.current = el;
            if (el) placeTip(el);
          }}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 rounded-lg bg-black/80 px-3 py-1.5 font-sans text-sm text-white ring-1 ring-white/15"
        >
          <span className="font-semibold">{hoveredName}</span>
          <span className="block text-white/75">
            {hoveredCount > 0 ? `${hoveredCount} ${hoveredCount === 1 ? "report" : "reports"} in ${windowHours} h` : "No reports"}
          </span>
        </div>
      ) : null}
    </div>
  );
}
