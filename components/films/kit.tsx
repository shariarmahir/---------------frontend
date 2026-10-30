"use client";

// Drops fiber's THREE.Clock deprecation warning (see the file).
import "@/lib/three-console";
import { Canvas, useFrame } from "@react-three/fiber";
import { createContext, useContext, useMemo, useRef, type ReactNode, type RefObject } from "react";
import * as THREE from "three";

/**
 * The shared kit for the product films (aponjon-film.tsx, swasti-film.tsx,
 * pharmacy-film.tsx): the stage and camera, a film clock that pauses in
 * place, glowing data packets, ripples, screens, a heartbeat trace and a
 * jointed human figure with a handful of poses. Everything reads the film
 * clock from context, so a pause freezes the whole scene at once.
 */

export const C = {
  gold: "#e4b027",
  red: "#da291c",
  blue: "#5aaeff",
  navy: "#0b1849",
  cobalt: "#035397",
  tint: "#8fa1e3",
  screen: "#03060f",
  dim: "#1a2552",
  skin: "#9a6446",
} as const;

type Vec3 = [number, number, number];

const ClockContext = createContext<RefObject<number> | null>(null);

/** The film clock, in seconds. It only runs while the film plays. */
export function useClock() {
  const clockRef = useContext(ClockContext);
  if (!clockRef) throw new Error("useClock must be used inside <Film>");
  return clockRef;
}

/** Seconds into the current loop of a film `period` seconds long. */
export const cycle = (t: number, period: number) => ((t % period) + period) % period;

/** 0 → 1 as `t` goes from `a` to `b`, eased at both ends. */
export function ramp(t: number, a: number, b: number) {
  const p = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return p * p * (3 - 2 * p);
}

function Rig({ playing, halfWidth, look, elevation }: { playing: boolean; halfWidth: number; look: Vec3; elevation: number }) {
  const clockRef = useClock();
  useFrame((state, delta) => {
    if (playing) clockRef.current = (clockRef.current ?? 0) + Math.min(delta, 0.05);
    const t = clockRef.current ?? 0;
    const cam = state.camera as THREE.PerspectiveCamera;
    // Back off far enough that the whole story, `halfWidth` either side, stays in frame at this width.
    const aspect = state.size.width / Math.max(1, state.size.height);
    const dist = halfWidth / (Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * aspect);
    cam.position.set(look[0] + Math.sin(t * 0.12) * 0.8, look[1] + 0.8 + dist * elevation, dist);
    cam.lookAt(look[0], look[1], look[2]);
  });
  return null;
}

/** The stage: black ground with a faint navy grid, soft light, and the camera that keeps everything in view. */
export function Film({
  playing,
  children,
  halfWidth = 12,
  look = [0, 1.5, 0],
  start = 0.5,
  elevation = 0.13,
}: {
  playing: boolean;
  children: ReactNode;
  halfWidth?: number;
  look?: Vec3;
  /** Where the clock starts, so a still frame already shows the story under way. */
  start?: number;
  /** How far above the scene the camera sits, as a share of its distance: lower for small square frames. */
  elevation?: number;
}) {
  const clockRef = useRef(start);
  return (
    <Canvas frameloop={playing ? "always" : "demand"} dpr={[1, 1.5]} camera={{ fov: 30, position: [0, 8, 20] }} gl={{ antialias: true }} aria-hidden>
      <ClockContext value={clockRef}>
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 24, 50]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 12, 10]} intensity={1.2} />
        <directionalLight position={[-8, 6, -6]} intensity={0.35} color={C.tint} />
        <gridHelper args={[48, 48, C.navy, C.navy]} />
        {children}
        <Rig playing={playing} halfWidth={halfWidth} look={look} elevation={elevation} />
      </ClockContext>
    </Canvas>
  );
}

// Scratch objects for the packet streams, reused every frame (the frame loop is synchronous).
const dummy = new THREE.Object3D();
const tint = new THREE.Color();
const from = new THREE.Vector3();
const to = new THREE.Vector3();

