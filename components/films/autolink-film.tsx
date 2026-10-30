"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { C, cycle, Film, Flow, Person, ramp, Ripple, Screen, useClock } from "./kit";

/**
 * AutoLink, as one order. Search: an engineer sends a part number from
 * his phone, and one box in a wall of parts lights and lifts out. Quote:
 * a firm quotation is drawn up and stamped. Order: it joins the admin
 * table, and its payment, invoice and challan dots fill one by one.
 * Ship: a van carries the part to a turning globe. One loop is twelve
 * seconds.
 */

const PERIOD = 12;
const searching = (t: number) => cycle(t, PERIOD) < 2.6;
const quoting = (t: number) => {
  const c = cycle(t, PERIOD);
  return c > 2.6 && c < 5;
};
const ordering = (t: number) => {
  const c = cycle(t, PERIOD);
  return c > 4.6 && c < 6.4;
};

const PHONE: [number, number, number] = [-8.8, 1.7, 1];
const WALL_X = -5.4;
const FOUND = { col: 4, row: 2 };
const QUOTE: [number, number, number] = [-1.2, 2.5, 0];
const ADMIN: [number, number, number] = [3.6, 2.6, -1];
const GLOBE: [number, number, number] = [9.6, 1.8, 0];

/** The wall of parts: one box, the part asked for, lights gold and slides out. */
function PartsWall() {
  const clockRef = useClock();
  const found = useRef<THREE.Mesh>(null);
  const foundMat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    const c = cycle(clockRef.current ?? 0, PERIOD);
    const out = ramp(c, 1.4, 2.4) * (1 - ramp(c, 11, 11.8));
    if (found.current) found.current.position.z = 0.25 + out * 0.7;
    foundMat.current?.emissive.set(out > 0.05 ? C.gold : "#000000");
  });
  const cols = 7;
  const rows = 5;
  return (
    <group position={[WALL_X, 0, -1.2]}>
      <mesh position={[0, 1.9, -0.1]}>
        <boxGeometry args={[4.4, 3.4, 0.15]} />
        <meshStandardMaterial color={C.navy} roughness={0.7} />
      </mesh>
      {Array.from({ length: cols * rows }, (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const isFound = col === FOUND.col && row === FOUND.row;
        return (
          <mesh key={i} ref={isFound ? found : undefined} position={[-1.8 + col * 0.6, 0.55 + row * 0.62, 0.25]}>
            <boxGeometry args={[0.48, 0.44, 0.5]} />
            {isFound ? (
              <meshStandardMaterial ref={foundMat} color={C.gold} emissiveIntensity={0.5} />
            ) : (
              <meshStandardMaterial color={[C.cobalt, C.dim, C.tint][(col + row) % 3]} roughness={0.6} />
            )}
          </mesh>
        );
      })}
    </group>
  );
}

/** The quotation: its lines fill in, then the stamp comes down. */
function Quote() {
  const clockRef = useClock();
  const lines = useRef<(THREE.Mesh | null)[]>([]);
  const stamp = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const c = cycle(clockRef.current ?? 0, PERIOD);
    lines.current.forEach((line, i) => {
      if (line) line.scale.x = Math.max(0.001, ramp(c, 2.6 + i * 0.35, 3 + i * 0.35));
    });
    if (stamp.current) stamp.current.scale.setScalar(Math.max(0.001, ramp(c, 4.3, 4.5)));
  });
  return (
    <group position={QUOTE}>
      <mesh>
        <planeGeometry args={[1.5, 1.9]} />
        <meshStandardMaterial color={C.tint} />
      </mesh>
      {[0.6, 0.35, 0.1, -0.15].map((y, i) => (
        <mesh
          key={y}
          ref={(el) => {
            lines.current[i] = el;
          }}
          position={[0, y, 0.01]}
        >
          <planeGeometry args={[1.1 - (i % 2) * 0.3, 0.08]} />
          <meshBasicMaterial color={C.navy} />
        </mesh>
      ))}
      <mesh ref={stamp} position={[0.3, -0.55, 0.02]}>
        <ringGeometry args={[0.2, 0.28, 32]} />
        <meshBasicMaterial color={C.gold} toneMapped={false} />
      </mesh>
      <Ripple position={[0.3, -0.55, 0.05]} colour={C.gold} size={0.8} period={1} count={2} when={(t) => cycle(t, PERIOD) > 4.3 && cycle(t, PERIOD) < 5.3} />
    </group>
  );
}

