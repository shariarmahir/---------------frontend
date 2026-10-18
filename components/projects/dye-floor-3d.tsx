"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * The dyeing floor in 3D, for the Alliance Dyer project page: fifty
 * machines in five bays, each lid lit by its status, signals rising from
 * every machine to the control hub above the floor, and the hub feeding
 * the wallboard behind. The camera drifts slowly round. Loaded on demand
 * (dye-floor-motion.tsx); it keeps its own clock so a pause resumes in
 * place.
 */

const STATUS = {
  R: "#5aaeff", // running
  D: "#da291c", // delayed
  H: "#e4b027", // on hold
  B: "#8fa1e3", // batch ready
  X: "#2a3150", // not available
} as const;
type Status = keyof typeof STATUS;

/** The demo's fleet map, bay by bay, machines 1–50: 33 running, 11 delayed, 1 on hold, 3 ready, 2 not available. */
const FLEET = ["BDRXBRDRRR", "RRHRDRDRRD", "RRRRDRRDRR", "DRDRDRRRRX", "RRRRRBRRDR"];

const HUB = new THREE.Vector3(0, 5.2, -1);
const PACKETS = 48;

interface Machine {
  position: THREE.Vector3;
  status: Status;
}

const machines: Machine[] = FLEET.flatMap((bay, b) =>
  [...bay].map((s, c) => ({ position: new THREE.Vector3((c - 4.5) * 2.1, 0, (b - 2) * 2.4), status: s as Status })),
);

function Machines({ clockRef }: { clockRef: RefObject<number> }) {
  const lids = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    machines.forEach((m, i) => {
      const lid = lids.current[i];
      if (!lid) return;
      // Delayed machines throb; running ones glow steadily; the rest stay low.
      lid.emissiveIntensity = m.status === "D" ? 0.6 + 0.6 * Math.max(0, Math.sin(t * 4 + i)) : m.status === "X" ? 0.05 : 0.55;
    });
  });
  return (
    <group>
      {machines.map((m, i) => (
        <group key={i} position={m.position}>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.62, 0.66, 1.1, 28]} />
            <meshStandardMaterial color="#0b1849" metalness={0.4} roughness={0.55} />
          </mesh>
          <mesh position={[0, 1.16, 0]}>
            <cylinderGeometry args={[0.66, 0.66, 0.12, 28]} />
            <meshStandardMaterial
              ref={(el) => {
                lids.current[i] = el;
              }}
              color={STATUS[m.status]}
              emissive={STATUS[m.status]}
              emissiveIntensity={0.55}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Signal packets: each leaves a working machine and arcs up into the hub, then starts again from another. */
function Packets({ clockRef }: { clockRef: RefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const live = useMemo(() => machines.filter((m) => m.status !== "X"), []);
  const seeds = useMemo(() => Array.from({ length: PACKETS }, (_, i) => ({ offset: i / PACKETS, speed: 0.18 + (i % 5) * 0.03 })), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colour = useMemo(() => new THREE.Color(), []);
  const from = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const t = clockRef.current ?? 0;
    const inst = mesh.current;
    if (!inst) return;
    seeds.forEach((seed, i) => {
      const run = t * seed.speed + seed.offset;
      const lap = Math.floor(run);
      const p = run - lap;
      const m = live[(i * 7 + lap * 13) % live.length];
      from.copy(m.position).setY(1.3);
      dummy.position.lerpVectors(from, HUB, p);
      dummy.position.y += Math.sin(Math.PI * p) * 1.6;
      dummy.scale.setScalar(0.09 + 0.05 * Math.sin(Math.PI * p));
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      inst.setColorAt(i, colour.set(STATUS[m.status]));
    });
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, PACKETS]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

/** The control hub, turning slowly, and the beam that feeds the wallboard. */
function Hub({ clockRef }: { clockRef: RefObject<number> }) {
  const core = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    if (core.current) core.current.rotation.set(t * 0.3, t * 0.5, 0);
    if (beam.current) beam.current.opacity = 0.35 + 0.25 * Math.sin(t * 3);
  });
  return (
    <group>
      <mesh ref={core} position={HUB}>
        <icosahedronGeometry args={[0.75, 0]} />
        <meshStandardMaterial color="#e4b027" emissive="#e4b027" emissiveIntensity={0.8} wireframe />
      </mesh>
      <mesh position={[0, 5.2, -4.6]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 7.2, 8]} />
        <meshBasicMaterial ref={beam} color="#e4b027" transparent opacity={0.5} toneMapped={false} />
      </mesh>
      {/* The wallboard: a cobalt screen with five bars, one per bay. */}
      <group position={[0, 5.2, -8.4]}>
        <mesh>
          <planeGeometry args={[9, 3.6]} />
          <meshStandardMaterial color="#035397" emissive="#035397" emissiveIntensity={0.35} side={THREE.DoubleSide} />
        </mesh>
        {FLEET.map((bay, b) => {
          const running = [...bay].filter((s) => s === "R").length / bay.length;
          return (
            <mesh key={b} position={[-3.2 + b * 1.6, -1.4 + running * 1.2, 0.02]}>
              <planeGeometry args={[1, running * 2.4]} />
              <meshBasicMaterial color="#e4b027" toneMapped={false} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function Rig({ playing, clockRef }: { playing: boolean; clockRef: RefObject<number> }) {
  useFrame((state, delta) => {
    if (playing) clockRef.current = (clockRef.current ?? 0) + Math.min(delta, 0.05);
    const a = (clockRef.current ?? 0) * 0.07 + 0.6;
    state.camera.position.set(Math.sin(a) * 21, 11.5, Math.cos(a) * 21);
    state.camera.lookAt(0, 1.6, -1);
  });
  return null;
}

export default function DyeFloor3D({ playing }: { playing: boolean }) {
  const clockRef = useRef(0);
  return (
    <Canvas
      frameloop={playing ? "always" : "demand"}
      dpr={[1, 1.5]}
      camera={{ fov: 42, position: [0, 11.5, 21] }}
      gl={{ antialias: true }}
      aria-hidden
    >
      <color attach="background" args={["#020409"]} />
      <fog attach="fog" args={["#020409", 22, 42]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[6, 12, 8]} intensity={1.1} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[40, 30]} />
        <meshStandardMaterial color="#05070f" roughness={0.9} />
      </mesh>
      <gridHelper args={[26, 26, "#0f1a3d", "#0a1130"]} position={[0, 0.01, 0]} />
      <Machines clockRef={clockRef} />
      <Packets clockRef={clockRef} />
      <Hub clockRef={clockRef} />
      <Rig playing={playing} clockRef={clockRef} />
    </Canvas>
  );
}