/** A stream of glowing packets arcing from `source` to `target`, each starting over when it lands. Hidden while `when` is false. */
export function Flow({
  source,
  target,
  count = 12,
  speed = 0.4,
  arc = 1,
  size = 0.12,
  colour = C.blue,
  shape = "sphere",
  when,
}: {
  source: Vec3;
  target: Vec3;
  count?: number;
  speed?: number;
  arc?: number;
  size?: number;
  colour?: string | ((i: number) => string);
  shape?: "sphere" | "cube";
  when?: (t: number) => boolean;
}) {
  const clockRef = useClock();
  const mesh = useRef<THREE.InstancedMesh>(null);
  useFrame(() => {
    const inst = mesh.current;
    if (!inst) return;
    const t = clockRef.current ?? 0;
    const on = when ? when(t) : true;
    from.set(...source);
    to.set(...target);
    for (let i = 0; i < count; i++) {
      const run = t * speed * (1 + (i % 4) * 0.12) + i / count;
      const p = run - Math.floor(run);
      dummy.position.lerpVectors(from, to, p);
      dummy.position.y += Math.sin(Math.PI * p) * arc;
      dummy.rotation.set(t * 2 + i, t * 1.5 + i, 0);
      dummy.scale.setScalar(on ? size * (0.6 + 0.6 * Math.sin(Math.PI * p)) : 0);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
      inst.setColorAt(i, tint.set(typeof colour === "function" ? colour(i) : colour));
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

/** Rings that spread out and fade, like a signal or a voice. Facing the camera unless rotated. */
export function Ripple({
  position,
  rotation = [0, 0, 0],
  colour = C.gold,
  size = 1,
  period = 1.6,
  count = 3,
  when,
}: {
  position: Vec3;
  rotation?: Vec3;
  colour?: string;
  size?: number;
  period?: number;
  count?: number;
  when?: (t: number) => boolean;
}) {
  const clockRef = useClock();
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    const on = when ? when(t) : true;
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const p = (t / period + i / count) % 1;
      ring.scale.setScalar(on ? 0.15 + p * size : 0);
      (ring.material as THREE.MeshBasicMaterial).opacity = (1 - p) * 0.85;
    });
  });
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            rings.current[i] = el;
          }}
        >
          <ringGeometry args={[0.9, 1, 48]} />
          <meshBasicMaterial color={colour} transparent side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** A framed screen. Its glass lights to cobalt while `lit` is true; whatever is drawn on it goes in `children`. */
export function Screen({
  size,
  position,
  rotation,
  lit,
  children,
}: {
  size: [number, number];
  position: Vec3;
  rotation?: Vec3;
  lit?: (t: number) => boolean;
  children?: ReactNode;
}) {
  const clockRef = useClock();
  const glass = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (!glass.current || !lit) return;
    glass.current.color.set(lit(clockRef.current ?? 0) ? C.cobalt : C.screen);
  });
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, -0.07]}>
        <boxGeometry args={[size[0] + 0.24, size[1] + 0.24, 0.12]} />
        <meshStandardMaterial color={C.navy} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh>
        <planeGeometry args={size} />
        <meshBasicMaterial ref={glass} color={C.screen} />
      </mesh>
      <group position={[0, 0, 0.01]}>{children}</group>
    </group>
  );
}

/** A head-and-shoulders figure for a video call on a screen. */
export function Silhouette({ colour = C.tint, scale = 1, position = [0, 0, 0] }: { colour?: string; scale?: number; position?: Vec3 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.22, 0]}>
        <circleGeometry args={[0.2, 32]} />
        <meshBasicMaterial color={colour} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.32, 0]}>
        <circleGeometry args={[0.38, 32, 0, Math.PI]} />
        <meshBasicMaterial color={colour} toneMapped={false} />
      </mesh>
    </group>
  );
}

const bump = (u: number, m: number, s: number) => Math.exp(-((u - m) ** 2) / (2 * s * s));

