"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { C, cycle, Film, Flow, Person, ramp, Ripple, Screen, Silhouette, useClock } from "./kit";

/**
 * SWASTI, read left to right as its four steps. Ask: a mother speaks into
 * her phone about her child's fever, and her voice travels out. Check:
 * the guidance pages gather round SWASTI's core and the risk check
 * settles on "go today". Connect: a doctor takes the call. Follow: the
 * prescription becomes a new card in her health record and comes back to
 * her phone. One loop is eleven seconds.
 */

const PERIOD = 11;
const asking = (t: number) => cycle(t, PERIOD) < 3.4;
const connecting = (t: number) => {
  const c = cycle(t, PERIOD);
  return c > 4.4 && c < 8.2;
};
const recording = (t: number) => cycle(t, PERIOD) > 6.8;
const returning = (t: number) => cycle(t, PERIOD) > 8.4;

const PHONE: [number, number, number] = [-9.1, 1.75, 0.55];
const CORE: [number, number, number] = [-2.4, 2.9, 0];
const CALL: [number, number, number] = [3.6, 3.15, -1.4];
const RECORD_X = 9.8;

/** SWASTI's core: the guidance pages circle it and draw in while the question is checked. */
function Core() {
  const clockRef = useClock();
  const core = useRef<THREE.Mesh>(null);
  const pages = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    const c = cycle(t, PERIOD);
    core.current?.rotation.set(t * 0.4, t * 0.6, 0);
    if (pages.current) {
      pages.current.rotation.y = t * 0.5;
      const pull = 1 - 0.35 * ramp(c, 2.2, 3.2) * (1 - ramp(c, 4.6, 5.4));
      pages.current.scale.set(pull, 1, pull);
    }
  });
  return (
    <group position={CORE}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={C.gold} emissive={C.gold} emissiveIntensity={0.9} wireframe />
      </mesh>
      <group ref={pages}>
        {Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <group key={i} position={[Math.cos(a) * 1.6, Math.sin(a * 2) * 0.25, Math.sin(a) * 1.6]} rotation={[0, -a + Math.PI / 2, 0]}>
              <mesh>
                <planeGeometry args={[0.46, 0.6]} />
                <meshStandardMaterial color={C.tint} side={THREE.DoubleSide} />
              </mesh>
              {[0.14, 0.02, -0.1].map((y) => (
                <mesh key={y} position={[0, y, 0.005]}>
                  <planeGeometry args={[0.32, 0.04]} />
                  <meshBasicMaterial color={C.navy} side={THREE.DoubleSide} />
                </mesh>
              ))}
            </group>
          );
        })}
      </group>
    </group>
  );
}

/** The risk check: rest at home, go today, emergency. The marker settles on "go today". */
function Triage() {
  const clockRef = useClock();
  const marker = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const c = cycle(clockRef.current ?? 0, PERIOD);
    if (marker.current) marker.current.position.x = -1.05 + 1.05 * ramp(c, 2.6, 4.2);
  });
  return (
    <group position={[CORE[0], 0.95, 0.9]}>
      {[C.blue, C.gold, C.red].map((colour, i) => (
        <mesh key={colour} position={[-1.05 + i * 1.05, 0, 0]}>
          <boxGeometry args={[0.98, 0.16, 0.16]} />
          <meshStandardMaterial color={colour} emissive={colour} emissiveIntensity={0.35} />
        </mesh>
      ))}
      <mesh ref={marker} position={[-1.05, 0.3, 0]}>
        <coneGeometry args={[0.15, 0.3, 24]} />
        <meshStandardMaterial color={C.tint} emissive={C.tint} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/** The health record: one card per visit; the newest arrives with the prescription. */
function Record() {
  const clockRef = useClock();
  const newest = useRef<THREE.Group>(null);
  useFrame(() => {
    const c = cycle(clockRef.current ?? 0, PERIOD);
    if (newest.current) newest.current.scale.setScalar(Math.max(0.001, ramp(c, 7.2, 8.2)));
  });
  const card = (y: number, accent: string) => (
    <>
      <mesh position={[0, y, 0]}>
        <boxGeometry args={[1.9, 0.44, 0.06]} />
        <meshStandardMaterial color={C.navy} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[-0.68, y, 0.04]}>
        <circleGeometry args={[0.11, 24]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      {[0.07, -0.07].map((dy, k) => (
        <mesh key={dy} position={[0.12, y + dy, 0.04]}>
          <planeGeometry args={[k ? 0.8 : 1.1, 0.05]} />
          <meshBasicMaterial color={C.tint} />
        </mesh>
      ))}
    </>
  );
  return (
    <group position={[RECORD_X, 0, 0]} rotation={[0, -0.35, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <group key={i}>{card(0.6 + i * 0.58, i % 2 ? C.blue : C.tint)}</group>
      ))}
      <group ref={newest} position={[0, 0.6 + 4 * 0.58, 0]}>
        {card(0, C.gold)}
      </group>
    </group>
  );
}

