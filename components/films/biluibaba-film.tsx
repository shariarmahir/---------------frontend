"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { C, cycle, Film, Flow, GradCap, Person, Screen, useClock } from "./kit";

/**
 * Biluibaba × Study Insights: two companies, one site. On the left a pet
 * parent walks her dog and Biluibaba's four services light in turn; on
 * the right a student in a graduation cap and Study Insights' seven
 * services. Both pages feed the shared site in the middle, where the
 * financial plan turns as a ring chart over the ten-person team the two
 * ventures share, all in front of a wave of light like the site's own.
 */

const PET_PAGE: [number, number, number] = [-5.6, 2.5, -0.8];
const STUDY_PAGE: [number, number, number] = [5.6, 2.5, -0.8];
const HUB: [number, number, number] = [0, 3.1, -1.6];

/** The plan's allocation, as on the site: operations, setup, reserve, recurring. */
const SLICES = [
  { share: 0.75, colour: C.blue },
  { share: 0.176, colour: C.gold },
  { share: 0.051, colour: C.tint },
  { share: 0.023, colour: C.red },
].map((slice, i, all) => ({
  ...slice,
  start: Math.PI / 2 + all.slice(0, i).reduce((sum, s) => sum + s.share, 0) * Math.PI * 2,
  length: slice.share * Math.PI * 2 - 0.04,
}));

/** A field of points rolling like the site's hero wave. */
function Wave() {
  const clockRef = useClock();
  const pointsRef = useRef<THREE.Points>(null);
  const COLS = 70;
  const ROWS = 22;
  const positions = useMemo(() => {
    const p = new Float32Array(COLS * ROWS * 3);
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++) {
        const i = (r * COLS + c) * 3;
        p[i] = -15 + (c / (COLS - 1)) * 30;
        p[i + 2] = -11 + (r / (ROWS - 1)) * 7;
      }
    return p;
  }, []);
  useFrame(() => {
    const pts = pointsRef.current;
    if (!pts) return;
    const t = clockRef.current ?? 0;
    const pos = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < COLS * ROWS; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, 0.9 + 1.1 * Math.sin(x * 0.3 + t * 0.8) * Math.cos(z * 0.45 + t * 0.5));
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={C.blue} size={0.1} transparent opacity={0.8} />
    </points>
  );
}