/** One heartbeat, `u` from 0 to 1. An irregular beat shifts and changes height, with an extra early beat. */
function heartbeat(u: number, irregular: boolean, beat: number) {
  const shift = irregular ? ((beat * 7) % 5) / 16 - 0.12 : 0;
  const height = irregular ? 0.55 + ((beat * 3) % 4) * 0.22 : 1;
  const c = 0.36 + shift;
  return (
    0.12 * bump(u, c - 0.17, 0.03) -
    0.12 * bump(u, c - 0.03, 0.012) +
    0.9 * height * bump(u, c, 0.014) -
    0.28 * bump(u, c + 0.03, 0.013) +
    0.24 * bump(u, c + 0.24, 0.05) +
    (irregular && beat % 2 === 0 ? 0.55 * bump(u, 0.9, 0.016) : 0)
  );
}

const TRACE_POINTS = 180;

/** A scrolling heartbeat trace, `width` by `height`. It turns red and irregular while `irregular` is true. */
export function Trace({
  width,
  height,
  beats = 4,
  speed = 1.1,
  position,
  irregular,
}: {
  width: number;
  height: number;
  beats?: number;
  speed?: number;
  position?: Vec3;
  irregular?: (t: number) => boolean;
}) {
  const clockRef = useClock();
  const lineRef = useRef<THREE.Line>(null);
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRACE_POINTS * 3), 3));
    return new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: C.blue, toneMapped: false }));
  }, []);
  useFrame(() => {
    const l = lineRef.current;
    if (!l) return;
    const t = clockRef.current ?? 0;
    const odd = irregular ? irregular(t) : false;
    const pos = l.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < TRACE_POINTS; i++) {
      const u = i / (TRACE_POINTS - 1);
      const run = u * beats - t * speed;
      const beat = Math.floor(run);
      pos.setXYZ(i, (u - 0.5) * width, (heartbeat(run - beat, odd, beat) - 0.25) * height, 0);
    }
    pos.needsUpdate = true;
    (l.material as THREE.LineBasicMaterial).color.set(odd ? C.red : C.blue);
  });
  return <primitive ref={lineRef} object={line} position={position} />;
}

/** A graduation cap, to sit on a figure's head (its top is about y = 2.33 on a full-size figure). */
export function GradCap({ position, rotation }: { position: Vec3; rotation?: Vec3 }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.17, 0.19, 0.1, 20]} />
        <meshStandardMaterial color={C.tint} roughness={0.6} />
      </mesh>
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.52, 0.035, 0.52]} />
        <meshStandardMaterial color={C.tint} roughness={0.6} />
      </mesh>
      <mesh position={[0.2, -0.1, 0.12]}>
        <boxGeometry args={[0.025, 0.2, 0.025]} />
        <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

/* ── The human figure ─────────────────────────────────────────────────── */

export type Pose = "stand" | "walk" | "sit" | "call" | "phone" | "desk" | "reach";

export interface Look {
  shirt: string;
  legs?: string;
  skin?: string;
  hair?: "short" | "long" | "none";
  hairColour?: string;
}

type GroupRef = RefObject<THREE.Group | null>;

const limb = (radius: number, length: number) => <capsuleGeometry args={[radius, length, 6, 12]} />;

/** A leg from the hip: thigh, knee, shin and foot. */
function Leg({ side, colour, hipRef, kneeRef }: { side: 1 | -1; colour: string; hipRef: GroupRef; kneeRef: GroupRef }) {
  return (
    <group ref={hipRef} position={[0.13 * side, 1, 0]}>
      <mesh position={[0, -0.24, 0]}>
        {limb(0.1, 0.3)}
        <meshStandardMaterial color={colour} roughness={0.7} />
      </mesh>
      <group ref={kneeRef} position={[0, -0.48, 0]}>
        <mesh position={[0, -0.24, 0]}>
          {limb(0.085, 0.32)}
          <meshStandardMaterial color={colour} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.5, 0.06]}>
          <boxGeometry args={[0.15, 0.08, 0.26]} />
          <meshStandardMaterial color="#0d0d12" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

