"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { C, cycle, Film, Flow, GradCap, Person, ramp, Ripple, useClock } from "./kit";

/**
 * Study Insights, as one student's journey. Choose: a student and a
 * counsellor pick a country on a turning globe. Apply: the documents fly
 * into a folder. Visa: the passport is stamped. Fly: a plane carries the
 * student to a university campus. One loop is twelve seconds.
 */

const PERIOD = 12;
const applying = (t: number) => {
  const c = cycle(t, PERIOD);
  return c > 2.2 && c < 5;
};
const STUDENT: [number, number, number] = [-9.3, 0, 0.6];
const GLOBE: [number, number, number] = [-4.2, 2.4, -0.2];
const FOLDER: [number, number, number] = [-0.2, 2.1, 0.4];
const PASSPORT: [number, number, number] = [3.4, 1.03, 0.6];
const CAMPUS_X = 8.6;

/** The globe, with the countries the site names; the chosen one pings. */
function Globe() {
  const clockRef = useClock();
  const globe = useRef<THREE.Group>(null);
  useFrame(() => {
    if (globe.current) globe.current.rotation.y = (clockRef.current ?? 0) * 0.25;
  });
  const pins: [number, number][] = [
    [0.2, 0.9],
    [0.45, 1.05],
    [0.35, 1.0],
    [0.1, 0.85],
    [0.6, 0.95],
    [0.25, 0.8],
  ];
  return (
    <group ref={globe} position={GLOBE}>
      <mesh>
        <sphereGeometry args={[1.4, 20, 14]} />
        <meshBasicMaterial color={C.tint} wireframe transparent opacity={0.45} />
      </mesh>
      {pins.map(([lon, lat], i) => {
        const p: [number, number, number] = [Math.cos(lon) * Math.cos(lat) * 1.42, Math.sin(lat) * 1.42, Math.sin(lon) * Math.cos(lat) * 1.42];
        return (
          <group key={i} position={p}>
            <mesh>
              <sphereGeometry args={[0.08, 10, 10]} />
              <meshBasicMaterial color={i === 0 ? C.gold : C.blue} toneMapped={false} />
            </mesh>
            {i === 0 ? <Ripple position={[0, 0, 0]} colour={C.gold} size={0.6} period={1.2} count={2} /> : null}
          </group>
        );
      })}
    </group>
  );
}

/** The application folder the documents fly into. */
function Folder() {
  return (
    <group position={FOLDER} scale={1.5}>
      <mesh rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[1.2, 0.85, 0.12]} />
        <meshStandardMaterial color={C.cobalt} roughness={0.5} />
      </mesh>
      <mesh position={[-0.35, 0.47, -0.12]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.4, 0.12, 0.1]} />
        <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/** The passport, lying open, and the visa stamp that comes down on it. */
function Visa() {
  const clockRef = useClock();
  const stamp = useRef<THREE.Group>(null);
  const mark = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const c = cycle(clockRef.current ?? 0, PERIOD);
    const down = ramp(c, 5.2, 5.6) * (1 - ramp(c, 5.8, 6.3));
    if (stamp.current) stamp.current.position.y = 0.7 - down * 0.55;
    if (mark.current) mark.current.scale.setScalar(c > 5.6 ? 1 : 0.001);
  });
  return (
    <group position={PASSPORT} scale={1.3}>
      <mesh>
        <boxGeometry args={[1.5, 0.06, 1]} />
        <meshStandardMaterial color={C.navy} roughness={0.6} />
      </mesh>
      <mesh position={[0.35, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.65, 0.85]} />
        <meshStandardMaterial color={C.tint} />
      </mesh>
      <mesh ref={mark} position={[0.35, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.24, 32]} />
        <meshBasicMaterial color={C.red} toneMapped={false} />
      </mesh>
      <group ref={stamp} position={[0.35, 0.7, 0]}>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.45, 16]} />
          <meshStandardMaterial color={C.gold} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.24, 0.24, 0.1, 24]} />
          <meshStandardMaterial color={C.gold} metalness={0.6} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/** The plane: it takes off from the stamped passport and lands at the campus. */
