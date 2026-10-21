"use client";

// Drops fiber's THREE.Clock deprecation warning (see the file).
import "@/lib/three-console";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * The Alliance Dyer film, read left to right in a wide frame: dyeing
 * machines lit by their status send signals to the bay gateway, the
 * gateway streams them into the store, and the store feeds the wallboard
 * and the operator's tablet, where the fleet map, output bars and hourly
 * line redraw. Loaded on demand (dye-floor-motion.tsx); it keeps its own
 * clock so a pause resumes in place, and the camera backs off on a
 * narrower screen so all four stages stay in frame.
 */

const STATUS = {
  R: "#5aaeff", // running
  D: "#da291c", // delayed
  H: "#e4b027", // on hold
  B: "#8fa1e3", // batch ready
  X: "#2a3150", // not available
} as const;
type Status = keyof typeof STATUS;
type Clock = { clockRef: RefObject<number> };

/** The demo's fleet map, bay by bay, machines 1–50. */
const FLEET = ["BDRXBRDRRR", "RRHRDRDRRD", "RRRRDRRDRR", "DRDRDRRRRX", "RRRRRBRRDR"];

/** The floor in the film: the first four machines of the first three bays. */
const machines = FLEET.slice(0, 3).flatMap((bay, b) =>
  [...bay.slice(0, 4)].map((s, c) => ({ position: new THREE.Vector3(-11.2 + c * 2, 0, (b - 1) * 2.3), status: s as Status })),
);
const live = machines.filter((m) => m.status !== "X");

const GATEWAY = new THREE.Vector3(-2.8, 2.4, 0);
const STORE_X = 2.6;
const STORE_IN = new THREE.Vector3(STORE_X, 3, 0);
const STORE_OUT = new THREE.Vector3(STORE_X + 1.3, 1.6, 0.4);
const DISPLAY = new THREE.Vector3(9.2, 2.7, -0.6);
const DISPLAY_IN = new THREE.Vector3(7.4, 2.5, 0.2);

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// Scratch objects for the packet streams, reused every frame (the frame loop is synchronous).
const dummy = new THREE.Object3D();
const tint = new THREE.Color();
const from = new THREE.Vector3();

