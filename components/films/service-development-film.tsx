"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { C, cycle, Film, Flow, Person, ramp, Screen, useClock } from "./kit";

/**
 * Development, in one square: a developer at a laptop writes code, line by
 * line; the page it builds assembles in a browser window, header, banner
 * and cards in turn, and the same page loads fast on a phone. One build is
 * six seconds.
 */

const PERIOD = 6;
const CODE = [
  { indent: 0, width: 0.9, colour: C.gold },
  { indent: 0.15, width: 1.2, colour: C.blue },
  { indent: 0.3, width: 0.8, colour: C.tint },
  { indent: 0.3, width: 1.0, colour: C.blue },
  { indent: 0.15, width: 0.6, colour: C.gold },
  { indent: 0, width: 0.4, colour: C.tint },
];

/** The laptop, with code typing itself in. */
function Laptop() {
  const clockRef = useClock();
  const lines = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    const c = cycle(clockRef.current ?? 0, PERIOD);
    lines.current.forEach((line, i) => {
      if (!line) return;
      const w = ramp(c, i * 0.45, i * 0.45 + 0.4) * (1 - ramp(c, 5.5, 5.9));
      line.scale.x = Math.max(0.001, w);
      line.position.x = -0.85 + CODE[i].indent + (CODE[i].width * w) / 2;
    });
  });
  return (
    <group position={[-1.5, 0, 0.3]} rotation={[0, 0.35, 0]} scale={0.85}>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[2.4, 0.08, 1.4]} />
        <meshStandardMaterial color={C.navy} metalness={0.4} roughness={0.4} />
      </mesh>
      {[-1, 1].map((x) => (
        <mesh key={x} position={[x * 1, 0.4, 0]}>
          <boxGeometry args={[0.08, 0.8, 1.2]} />
          <meshStandardMaterial color={C.navy} />
        </mesh>
      ))}
      <mesh position={[0, 0.92, 0.2]}>
        <boxGeometry args={[1.6, 0.05, 1]} />
        <meshStandardMaterial color={C.tint} metalness={0.5} roughness={0.3} />
      </mesh>
      <Screen size={[1.9, 1.2]} position={[0, 1.6, -0.35]} rotation={[-0.15, 0, 0]}>
        {CODE.map((line, i) => (
          <mesh
            key={i}
            ref={(el) => {
              lines.current[i] = el;
            }}
            position={[-0.85, 0.45 - i * 0.17, 0.01]}
          >
            <planeGeometry args={[line.width, 0.08]} />
            <meshBasicMaterial color={line.colour} toneMapped={false} />
          </mesh>
        ))}
      </Screen>
    </group>
  );
}

/** One block of a page that pops into place at its moment. */
function Block({ at, position, size, colour }: { at: number; position: [number, number, number]; size: [number, number]; colour: string }) {
  const clockRef = useClock();
  const block = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const c = cycle(clockRef.current ?? 0, PERIOD);
    if (block.current) block.current.scale.setScalar(Math.max(0.001, ramp(c, at, at + 0.35) * (1 - ramp(c, 5.5, 5.9))));
  });
  return (
    <mesh ref={block} position={position}>
      <planeGeometry args={size} />
      <meshBasicMaterial color={colour} toneMapped={false} />
    </mesh>
  );
}

/** The phone's loading bar, filling fast before the page appears. */
function LoadBar() {
  const clockRef = useClock();
  const bar = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const c = cycle(clockRef.current ?? 0, PERIOD);
    const p = ramp(c, 2.8, 3.3) * (1 - ramp(c, 5.5, 5.9));
    if (bar.current) {
      bar.current.scale.x = Math.max(0.001, p);
      bar.current.position.x = -0.35 + (0.7 * p) / 2;
    }
  });
  return (
    <mesh ref={bar} position={[-0.35, 0.72, 0.01]}>
      <planeGeometry args={[0.7, 0.05]} />
      <meshBasicMaterial color={C.gold} toneMapped={false} />
    </mesh>
  );
}

export default function ServiceDevelopmentFilm({ playing }: { playing: boolean }) {
  return (
    <Film playing={playing} start={3.2} halfWidth={3.5} look={[0, 1.8, 0]} elevation={0.05}>
      {/* The developer at the laptop. */}
      <mesh position={[-2.8, 0.45, 1.2]}>
        <boxGeometry args={[0.6, 0.08, 0.6]} />
        <meshStandardMaterial color={C.dim} />
      </mesh>
      <Person look={{ shirt: C.gold, legs: C.navy }} pose="desk" position={[-2.8, 0, 1.4]} rotation={[0, 2.2, 0]} />
      <Laptop />

      {/* The page it builds, in a browser window. */}
      <Flow source={[-1, 1.9, 0.2]} target={[0.6, 2.4, -0.7]} count={6} speed={0.6} arc={0.6} size={0.08} colour={C.gold} shape="cube" />
      <Screen size={[2.6, 2.2]} position={[1.3, 2.4, -0.9]}>
        <Block at={0.3} position={[0, 0.9, 0.01]} size={[2.4, 0.18]} colour={C.tint} />
        <Block at={0.9} position={[0, 0.4, 0.01]} size={[2.4, 0.65]} colour={C.cobalt} />
        <Block at={1.5} position={[-0.8, -0.45, 0.01]} size={[0.7, 0.8]} colour={C.navy} />
        <Block at={1.8} position={[0, -0.45, 0.01]} size={[0.7, 0.8]} colour={C.navy} />
        <Block at={2.1} position={[0.8, -0.45, 0.01]} size={[0.7, 0.8]} colour={C.navy} />
        <Block at={2.4} position={[-0.6, 0.45, 0.02]} size={[1, 0.12]} colour={C.gold} />
      </Screen>

      {/* The same page on a phone, loading fast. */}
      <Screen size={[0.9, 1.7]} position={[2.75, 1.4, 1.1]} rotation={[0, -0.45, 0]}>
        <LoadBar />
        <Block at={3.3} position={[0, 0.35, 0.01]} size={[0.75, 0.45]} colour={C.cobalt} />
        <Block at={3.5} position={[0, -0.15, 0.01]} size={[0.75, 0.35]} colour={C.navy} />
        <Block at={3.7} position={[0, -0.6, 0.01]} size={[0.75, 0.35]} colour={C.navy} />
      </Screen>
    </Film>
  );
}
