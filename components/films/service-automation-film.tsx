"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { C, cycle, Film, ramp, useClock } from "./kit";

/**
 * Automation, in one square: boxes ride a conveyor, a robot arm turns to
 * the belt, picks one up, swings it across and sets it on the pallet,
 * then turns back for the next. A stack light on the cell stays blue
 * while it runs. One pick is four seconds.
 */

const PERIOD = 4;
const BELT_Y = 0.75;
const BOX = 0.42;
const BASE: [number, number, number] = [-0.6, 0, -2.4];

/** Boxes riding the belt from left to right. */
function Conveyor() {
  const clockRef = useClock();
  const boxes = useRef<(THREE.Mesh | null)[]>([]);
  const COUNT = 5;
  const LENGTH = 9;
  useFrame(() => {
    const t = clockRef.current ?? 0;
    boxes.current.forEach((b, i) => {
      if (b) b.position.x = (((t * 0.9 + (i * LENGTH) / COUNT) % LENGTH) + LENGTH) % LENGTH - LENGTH / 2;
    });
  });
  return (
    <group>
      <mesh position={[0, BELT_Y / 2, 0]}>
        <boxGeometry args={[9, BELT_Y, 1.1]} />
        <meshStandardMaterial color={C.navy} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, BELT_Y + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 0.9]} />
        <meshStandardMaterial color={C.dim} roughness={0.8} />
      </mesh>
      {Array.from({ length: COUNT }, (_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            boxes.current[i] = el;
          }}
          position={[0, BELT_Y + BOX / 2, 0]}
        >
          <boxGeometry args={[BOX, BOX, BOX]} />
          <meshStandardMaterial color={C.gold} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

/** The arm: turntable, upper arm, forearm and a gripper that carries a box from belt to pallet. */
function Arm() {
  const clockRef = useClock();
  const turn = useRef<THREE.Group>(null);
  const shoulder = useRef<THREE.Group>(null);
  const elbow = useRef<THREE.Group>(null);
  const carried = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const c = cycle(clockRef.current ?? 0, PERIOD);
    // Down at the belt, up, across to the pallet, down, up, and back.
    const across = ramp(c, 1, 1.8) * (1 - ramp(c, 2.6, 3.5));
    const down = 1 - ramp(c, 0.6, 1) + ramp(c, 1.8, 2.2) * (1 - ramp(c, 2.3, 2.6)) + ramp(c, 3.5, 4);
    const reach = Math.min(1, down);
    if (turn.current) turn.current.rotation.y = across * (Math.PI / 2);
    if (shoulder.current) shoulder.current.rotation.x = 0.35 + reach * 0.55;
    if (elbow.current) elbow.current.rotation.x = 0.9 + reach * 0.35;
    if (carried.current) carried.current.visible = c > 0.85 && c < 2.35;
  });
  const steel = <meshStandardMaterial color={C.tint} metalness={0.6} roughness={0.3} />;
  return (
    <group position={BASE} scale={1.25}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.4, 32]} />
        <meshStandardMaterial color={C.navy} metalness={0.5} roughness={0.4} />
      </mesh>
      <group ref={turn} position={[0, 0.4, 0]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.35, 0.4, 0.6, 24]} />
          <meshStandardMaterial color={C.gold} metalness={0.4} roughness={0.4} />
        </mesh>
        <group ref={shoulder} position={[0, 0.65, 0]}>
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[0.42, 1.6, 0.42]} />
            <meshStandardMaterial color={C.gold} metalness={0.4} roughness={0.4} />
          </mesh>
          <group ref={elbow} position={[0, 1.6, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.2, 0.2, 0.4, 20]} />
              {steel}
            </mesh>
            <mesh position={[0, 0.7, 0]}>
              <boxGeometry args={[0.32, 1.4, 0.32]} />
              <meshStandardMaterial color={C.gold} metalness={0.4} roughness={0.4} />
            </mesh>
            <group position={[0, 1.45, 0]}>
              <mesh>
                <boxGeometry args={[0.5, 0.1, 0.2]} />
                {steel}
              </mesh>
              {[-0.2, 0.2].map((x) => (
                <mesh key={x} position={[x, 0.2, 0]}>
                  <boxGeometry args={[0.06, 0.32, 0.18]} />
                  {steel}
                </mesh>
              ))}
              <mesh ref={carried} position={[0, 0.3, 0]}>
                <boxGeometry args={[BOX * 0.9, BOX * 0.9, BOX * 0.9]} />
                <meshStandardMaterial color={C.gold} roughness={0.6} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

/** The pallet the arm stacks onto, and the cell's stack light. */
function Cell() {
  const clockRef = useClock();
  const light = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (light.current) light.current.emissiveIntensity = 0.6 + 0.5 * Math.sin((clockRef.current ?? 0) * 4);
  });
  return (
    <group>
      <group position={[BASE[0] + 3, 0, BASE[2]]}>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.4, 0.2, 1.2]} />
          <meshStandardMaterial color={C.dim} roughness={0.8} />
        </mesh>
        {[
          [-0.3, 0.41, -0.25],
          [0.3, 0.41, -0.25],
          [-0.3, 0.41, 0.25],
          [0.3, 0.41, 0.25],
          [0, 0.83, 0],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <boxGeometry args={[BOX, BOX, BOX]} />
            <meshStandardMaterial color={C.gold} roughness={0.6} />
          </mesh>
        ))}
      </group>
      <group position={[-2.7, 0, -1.6]}>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.8, 10]} />
          <meshStandardMaterial color={C.tint} />
        </mesh>
        <mesh position={[0, 1.95, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.3, 20]} />
          <meshStandardMaterial ref={light} color={C.blue} emissive={C.blue} emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 2.25, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.3, 20]} />
          <meshStandardMaterial color={C.dim} />
        </mesh>
      </group>
    </group>
  );
}

export default function ServiceAutomationFilm({ playing }: { playing: boolean }) {
  return (
    <Film playing={playing} start={0.9} halfWidth={3.4} look={[0, 1.8, -0.8]} elevation={0.06}>
      <Conveyor />
      <Arm />
      <Cell />
    </Film>
  );
}