/** The admin's order table: the new order slides in on top, and its payment, invoice and challan dots fill. */
function OrderTable() {
  const clockRef = useClock();
  const newRow = useRef<THREE.Group>(null);
  const dots = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  useFrame(() => {
    const c = cycle(clockRef.current ?? 0, PERIOD);
    if (newRow.current) newRow.current.scale.set(Math.max(0.001, ramp(c, 5, 5.6)), 1, 1);
    dots.current.forEach((dot, i) => dot?.color.set(c > 6.2 + i * 0.6 ? C.blue : C.dim));
  });
  const row = (y: number, done: boolean) => (
    <>
      <mesh position={[-0.75, y, 0]}>
        <planeGeometry args={[1.6, 0.1]} />
        <meshBasicMaterial color={C.tint} />
      </mesh>
      {[0.55, 0.85, 1.15].map((x) => (
        <mesh key={x} position={[x, y, 0]}>
          <circleGeometry args={[0.08, 20]} />
          <meshBasicMaterial color={done ? C.blue : C.dim} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
  return (
    <Screen size={[3.8, 2.3]} position={ADMIN}>
      <group ref={newRow} position={[0, 0.75, 0]}>
        <mesh position={[-0.75, 0, 0]}>
          <planeGeometry args={[1.6, 0.1]} />
          <meshBasicMaterial color={C.gold} toneMapped={false} />
        </mesh>
        {[0.55, 0.85, 1.15].map((x, i) => (
          <mesh key={x} position={[x, 0, 0]}>
            <circleGeometry args={[0.08, 20]} />
            <meshBasicMaterial
              ref={(el) => {
                dots.current[i] = el;
              }}
              color={C.dim}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      {[0.3, -0.15, -0.6].map((y, i) => (
        <group key={y}>{row(y, i !== 1)}</group>
      ))}
    </Screen>
  );
}

/** The van: it drives the part out towards the globe, then comes round again. */
function Van() {
  const clockRef = useClock();
  const van = useRef<THREE.Group>(null);
  useFrame(() => {
    const c = cycle(clockRef.current ?? 0, PERIOD);
    const go = ramp(c, 7.6, 10.6);
    if (van.current) {
      van.current.position.x = 5.2 + go * 3.4;
      van.current.scale.setScalar(Math.max(0.001, 1 - ramp(c, 10.4, 10.9)));
    }
  });
  return (
    <group ref={van} position={[5.2, 0, 1.6]}>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[1.4, 0.9, 0.8]} />
        <meshStandardMaterial color={C.navy} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0.95, 0.5, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.78]} />
        <meshStandardMaterial color={C.cobalt} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[-0.1, 0.75, 0.41]}>
        <planeGeometry args={[0.7, 0.2]} />
        <meshBasicMaterial color={C.gold} toneMapped={false} />
      </mesh>
      {[-0.45, 0.85].map((x) =>
        [-0.4, 0.4].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.18, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.1, 20]} />
            <meshStandardMaterial color="#0d0d12" />
          </mesh>
        )),
      )}
    </group>
  );
}

/** The world it ships to: a turning wire globe. */
function Globe() {
  const clockRef = useClock();
  const globe = useRef<THREE.Group>(null);
  useFrame(() => {
    if (globe.current) globe.current.rotation.y = (clockRef.current ?? 0) * 0.3;
  });
  return (
    <group ref={globe} position={GLOBE}>
      <mesh>
        <sphereGeometry args={[1.25, 18, 12]} />
        <meshBasicMaterial color={C.tint} wireframe transparent opacity={0.45} />
      </mesh>
      {[
        [0.4, 0.5],
        [1.2, 0.2],
        [2.2, -0.3],
        [3.3, 0.6],
        [4.4, -0.1],
        [5.4, 0.3],
      ].map(([lon, lat]) => (
        <mesh key={lon} position={[Math.cos(lon) * Math.cos(lat) * 1.27, Math.sin(lat) * 1.27, Math.sin(lon) * Math.cos(lat) * 1.27]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshBasicMaterial color={C.gold} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

export default function AutoLinkFilm({ playing }: { playing: boolean }) {
  return (
    <Film playing={playing} start={4.8} look={[0.2, 1.8, 0]}>
      {/* Search: the engineer sends the part number. */}
      <Person look={{ shirt: C.cobalt, legs: C.dim }} pose="phone" position={[-9, 0, 0.6]} rotation={[0, 0.5, 0]} hold="phone" />
      <Ripple position={PHONE} colour={C.blue} size={0.9} period={1.1} when={searching} />
      <Flow source={PHONE} target={[WALL_X + FOUND.col * 0.6 - 1.8, 1.8, -0.4]} count={8} speed={0.6} arc={1} size={0.09} colour={C.blue} when={searching} />
      <PartsWall />

      {/* Quote: the found part becomes a firm quotation. */}
      <Flow source={[WALL_X + 0.6, 1.8, 0]} target={QUOTE} count={6} speed={0.6} arc={0.8} size={0.13} colour={C.gold} shape="cube" when={quoting} />
      <Quote />

      {/* Order: it joins the admin table. */}
      <Flow source={QUOTE} target={ADMIN} count={6} speed={0.7} arc={0.8} size={0.12} colour={C.gold} shape="cube" when={ordering} />
      <OrderTable />

      {/* Ship: out to the world. */}
      <Van />
      <Globe />
    </Film>
  );
}
