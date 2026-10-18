"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { C, cycle, Film, Flow, Person, ramp, Screen, Silhouette, useClock, type Pose } from "./kit";

/**
 * Smart Pharmacy, read as one visit. The sun charges the panels on the
 * roof, which keep the lights, the kiosk and the medicine fridge running.
 * Walk in: a villager comes to the shop he already uses. Measure: the
 * health worker takes his blood pressure at the kiosk, and it reads high.
 * Consult: a doctor joins on the wall screen. Dispense and follow: the
 * verified medicine is handed over and he walks home with it, while the
 * shop stays linked to the others in the union. One loop is sixteen
 * seconds.
 */

const PERIOD = 16;
const SHOP_X = 1;
const STOP_X = 0.9;
const measuring = (t: number) => {
  const c = cycle(t, PERIOD);
  return c > 5 && c < 7.2;
};
const consulting = (t: number) => {
  const c = cycle(t, PERIOD);
  return c > 7 && c < 10.6;
};
const dispensing = (t: number) => {
  const c = cycle(t, PERIOD);
  return c > 10.4 && c < 12;
};

const KIOSK: [number, number, number] = [2.1, 1.2, 0.55];
const CALL: [number, number, number] = [3.6, 2.15, -2.2];
const SUN: [number, number, number] = [-7.2, 4.7, -4];
const NEIGHBOURS: [number, number, number][] = [
  [8.2, 0, -1.8],
  [10.3, 0, 0.5],
  [12.3, 0, -1.8],
  [7.8, 0, 2.7],
];

const patientPose = (t: number): Pose => {
  const c = cycle(t, PERIOD);
  if (c < 4.5) return "walk";
  if (c > 5 && c < 7.2) return "reach";
  if (c > 12.4) return "walk";
  return "stand";
};

/** The villager: walks in, turns to the counter, holds out his arm, takes the medicine and walks home. */
function Patient() {
  const clockRef = useClock();
  const body = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = body.current;
    if (!g) return;
    const c = cycle(clockRef.current ?? 0, PERIOD);
    const x = c < 4.5 ? THREE.MathUtils.lerp(-10.5, STOP_X, c / 4.5) : c < 12.4 ? STOP_X : THREE.MathUtils.lerp(STOP_X, -10.5, (c - 12.4) / 3.6);
    const turnIn = ramp(c, 4.5, 5);
    const turnOut = ramp(c, 12, 12.4);
    g.position.set(x, 0, 1.55);
    g.rotation.y = Math.PI / 2 + (Math.PI / 2) * turnIn + (Math.PI / 2) * turnOut;
  });
  return (
    <group ref={body}>
      <Person look={{ shirt: C.tint, hairColour: "#3a2a20", legs: "#2a3150" }} pose={patientPose} hold="bag" holdWhen={(t) => cycle(t, PERIOD) > 11.6} />
    </group>
  );
}

/** The blood-pressure kiosk on the counter: its gauge rises while he is measured and settles high, in red. */
function Kiosk() {
  const clockRef = useClock();
  const gauge = useRef<THREE.Mesh>(null);
  const gaugeMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    const c = cycle(clockRef.current ?? 0, PERIOD);
    const level = Math.max(0.02, ramp(c, 5.2, 6.6) * (1 - ramp(c, 14.5, 15.5)));
    if (gauge.current) {
      gauge.current.scale.y = level;
      gauge.current.position.y = -0.13 + (0.26 * level) / 2;
    }
    gaugeMat.current?.color.set(level > 0.75 ? C.red : C.blue);
  });
  return (
    <group position={KIOSK}>
      <mesh>
        <boxGeometry args={[0.6, 0.4, 0.36]} />
        <meshStandardMaterial color={C.navy} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0.19]}>
        <planeGeometry args={[0.44, 0.3]} />
        <meshBasicMaterial color={C.screen} />
      </mesh>
      <mesh ref={gauge} position={[0, -0.13, 0.195]}>
        <planeGeometry args={[0.12, 0.26]} />
        <meshBasicMaterial ref={gaugeMat} color={C.blue} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** The sun, turning slowly; its energy runs to the roof all day. */
function Sun() {
  const clockRef = useClock();
  const ring = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ring.current) ring.current.rotation.z = (clockRef.current ?? 0) * 0.4;
  });
  return (
    <group position={SUN}>
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color={C.gold} toneMapped={false} />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[0.9, 0.025, 8, 12]} />
        <meshBasicMaterial color={C.gold} toneMapped={false} wireframe />
      </mesh>
    </group>
  );
}

/** The medicine fridge, its cold light breathing steadily through the day. */
function Fridge() {
  const clockRef = useClock();
  const light = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (light.current) light.current.emissiveIntensity = 0.6 + 0.4 * Math.sin((clockRef.current ?? 0) * 2);
  });
  return (
    <group position={[5.1, 0, -1.4]}>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.95, 2, 0.8]} />
        <meshStandardMaterial color={C.cobalt} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0.32, 1.15, 0.41]}>
        <boxGeometry args={[0.05, 0.6, 0.04]} />
        <meshStandardMaterial color={C.tint} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[-0.2, 1.75, 0.41]}>
        <boxGeometry args={[0.3, 0.12, 0.02]} />
        <meshStandardMaterial ref={light} color={C.blue} emissive={C.blue} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