/** A stream of small glowing packets, each arcing from its source to the target and starting over. */
function Flow({
  clockRef,
  count,
  source,
  target,
  arc,
  size,
  speed,
  colour,
  shape = "sphere",
}: Clock & {
  count: number;
  source: (i: number, lap: number, out: THREE.Vector3) => void;
  target: THREE.Vector3;
  arc: number;
  size: number;
  speed: number;
  colour: (i: number, lap: number) => string;
  shape?: "sphere" | "cube";
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  useFrame(() => {
    const inst = mesh.current;
    if (!inst) return;
    const t = clockRef.current ?? 0;
    for (let i = 0; i < count; i++) {
      const run = t * speed * (1 + (i % 4) * 0.12) + i / count;
      const lap = Math.floor(run);
      const p = run - lap;
      source(i, lap, from);
      dummy.position.lerpVectors(from, target, p);
      dummy.position.y += Math.sin(Math.PI * p) * arc;
      dummy.rotation.set(t * 2 + i, t * 1.5 + i, 0);
      dummy.scale.setScalar(size * (0.6 + 0.6 * Math.sin(Math.PI * p)));
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      inst.setColorAt(i, tint.set(colour(i, lap)));
    }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      {shape === "cube" ? <boxGeometry args={[1, 1, 1]} /> : <sphereGeometry args={[1, 12, 12]} />}
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

/** The dyeing machines: navy vessels with status-lit lids; delayed ones throb. */
function Machines({ clockRef }: Clock) {
  const lids = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    machines.forEach((m, i) => {
      const lid = lids.current[i];
      if (lid) lid.emissiveIntensity = m.status === "D" ? 0.5 + 0.8 * Math.max(0, Math.sin(t * 4 + i)) : m.status === "X" ? 0.05 : 0.6;
    });
  });
  return (
    <group>
      {machines.map((m, i) => (
        <group key={i} position={m.position}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.66, 0.7, 1.2, 32]} />
            <meshStandardMaterial color="#0b1849" metalness={0.5} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <torusGeometry args={[0.7, 0.03, 8, 40]} />
            <meshStandardMaterial color="#8fa1e3" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 1.26, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 0.12, 32]} />
            <meshStandardMaterial
              ref={(el) => {
                lids.current[i] = el;
              }}
              color={STATUS[m.status]}
              emissive={STATUS[m.status]}
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** The bay gateway: a gold core turning inside a slow ring. */
function Gateway({ clockRef }: Clock) {
  const core = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    core.current?.rotation.set(t * 0.4, t * 0.6, 0);
    ring.current?.rotation.set(Math.PI / 2 + Math.sin(t * 0.5) * 0.3, 0, t * 0.8);
  });
  return (
    <group position={GATEWAY}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#e4b027" emissive="#e4b027" emissiveIntensity={0.9} wireframe />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[1, 0.025, 8, 64]} />
        <meshBasicMaterial color="#e4b027" toneMapped={false} />
      </mesh>
    </group>
  );
}

/** The store: three cobalt discs whose gold rims light in a wave as data lands, with records orbiting. */
function Store({ clockRef }: Clock) {
  const rims = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const orbit = useRef<THREE.Group>(null);
  const records = useMemo(() => Array.from({ length: 14 }, (_, i) => ((i / 14) * Math.PI * 2)), []);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    rims.current.forEach((m, i) => {
      if (m) m.opacity = 0.3 + 0.7 * Math.max(0, Math.sin(t * 2.4 - (2 - i) * 0.9));
    });
    if (orbit.current) orbit.current.rotation.y = t * 0.5;
  });
  return (
    <group position={[STORE_X, 0, 0]}>
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.5 + i * 0.95, 0]}>
          <mesh>
            <cylinderGeometry args={[1.25, 1.25, 0.72, 48]} />
            <meshStandardMaterial color="#035397" emissive="#035397" emissiveIntensity={0.3} metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.37, 0]}>
            <torusGeometry args={[1.25, 0.04, 8, 64]} />
            <meshBasicMaterial
              ref={(el) => {
                rims.current[i] = el;
              }}
              color="#e4b027"
              transparent
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      <group ref={orbit} position={[0, 1.45, 0]}>
        {records.map((a, i) => (
          <mesh key={i} position={[Math.cos(a) * 1.85, Math.sin(a * 3) * 0.5, Math.sin(a) * 1.85]}>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshBasicMaterial color={i % 3 ? "#5aaeff" : "#e4b027"} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** The wallboard: the fleet map of all fifty machines, output bars by bay, the hourly line drawing in, and the alert strip. */
function Wallboard({ clockRef }: Clock) {
  const delayed = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  const alert = useRef<THREE.MeshBasicMaterial>(null);
  const POINTS = 48;
  const line = useMemo(() => {
    const pts = Array.from({ length: POINTS }, (_, i) => {
      const p = i / (POINTS - 1);
      return new THREE.Vector3(lerp(-2.8, 2.8, p), -1.25 + 0.5 * p + 0.16 * Math.sin(p * 14) + 0.08 * Math.sin(p * 31), 0.02);
    });
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#5aaeff", toneMapped: false }));
  }, []);
  const dots = useMemo(() => FLEET.flatMap((bay, b) => [...bay].map((s, c) => ({ b, c, status: s as Status }))), []);

  useFrame(() => {
    const t = clockRef.current ?? 0;
    delayed.current.forEach((m, i) => {
      if (m) m.opacity = 0.35 + 0.65 * Math.max(0, Math.sin(t * 4 + i));
    });
    bars.current.forEach((bar, i) => {
      if (!bar) return;
      const h = 0.4 + 1.1 * (0.55 + 0.45 * Math.sin(t * 0.9 + i * 1.3));
      bar.scale.y = h;
      bar.position.y = -0.15 + h / 2;
    });
    const p = Math.min(1, (t % 6) / 4.5);
    line.geometry.setDrawRange(0, Math.max(2, Math.round(p * POINTS)));
    if (alert.current) alert.current.opacity = 0.25 + 0.75 * Math.max(0, Math.sin(t * 2.2));
  });

  return (
    <group position={DISPLAY} rotation={[0, -0.42, 0]}>
      <mesh position={[0, 0, -0.08]}>
        <boxGeometry args={[6.5, 3.7, 0.14]} />
        <meshStandardMaterial color="#0b1849" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh>
        <planeGeometry args={[6.2, 3.4]} />
        <meshBasicMaterial color="#03060f" />
      </mesh>
      <mesh position={[0, -2.6, -0.1]}>
        <boxGeometry args={[0.18, 1.6, 0.18]} />
        <meshStandardMaterial color="#0b1849" />
      </mesh>

      {/* The alert strip along the top. */}
      <mesh position={[0, 1.52, 0.01]}>
        <planeGeometry args={[6.2, 0.14]} />
        <meshBasicMaterial ref={alert} color="#da291c" transparent toneMapped={false} />
      </mesh>

      {/* The fleet map: five bays of ten. */}
      {dots.map((d, i) => (
        <mesh key={i} position={[-2.75 + d.c * 0.25, 1.15 - d.b * 0.25, 0.01]}>
          <planeGeometry args={[0.18, 0.18]} />
          <meshBasicMaterial
            ref={
              d.status === "D"
                ? (el) => {
                    delayed.current[i] = el;
                  }
                : undefined
            }
            color={STATUS[d.status]}
            transparent
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Output by bay. */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            bars.current[i] = el;
          }}
          position={[0.4 + i * 0.52, 0.5, 0.01]}
        >
          <planeGeometry args={[0.34, 1]} />
          <meshBasicMaterial color="#e4b027" toneMapped={false} />
        </mesh>
      ))}

      {/* The hourly line. */}
      <primitive object={line} />
    </group>
  );
}

/** The operator's tablet at the machine side, its rows filling in turn. */
function Tablet({ clockRef }: Clock) {
  const rows = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    rows.current.forEach((row, i) => {
      if (!row) return;
      const w = 0.25 + 0.75 * Math.max(0, Math.sin(t * 1.2 - i * 0.6));
      row.scale.x = w;
      row.position.x = -0.5 + (w * 1.0) / 2;
    });
  });
  return (
    <group position={[6.2, 0.8, 2.6]} rotation={[-0.5, -0.5, 0]}>
      <mesh>
        <boxGeometry args={[1.5, 1, 0.07]} />
        <meshStandardMaterial color="#0b1849" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[1.36, 0.86]} />
        <meshBasicMaterial color="#03060f" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            rows.current[i] = el;
          }}
          position={[0, 0.24 - i * 0.24, 0.05]}
        >
          <planeGeometry args={[1, 0.11]} />
          <meshBasicMaterial color={i === 0 ? "#da291c" : "#5aaeff"} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ playing, clockRef }: Clock & { playing: boolean }) {
  useFrame((state, delta) => {
    if (playing) clockRef.current = (clockRef.current ?? 0) + Math.min(delta, 0.05);
    const t = clockRef.current ?? 0;
    const cam = state.camera as THREE.PerspectiveCamera;
    // Back off far enough that the machines and the wallboard both stay in frame at this width.
    const aspect = state.size.width / Math.max(1, state.size.height);
    const dist = 14.2 / (Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * aspect);
    cam.position.set(Math.sin(t * 0.12) * 1.4, 2.4 + dist * 0.2, dist);
    cam.lookAt(0, 1.1, 0);
  });
  return null;
}