/** A dog trotting on the spot: body, head, ears, four legs and a wagging tail. */
function Dog({ position, rotation }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const clockRef = useClock();
  const legs = useRef<(THREE.Group | null)[]>([]);
  const tail = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    legs.current.forEach((leg, i) => {
      if (leg) leg.rotation.x = Math.sin(t * 8 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)) * 0.45;
    });
    if (tail.current) tail.current.rotation.y = Math.sin(t * 12) * 0.6;
    if (body.current) body.current.position.y = Math.abs(Math.sin(t * 8)) * 0.04;
  });
  const fur = <meshStandardMaterial color={C.gold} roughness={0.7} />;
  return (
    <group position={position} rotation={rotation}>
      <group ref={body}>
        <mesh position={[0, 0.55, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.2, 0.55, 6, 12]} />
          {fur}
        </mesh>
        <mesh position={[0, 0.82, 0.48]}>
          <sphereGeometry args={[0.19, 20, 20]} />
          {fur}
        </mesh>
        <mesh position={[0, 0.76, 0.66]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial color="#3a2a20" />
        </mesh>
        {[-0.12, 0.12].map((x) => (
          <mesh key={x} position={[x, 0.98, 0.42]} rotation={[0.3, 0, x * 2]}>
            <boxGeometry args={[0.08, 0.18, 0.04]} />
            <meshStandardMaterial color="#3a2a20" />
          </mesh>
        ))}
        <group ref={tail} position={[0, 0.66, -0.45]}>
          <mesh position={[0, 0.1, -0.08]} rotation={[-0.8, 0, 0]}>
            <capsuleGeometry args={[0.04, 0.22, 4, 8]} />
            {fur}
          </mesh>
        </group>
      </group>
      {[
        [0.12, 0.3],
        [-0.12, 0.3],
        [0.12, -0.3],
        [-0.12, -0.3],
      ].map(([x, z], i) => (
        <group
          key={i}
          ref={(el) => {
            legs.current[i] = el;
          }}
          position={[x, 0.42, z]}
        >
          <mesh position={[0, -0.2, 0]}>
            <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
            {fur}
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** A company's page: a grid of service tiles that light one after another. */
function ServicePage({ position, count, columns, colour, offset }: { position: [number, number, number]; count: number; columns: number; colour: string; offset: number }) {
  const clockRef = useClock();
  const tiles = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  useFrame(() => {
    const step = Math.floor(cycle((clockRef.current ?? 0) + offset, count * 0.8) / 0.8);
    tiles.current.forEach((m, i) => m?.color.set(i === step ? colour : C.navy));
  });
  const rows = Math.ceil(count / columns);
  return (
    <Screen size={[3.2, 2]} position={position}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[-1.2 + (i % columns) * (2.4 / (columns - 1)), 0.55 - Math.floor(i / columns) * (1.1 / Math.max(1, rows - 1)), 0.01]}>
          <planeGeometry args={[columns > 2 ? 0.62 : 1.2, rows > 1 ? 0.42 : 0.9]} />
          <meshBasicMaterial
            ref={(el) => {
              tiles.current[i] = el;
            }}
            color={C.navy}
            toneMapped={false}
          />
        </mesh>
      ))}
    </Screen>
  );
}

/** The shared site: the plan as a slowly turning ring chart. */
function Hub() {
  const clockRef = useClock();
  const ring = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ring.current) ring.current.rotation.z = -(clockRef.current ?? 0) * 0.25;
  });
  return (
    <Screen size={[3.8, 2.3]} position={HUB}>
      <group ref={ring} position={[0, 0, 0.01]}>
        {SLICES.map((slice) => (
          <mesh key={slice.colour}>
            <ringGeometry args={[0.55, 0.85, 64, 1, slice.start, slice.length]} />
            <meshBasicMaterial color={slice.colour} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </Screen>
  );
}

export default function BiluibabaFilm({ playing }: { playing: boolean }) {
  return (
    <Film playing={playing} start={2} look={[0, 1.9, 0]}>
      <Wave />

      {/* Biluibaba: a pet parent and her dog. */}
      <Person look={{ shirt: C.tint, hair: "long" }} pose="stand" position={[-9.6, 0, 0.6]} rotation={[0, 0.5, 0]} />
      <Dog position={[-8.3, 0, 1.3]} rotation={[0, 1.3, 0]} />
      <Flow source={[-8.6, 1.4, 1]} target={PET_PAGE} count={9} speed={0.45} arc={1} size={0.1} colour={C.gold} />
      <ServicePage position={PET_PAGE} count={4} columns={2} colour={C.gold} offset={0} />

      {/* Study Insights: a student heading abroad. */}
      <Person look={{ shirt: C.blue }} pose="stand" position={[9.6, 0, 0.6]} rotation={[0, -0.5, 0]} phase={1.1} />
      <GradCap position={[9.6, 2.33, 0.6]} rotation={[0, -0.5, 0]} />
      <Flow source={[9.2, 1.6, 0.8]} target={STUDY_PAGE} count={9} speed={0.45} arc={1} size={0.1} colour={C.blue} />
      <ServicePage position={STUDY_PAGE} count={7} columns={4} colour={C.blue} offset={0.4} />

      {/* One site, one plan, one shared team. */}
      <Flow source={PET_PAGE} target={HUB} count={6} speed={0.35} arc={0.8} size={0.11} colour={C.gold} shape="cube" />
      <Flow source={STUDY_PAGE} target={HUB} count={6} speed={0.35} arc={0.8} size={0.11} colour={C.blue} shape="cube" />
      <Hub />
      {Array.from({ length: 10 }, (_, i) => (
        <Person
          key={i}
          look={{ shirt: i % 2 ? C.cobalt : C.tint, hair: i % 3 ? "short" : "long" }}
          pose="stand"
          position={[-2.25 + i * 0.5, 0, 0.9]}
          scale={0.42}
          phase={i * 0.7}
        />
      ))}
    </Film>
  );
}