export default function SwastiFilm({ playing }: { playing: boolean }) {
  return (
    <Film playing={playing} start={2.8} look={[0, 1.8, 0]}>
      {/* Ask: the mother speaks into her phone; her child has a fever. */}
      <Person look={{ shirt: C.tint, hair: "long" }} pose="call" position={[-9, 0, 0.3]} rotation={[0, 0.45, 0]} hold="phone" />
      <Person look={{ shirt: C.gold, legs: C.navy }} pose="stand" position={[-10.4, 0, 0.6]} rotation={[0, 0.3, 0]} scale={0.62} phase={0.8} />
      <Ripple position={[-10.4, 1.62, 0.6]} colour={C.red} size={0.5} period={1.3} count={2} />
      <Ripple position={PHONE} colour={C.gold} size={1.1} period={1.2} when={asking} />
      <Flow source={PHONE} target={CORE} count={12} speed={0.55} arc={1.4} size={0.1} colour={C.gold} when={asking} />

      {/* Check: guidance gathers round the core, and the risk is scored. */}
      <Core />
      <Triage />

      {/* Connect: a doctor takes the call. */}
      <Flow source={CORE} target={CALL} count={10} speed={0.5} arc={1} size={0.11} colour={C.blue} shape="cube" when={connecting} />
      <Screen size={[3, 1.7]} position={CALL} lit={connecting}>
        <Silhouette position={[-0.6, -0.05, 0]} scale={1.1} />
        <Silhouette position={[0.95, 0.35, 0]} scale={0.55} colour={C.gold} />
      </Screen>
      <mesh position={[3.6, 0.45, 0]}>
        <boxGeometry args={[0.7, 0.08, 0.7]} />
        <meshStandardMaterial color={C.dim} />
      </mesh>
      <Person look={{ shirt: C.blue }} pose="desk" position={[3.6, 0, 0.05]} phase={0.4} />
      <mesh position={[3.6, 0.82, 0.95]}>
        <boxGeometry args={[2.2, 0.08, 0.9]} />
        <meshStandardMaterial color={C.navy} metalness={0.3} roughness={0.5} />
      </mesh>
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[3.6 + x, 0.4, 0.95]}>
          <boxGeometry args={[0.08, 0.8, 0.8]} />
          <meshStandardMaterial color={C.navy} />
        </mesh>
      ))}

      {/* Follow: the prescription lands in the record and returns to her phone. */}
      <Flow source={[4.6, 1.6, 1]} target={[RECORD_X, 3, 0]} count={8} speed={0.5} arc={1} size={0.12} colour={C.gold} shape="cube" when={recording} />
      <Record />
      <Flow source={[RECORD_X - 0.8, 3.4, 0]} target={PHONE} count={10} speed={0.32} arc={3.2} size={0.1} colour={C.gold} when={returning} />
    </Film>
  );
}