/** An arm from the shoulder: sleeve, elbow, forearm and hand, with whatever the hand carries. */
function Arm({
  side,
  shirt,
  skin,
  shoulderRef,
  elbowRef,
  children,
}: {
  side: 1 | -1;
  shirt: string;
  skin: string;
  shoulderRef: GroupRef;
  elbowRef: GroupRef;
  children?: ReactNode;
}) {
  return (
    <group ref={shoulderRef} position={[0.34 * side, 1.72, 0]} rotation={[0, 0, 0.1 * side]}>
      <mesh position={[0, -0.18, 0]}>
        {limb(0.075, 0.22)}
        <meshStandardMaterial color={shirt} roughness={0.6} />
      </mesh>
      <group ref={elbowRef} position={[0, -0.36, 0]}>
        <mesh position={[0, -0.16, 0]}>
          {limb(0.065, 0.2)}
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.36, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
        {children}
      </group>
    </group>
  );
}

/**
 * A stylised person about 2.1 units tall, standing on y = 0 and facing +z.
 * Joints at the hips, knees, shoulders and elbows move by `pose`, which may
 * change with time (a function of the film clock). `band` puts a glowing
 * band on the left wrist; `hold` puts a phone or a medicine bag in the
 * right hand, shown while `holdWhen` is true. `flash` makes the phone
 * screen pulse red, for an alert.
 */