const MEDICINE = [C.blue, C.gold, C.tint, C.red, C.cobalt, C.gold, C.blue, C.tint];

/** The shop itself: floor, back wall with stocked shelves, roof with solar panels, counter and pillars. */
function Shop() {
  return (
    <group>
      <mesh position={[SHOP_X, 0.06, -0.3]}>
        <boxGeometry args={[8.4, 0.12, 4.4]} />
        <meshStandardMaterial color={C.dim} roughness={0.8} />
      </mesh>
      <mesh position={[SHOP_X, 1.65, -2.45]}>
        <boxGeometry args={[8.4, 3.3, 0.15]} />
        <meshStandardMaterial color={C.navy} roughness={0.7} />
      </mesh>
      <mesh position={[SHOP_X, 3.38, -0.3]}>
        <boxGeometry args={[8.8, 0.16, 4.8]} />
        <meshStandardMaterial color={C.cobalt} roughness={0.5} />
      </mesh>
      {[-3, 5].map((x) => (
        <mesh key={x} position={[x, 1.7, 1.8]}>
          <boxGeometry args={[0.16, 3.3, 0.16]} />
          <meshStandardMaterial color={C.navy} />
        </mesh>
      ))}

      {/* Solar panels on the roof, tilted to the sun. */}
      {[-1.6, 1, 3.6].map((x) => (
        <group key={x} position={[x, 3.75, -0.4]} rotation={[0.45, 0, 0]}>
          <mesh>
            <boxGeometry args={[2.2, 0.06, 1.5]} />
            <meshStandardMaterial color={C.cobalt} metalness={0.6} roughness={0.25} emissive={C.cobalt} emissiveIntensity={0.25} />
          </mesh>
          {[-0.55, 0, 0.55].map((dx) => (
            <mesh key={dx} position={[dx, 0.04, 0]}>
              <boxGeometry args={[0.02, 0.01, 1.5]} />
              <meshBasicMaterial color={C.gold} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Shelves of verified medicine. */}
      {[0.95, 1.65, 2.35].map((y, row) => (
        <group key={y} position={[0.2, y, -2.15]}>
          <mesh>
            <boxGeometry args={[3.8, 0.06, 0.45]} />
            <meshStandardMaterial color={C.tint} roughness={0.6} />
          </mesh>
          {MEDICINE.map((_, i) => (
            <mesh key={i} position={[-1.6 + i * 0.45, 0.2, 0]}>
              <boxGeometry args={[0.3, 0.34 + ((i + row) % 3) * 0.06, 0.3]} />
              <meshStandardMaterial color={MEDICINE[(i + row * 3) % MEDICINE.length]} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* The counter. */}
      <mesh position={[SHOP_X + 0.4, 0.5, 0.55]}>
        <boxGeometry args={[3.6, 1, 0.8]} />
        <meshStandardMaterial color={C.navy} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[SHOP_X + 0.4, 1.02, 0.55]}>
        <boxGeometry args={[3.8, 0.05, 0.9]} />
        <meshStandardMaterial color={C.tint} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** Another Smart Pharmacy in the union, linked to this one. */
function Neighbour({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1, 0.8, 0.9]} />
        <meshStandardMaterial color={C.navy} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.85, 0.5, 4]} />
        <meshStandardMaterial color={C.cobalt} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.45, 0.46]}>
        <planeGeometry args={[0.24, 0.24]} />
        <meshBasicMaterial color={C.gold} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function PharmacyFilm({ playing }: { playing: boolean }) {
  return (
    <Film playing={playing} start={5.6} look={[1.4, 2, 0]}>
      {/* Power: the sun charges the roof all day. */}
      <Sun />
      <Flow source={SUN} target={[0, 3.9, -0.4]} count={12} speed={0.35} arc={0.8} size={0.08} colour={C.gold} />

      <Shop />
      <Fridge />
      <Kiosk />

      {/* Walk in, then measure: the health worker reaches to the kiosk with him. */}
      <Patient />
      <Person
        look={{ shirt: C.blue, hair: "long" }}
        pose={(t) => (measuring(t) || dispensing(t) ? "reach" : "stand")}
        position={[SHOP_X + 2, 0.12, -0.6]}
        badge
        phase={1.5}
      />

      {/* Consult: the reading goes to the doctor on the wall screen. */}
      <Flow source={KIOSK} target={CALL} count={8} speed={0.6} arc={0.8} size={0.08} colour={C.blue} shape="cube" when={consulting} />
      <Screen size={[1.8, 1.15]} position={CALL} lit={consulting}>
        <Silhouette position={[0, -0.05, 0]} scale={0.8} />
      </Screen>

      {/* Dispense: verified medicine comes off the shelf to the counter. */}
      <Flow source={[0.2, 1.9, -2]} target={[STOP_X, 1.15, 0.9]} count={4} speed={0.7} arc={0.6} size={0.16} colour={C.gold} shape="cube" when={dispensing} />

      {/* Follow: the shop stays linked to the others in the union. */}
      {NEIGHBOURS.map((n) => (
        <group key={n.join()}>
          <Neighbour position={n} />
          <Flow source={[5.4, 2.6, -1]} target={[n[0], 1.2, n[2]]} count={5} speed={0.3} arc={1.2} size={0.07} colour={C.blue} />
        </group>
      ))}
    </Film>
  );
}
