"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { C, cycle, Film, Flow, Person, Ripple, Screen, Trace, useClock } from "./kit";

/**
 * Aponjon, read left to right as its four steps. Wear: an elder sits at
 * home with the band on his wrist, his heartbeat scrolling beside him.
 * Detect: the band's chip reads every beat; when the rhythm turns
 * irregular the trace goes red and the chip flags it. Alert: warnings fly
 * to his son's phone and to the village health worker. Act: the clinic
 * lights up, ready for him. One loop is ten seconds.
 */

const PERIOD = 10;
const irregular = (t: number) => {
  const c = cycle(t, PERIOD);
  return c > 3 && c < 5.5;
};
const alerting = (t: number) => cycle(t, PERIOD) > 3.6;
const acting = (t: number) => cycle(t, PERIOD) > 5.8;

const WRIST: [number, number, number] = [-7.2, 1.05, 1];
const CHIP: [number, number, number] = [-1.2, 2.4, 0];
const SON_PHONE: [number, number, number] = [2.8, 1.8, 0.6];
const WORKER: [number, number, number] = [5.6, 1.9, 0.4];
const CLINIC: [number, number, number] = [9.2, 1.6, 0];

/** The band's chip: a small board whose scanning ring turns red while the rhythm is irregular. */
function Chip() {
  const clockRef = useClock();
  const ring = useRef<THREE.Mesh>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    if (ring.current) ring.current.rotation.z = t * 1.6;
    ringMat.current?.color.set(irregular(t) ? C.red : C.gold);
  });
  return (
    <group position={CHIP}>
      <group rotation={[0.5, 0.6, 0]}>
        <mesh>
          <boxGeometry args={[1.1, 0.22, 1.1]} />
          <meshStandardMaterial color={C.navy} metalness={0.6} roughness={0.35} />
        </mesh>
        {/* The pins, running out of both sides. */}
        {[-0.36, -0.12, 0.12, 0.36].map((x) => (
          <mesh key={x} position={[x, 0, 0]}>
            <boxGeometry args={[0.06, 0.05, 1.4]} />
            <meshStandardMaterial color={C.gold} metalness={0.8} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[0.5, 0.04, 0.5]} />
          <meshStandardMaterial color={C.cobalt} emissive={C.cobalt} emissiveIntensity={0.4} />
        </mesh>
      </group>
      <mesh ref={ring}>
        <torusGeometry args={[1.05, 0.03, 8, 64, Math.PI * 1.5]} />
        <meshBasicMaterial ref={ringMat} color={C.gold} toneMapped={false} />
      </mesh>
      <Ripple position={[0, 0, 0]} colour={C.red} size={1.8} period={1.2} when={irregular} />
    </group>
  );
}

/** The clinic at the end of the road: its cross lights once the alert has gone out. */
function Clinic() {
  const clockRef = useClock();
  const cross = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    if (cross.current) cross.current.emissiveIntensity = acting(t) ? 0.9 + 0.3 * Math.sin(t * 4) : 0.08;
  });
  return (
    <group position={[CLINIC[0], 0, CLINIC[2]]}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[2.6, 2.2, 2]} />
        <meshStandardMaterial color={C.navy} metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.35, 0]}>
        <boxGeometry args={[2.9, 0.18, 2.3]} />
        <meshStandardMaterial color={C.cobalt} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.55, 1.01]}>
        <planeGeometry args={[0.7, 1.1]} />
        <meshBasicMaterial color={C.screen} />
      </mesh>
      <group position={[0, 1.6, 1.02]}>
        <mesh>
          <boxGeometry args={[0.5, 0.16, 0.04]} />
          <meshStandardMaterial ref={cross} color={C.red} emissive={C.red} emissiveIntensity={0.08} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.16, 0.5, 0.04]} />
          <meshStandardMaterial color={C.red} emissive={C.red} emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

export default function AponjonFilm({ playing }: { playing: boolean }) {
  return (
    <Film playing={playing} start={3.8} look={[0.8, 1.7, 0]}>
      {/* Wear: the elder at home on his bench, the band on his wrist. */}
      <mesh position={[-7.5, 0.25, 0.2]}>
        <boxGeometry args={[1.6, 0.5, 0.8]} />
        <meshStandardMaterial color={C.dim} roughness={0.7} />
      </mesh>
      <Person
        look={{ shirt: C.tint, hairColour: "#c9c9c9", legs: "#2a3150" }}
        pose="sit"
        position={[-7.5, 0, 0.3]}
        rotation={[0, 0.35, 0]}
        band
      />
      <Screen size={[4.2, 1.5]} position={[-5, 3.7, -0.8]} rotation={[0, 0.15, 0]}>
        <Trace width={3.9} height={1.1} irregular={irregular} />
      </Screen>

      {/* Detect: every beat streams to the band's chip. */}
      <Flow source={WRIST} target={CHIP} count={14} speed={0.5} arc={1.3} size={0.09} colour={C.blue} />
      <Chip />

      {/* Alert: warnings go to the son's phone and the health worker. */}
      <Flow source={CHIP} target={SON_PHONE} count={10} speed={0.55} arc={1.2} size={0.11} colour={C.red} shape="cube" when={alerting} />
      <Flow source={CHIP} target={WORKER} count={10} speed={0.5} arc={1.8} size={0.11} colour={C.red} shape="cube" when={alerting} />
      <Person look={{ shirt: C.cobalt, legs: C.dim }} pose="phone" position={[3, 0, 0.2]} rotation={[0, -0.3, 0]} hold="phone" flash={alerting} phase={1.2} />
      <Person look={{ shirt: C.blue, hair: "long" }} pose="stand" position={[WORKER[0], 0, 0]} rotation={[0, -0.4, 0]} badge phase={2.4} />
      <Ripple position={[WORKER[0], 2.75, 0]} colour={C.red} size={0.9} period={1} when={alerting} />

      {/* Act: they set out for care, and the clinic is ready. */}
      <Flow source={[4.2, 2.6, 0.4]} target={[CLINIC[0], 2.6, 0]} count={8} speed={0.45} arc={1} size={0.12} colour={C.gold} shape="cube" when={acting} />
      <Clinic />
    </Film>
  );
}