export default function DyeFloor3D({ playing }: { playing: boolean }) {
  // Start a few seconds in, so a still frame already shows data on the move.
  const clockRef = useRef(6);
  return (
    <Canvas frameloop={playing ? "always" : "demand"} dpr={[1, 1.5]} camera={{ fov: 30, position: [0, 8, 20] }} gl={{ antialias: true }} aria-hidden>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 22, 48]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 12, 10]} intensity={1.2} />
      <gridHelper args={[44, 44, "#0b1849", "#0b1849"]} />

      <Machines clockRef={clockRef} />
      <Flow
        clockRef={clockRef}
        count={30}
        speed={0.32}
        arc={1.6}
        size={0.11}
        target={GATEWAY}
        source={(i, lap, out) => out.copy(live[(i * 5 + lap * 7) % live.length].position).setY(1.4)}
        colour={(i, lap) => STATUS[live[(i * 5 + lap * 7) % live.length].status]}
      />
      <Gateway clockRef={clockRef} />
      <Flow
        clockRef={clockRef}
        count={14}
        speed={0.45}
        arc={0.9}
        size={0.13}
        shape="cube"
        target={STORE_IN}
        source={(_, __, out) => out.copy(GATEWAY)}
        colour={() => "#e4b027"}
      />
      <Store clockRef={clockRef} />
      <Flow
        clockRef={clockRef}
        count={14}
        speed={0.42}
        arc={0.7}
        size={0.12}
        shape="cube"
        target={DISPLAY_IN}
        source={(_, __, out) => out.copy(STORE_OUT)}
        colour={(i) => (i % 5 === 0 ? "#da291c" : "#5aaeff")}
      />
      <Wallboard clockRef={clockRef} />
      <Tablet clockRef={clockRef} />
      <Rig playing={playing} clockRef={clockRef} />
    </Canvas>
  );
}
