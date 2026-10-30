"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { C, Film, Flow, Person, Ripple, useClock } from "./kit";

/**
 * AI · LLM · Agents, in one square: a person asks by voice, the question
 * runs through a small neural network whose nodes fire layer by layer,
 * and the answers rise as a chat, the person's lines in gold and the
 * AI's in blue.
 */

const LAYERS = [3, 4, 3];
const NODES = LAYERS.flatMap((n, l) =>
  Array.from({ length: n }, (_, i) => new THREE.Vector3(-1.3 + l * 1.3, 2.2 + (i - (n - 1) / 2) * 0.85, 0)),
);
const PHONE: [number, number, number] = [-2.5, 1.7, 0.6];

/** The network: nodes that light in a wave from input to output, joined by fine lines. */
function Network() {
  const clockRef = useClock();
  const nodes = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const lines = useMemo(() => {
    const points: THREE.Vector3[] = [];
    let start = 0;
    LAYERS.slice(0, -1).forEach((n, l) => {
      const next = start + n;
      for (let a = start; a < next; a++) for (let b = next; b < next + LAYERS[l + 1]; b++) points.push(NODES[a], NODES[b]);
      start = next;
    });
    return new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: C.tint, transparent: true, opacity: 0.35 }),
    );
  }, []);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    nodes.current.forEach((m, i) => {
      if (!m) return;
      const layer = NODES[i].x;
      m.emissiveIntensity = 0.25 + 1.1 * Math.max(0, Math.sin(t * 3 - layer * 1.6));
    });
  });
  return (
    <group>
      <primitive object={lines} />
      {NODES.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.17, 20, 20]} />
          <meshStandardMaterial
            ref={(el) => {
              nodes.current[i] = el;
            }}
            color={C.gold}
            emissive={C.gold}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

/** The chat: bubbles rise and fade, alternating the person's and the AI's. */
function Chat() {
  const clockRef = useClock();
  const bubbles = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const COUNT = 5;
  useFrame(() => {
    const t = clockRef.current ?? 0;
    bubbles.current.forEach((b, i) => {
      if (!b) return;
      const p = (t * 0.22 + i / COUNT) % 1;
      b.position.y = 0.5 + p * 3.6;
      const m = mats.current[i];
      if (m) m.opacity = Math.min(1, p * 6) * Math.min(1, (1 - p) * 4);
    });
  });
  return (
    <group position={[2.45, 0, 0]}>
      {Array.from({ length: COUNT }, (_, i) => {
        const mine = i % 2 === 0;
        return (
          <group
            key={i}
            ref={(el) => {
              bubbles.current[i] = el;
            }}
            position={[mine ? -0.18 : 0.18, 0, 0]}
          >
            <mesh>
              <boxGeometry args={[1.1, 0.36, 0.06]} />
              <meshBasicMaterial
                ref={(el) => {
                  mats.current[i] = el;
                }}
                color={mine ? C.gold : C.blue}
                transparent
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function ServiceAiFilm({ playing }: { playing: boolean }) {
  return (
    <Film playing={playing} start={1.5} halfWidth={3.4} look={[0, 2.2, 0]} elevation={0.04}>
      <Person look={{ shirt: C.blue, hair: "long" }} pose="call" position={[-2.6, 0, 0.3]} rotation={[0, 0.5, 0]} hold="phone" />
      <Ripple position={PHONE} colour={C.gold} size={0.8} period={1.2} />
      <Flow source={PHONE} target={[NODES[1].x, NODES[1].y, 0]} count={6} speed={0.6} arc={0.6} size={0.08} colour={C.gold} />
      <Network />
      <Flow source={[NODES[8].x, NODES[8].y, 0]} target={[1.9, 2.6, 0]} count={6} speed={0.6} arc={0.5} size={0.08} colour={C.blue} />
      <Chat />
    </Film>
  );
}