function Plane() {
  const clockRef = useClock();
  const plane = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = plane.current;
    if (!g) return;
    const c = cycle(clockRef.current ?? 0, PERIOD);
    const p = ramp(c, 6.4, 10.4);
    const x = THREE.MathUtils.lerp(PASSPORT[0] + 0.8, CAMPUS_X - 1.2, p);
    const y = 1.4 + Math.sin(Math.PI * p) * 2.6;
    g.position.set(x, y, 0.4);
    g.rotation.z = Math.cos(Math.PI * p) * 0.45;
    g.scale.setScalar(p > 0.001 && p < 0.999 ? 1 : 0.001);
  });
  return (
    <group ref={plane}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.16, 1, 6, 12]} />
        <meshStandardMaterial color={C.tint} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.35, 0.04, 1.6]} />
        <meshStandardMaterial color={C.cobalt} />
      </mesh>
      <mesh position={[-0.55, 0.22, 0]}>
        <boxGeometry args={[0.25, 0.35, 0.04]} />
        <meshStandardMaterial color={C.gold} />
      </mesh>
    </group>
  );
}

/** The university: steps, a row of columns and a pediment. */
function Campus() {
  return (
    <group position={[CAMPUS_X, 0, -0.8]} scale={0.85}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[3.6, 0.3, 2]} />
        <meshStandardMaterial color={C.tint} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.3, -0.5]}>
        <boxGeometry args={[3.2, 2, 0.9]} />
        <meshStandardMaterial color={C.navy} roughness={0.6} />
      </mesh>
      {[-1.4, -0.7, 0, 0.7, 1.4].map((x) => (
        <mesh key={x} position={[x, 1.3, 0.4]}>
          <cylinderGeometry args={[0.12, 0.12, 2, 16]} />
          <meshStandardMaterial color={C.tint} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[3.5, 0.25, 1.9]} />
        <meshStandardMaterial color={C.cobalt} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.9, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.35, 1]}>
        <coneGeometry args={[2.4, 1.6, 4]} />
        <meshStandardMaterial color={C.cobalt} roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function StudyInsightsFilm({ playing }: { playing: boolean }) {
  return (
    <Film playing={playing} start={5.4} look={[0, 1.8, 0]}>
      {/* Choose: the student and a counsellor pick the country together. */}
      <Person look={{ shirt: C.blue }} pose="stand" position={STUDENT} rotation={[0, 0.6, 0]} />
      <GradCap position={[STUDENT[0], 2.33, STUDENT[2]]} rotation={[0, 0.6, 0]} />
      <Person look={{ shirt: C.tint, hair: "long" }} pose="reach" position={[-7.7, 0, 0.2]} rotation={[0, 0.9, 0]} badge phase={1.3} />
      <Globe />

      {/* Apply: the documents go into the folder. */}
      <Flow source={[-8.9, 1.4, 0.8]} target={FOLDER} count={6} speed={0.5} arc={2.2} size={0.16} colour={C.tint} shape="cube" when={applying} />
      <Folder />

      {/* Visa: the passport is stamped. */}
      <Flow source={FOLDER} target={[PASSPORT[0], 1.4, PASSPORT[2]]} count={4} speed={0.6} arc={0.8} size={0.1} colour={C.gold} when={(t) => cycle(t, PERIOD) > 4.2 && cycle(t, PERIOD) < 5.4} />
      <mesh position={[PASSPORT[0], 0.5, PASSPORT[2]]}>
        <boxGeometry args={[2.4, 1, 1.6]} />
        <meshStandardMaterial color={C.dim} roughness={0.7} />
      </mesh>
      <Visa />

      {/* Fly: off to campus. */}
      <Plane />
      <Campus />
      <Ripple position={[CAMPUS_X - 1.2, 1.4, 0.6]} colour={C.gold} size={1.1} period={1.2} when={(t) => cycle(t, PERIOD) > 10.2} />
    </Film>
  );
}