export function Person({
  look,
  pose,
  phase = 0,
  position,
  rotation,
  scale = 1,
  band = false,
  badge = false,
  hold,
  holdWhen,
  flash,
}: {
  look: Look;
  pose: Pose | ((t: number) => Pose);
  phase?: number;
  position?: Vec3;
  rotation?: Vec3;
  scale?: number;
  band?: boolean;
  badge?: boolean;
  hold?: "phone" | "bag";
  holdWhen?: (t: number) => boolean;
  flash?: (t: number) => boolean;
}) {
  const clockRef = useClock();
  const bodyRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const lHipRef = useRef<THREE.Group>(null);
  const lKneeRef = useRef<THREE.Group>(null);
  const rHipRef = useRef<THREE.Group>(null);
  const rKneeRef = useRef<THREE.Group>(null);
  const lShoulderRef = useRef<THREE.Group>(null);
  const lElbowRef = useRef<THREE.Group>(null);
  const rShoulderRef = useRef<THREE.Group>(null);
  const rElbowRef = useRef<THREE.Group>(null);
  const heldRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.MeshBasicMaterial>(null);
  const skin = look.skin ?? C.skin;
  const hairColour = look.hairColour ?? "#16110d";

  useFrame(() => {
    const clock = clockRef.current ?? 0;
    const t = clock + phase;
    const now = typeof pose === "function" ? pose(clock) : pose;
    let lHip = 0, lKnee = 0, rHip = 0, rKnee = 0;
    let lShoulder = 0.05, lElbow = -0.15, rShoulder = 0.05, rElbow = -0.15;
    let lift = 0, nod = 0;
    const breathe = Math.sin(t * 2) * 0.03;

    if (now === "walk") {
      const w = t * 6;
      lHip = Math.sin(w) * 0.5;
      rHip = -lHip;
      lKnee = Math.max(0, Math.sin(w - 1.6)) * 0.9;
      rKnee = Math.max(0, Math.sin(w + Math.PI - 1.6)) * 0.9;
      lShoulder = rHip * 0.7;
      rShoulder = lHip * 0.7;
      lElbow = rElbow = -0.35;
      lift = Math.abs(Math.cos(w)) * 0.05;
    } else if (now === "sit" || now === "desk") {
      lHip = rHip = -1.5;
      lKnee = rKnee = 1.5;
      lift = -0.5;
      if (now === "desk") {
        lShoulder = -0.75 + Math.sin(t * 9) * 0.04;
        rShoulder = -0.75 + Math.sin(t * 9 + 1.5) * 0.04;
        lElbow = rElbow = -0.8;
        nod = 0.15;
      } else {
        lShoulder = rShoulder = -0.35;
        lElbow = rElbow = -0.7;
      }
    } else if (now === "call") {
      rShoulder = -0.35;
      rElbow = -2.35;
      nod = Math.sin(t * 3) * 0.04;
    } else if (now === "phone") {
      rShoulder = -0.55;
      rElbow = -1.25;
      lShoulder = -0.3;
      lElbow = -1.0;
      nod = 0.3;
    } else if (now === "reach") {
      rShoulder = -1.15 + Math.sin(t * 1.6) * 0.15;
      rElbow = -0.35;
      nod = 0.12;
    } else {
      lShoulder = 0.05 + breathe;
      rShoulder = 0.05 - breathe;
    }

    if (bodyRef.current) bodyRef.current.position.y = lift;
    if (torsoRef.current) torsoRef.current.scale.set(1, 1 + breathe * 0.4, 1);
    if (headRef.current) headRef.current.rotation.x = nod;
    if (lHipRef.current) lHipRef.current.rotation.x = lHip;
    if (rHipRef.current) rHipRef.current.rotation.x = rHip;
    if (lKneeRef.current) lKneeRef.current.rotation.x = lKnee;
    if (rKneeRef.current) rKneeRef.current.rotation.x = rKnee;
    if (lShoulderRef.current) lShoulderRef.current.rotation.x = lShoulder;
    if (rShoulderRef.current) rShoulderRef.current.rotation.x = rShoulder;
    if (lElbowRef.current) lElbowRef.current.rotation.x = lElbow;
    if (rElbowRef.current) rElbowRef.current.rotation.x = rElbow;
    if (heldRef.current) heldRef.current.visible = holdWhen ? holdWhen(clock) : true;
    if (screenRef.current && flash) screenRef.current.color.set(flash(clock) && Math.sin(t * 14) > 0 ? C.red : C.cobalt);
  });

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <group ref={bodyRef}>
        <Leg side={1} colour={look.legs ?? C.dim} hipRef={lHipRef} kneeRef={lKneeRef} />
        <Leg side={-1} colour={look.legs ?? C.dim} hipRef={rHipRef} kneeRef={rKneeRef} />
        <group ref={torsoRef} position={[0, 1.4, 0]}>
          <mesh>
            {limb(0.25, 0.42)}
            <meshStandardMaterial color={look.shirt} roughness={0.6} />
          </mesh>
          {badge ? (
            <mesh position={[0.12, 0.12, 0.25]}>
              <boxGeometry args={[0.1, 0.13, 0.02]} />
              <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.5} />
            </mesh>
          ) : null}
        </group>
        <group ref={headRef} position={[0, 1.9, 0]}>
          <mesh position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.2, 24, 24]} />
            <meshStandardMaterial color={skin} roughness={0.55} />
          </mesh>
          {look.hair === "none" ? null : (
            <mesh position={[0, 0.25, -0.03]} scale={[1.05, 0.75, 1.05]}>
              <sphereGeometry args={[0.2, 24, 24, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
              <meshStandardMaterial color={hairColour} roughness={0.8} />
            </mesh>
          )}
          {look.hair === "long" ? (
            <mesh position={[0, 0.02, -0.12]}>
              {limb(0.16, 0.3)}
              <meshStandardMaterial color={hairColour} roughness={0.8} />
            </mesh>
          ) : null}
        </group>

        <Arm side={1} shirt={look.shirt} skin={skin} shoulderRef={lShoulderRef} elbowRef={lElbowRef}>
          {band ? (
            <group position={[0, -0.27, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.085, 0.03, 10, 24]} />
                <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.9} />
              </mesh>
              <Ripple position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} size={0.7} period={1.1} count={2} />
            </group>
          ) : null}
        </Arm>
        <Arm side={-1} shirt={look.shirt} skin={skin} shoulderRef={rShoulderRef} elbowRef={rElbowRef}>
          {hold ? (
            <group ref={heldRef} position={[0, -0.4, 0.04]}>
              {hold === "phone" ? (
                <group rotation={[0.2, 0, 0]}>
                  <mesh>
                    <boxGeometry args={[0.16, 0.3, 0.03]} />
                    <meshStandardMaterial color="#0d0d12" />
                  </mesh>
                  <mesh position={[0, 0, 0.017]}>
                    <planeGeometry args={[0.13, 0.25]} />
                    <meshBasicMaterial ref={screenRef} color={C.cobalt} toneMapped={false} />
                  </mesh>
                </group>
              ) : (
                <mesh position={[0, -0.12, 0]}>
                  <boxGeometry args={[0.26, 0.24, 0.14]} />
                  <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.25} />
                </mesh>
              )}
            </group>
          ) : null}
        </Arm>
      </group>
    </group>
  );
}
