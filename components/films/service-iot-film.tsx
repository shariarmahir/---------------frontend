"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import { C, Flow, Film, Ripple, Screen, useClock } from "./kit";

/**
 * IoT Solutions, in one square: sensor posts stand in a field and by a
 * river, one on its own solar panel, each pulsing as it reads. Their
 * signals hop to a gateway tower whose light blinks, and on to a phone
 * whose bars redraw, while the house without power stays dark.
 */

const SENSORS: [number, number, number][] = [
  [-2.6, 0, 0.8],
  [-1.3, 0, -1.2],
  [-0.2, 0, 1.3],
  [1, 0, -0.4],
];
const TOWER: [number, number, number] = [2.4, 0, -1];
const TOWER_TOP: [number, number, number] = [2.4, 3.5, -1];
const PHONE: [number, number, number] = [2.65, 2.2, 1.4];

/** A sensor post: pole, sensor box, antenna, and its pulse. */
function Sensor({ position, solar = false, phase }: { position: [number, number, number]; solar?: boolean; phase: number }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 10]} />
        <meshStandardMaterial color={C.tint} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.36, 0.3, 0.24]} />
        <meshStandardMaterial color={C.cobalt} metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0.1, 1.6, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.45, 6]} />
        <meshStandardMaterial color={C.tint} />
      </mesh>
      {solar ? (
        <mesh position={[0, 1.5, -0.3]} rotation={[0.6, 0, 0]}>
          <boxGeometry args={[0.7, 0.03, 0.5]} />
          <meshStandardMaterial color={C.cobalt} emissive={C.cobalt} emissiveIntensity={0.3} metalness={0.6} roughness={0.25} />
        </mesh>
      ) : null}
      <group position={[0.1, 1.85, 0]}>
        <Ripple position={[0, 0, 0]} colour={C.gold} size={0.9} period={1.6} count={2} when={(t) => Math.sin(t * 1.5 + phase) > -0.2} />
      </group>
    </group>
  );
}

/** The gateway tower, its light blinking as signals land. */
function Tower() {
  const clockRef = useClock();
  const light = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    if (light.current) light.current.emissiveIntensity = Math.sin((clockRef.current ?? 0) * 6) > 0 ? 1.2 : 0.15;
  });
  return (
    <group position={TOWER}>
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x * 0.6, 1.6, 0]} rotation={[0, 0, -x * 0.25]}>
          <boxGeometry args={[0.08, 3.3, 0.08]} />
          <meshStandardMaterial color={C.tint} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {[0.6, 1.4, 2.2].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[0.36 - y * 0.08, 0.05, 0.05]} />
          <meshStandardMaterial color={C.tint} />
        </mesh>
      ))}
      <mesh position={[0, 3.4, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial ref={light} color={C.red} emissive={C.red} emissiveIntensity={1} />
      </mesh>
    </group>
  );
}

/** The phone the readings reach: bars that redraw as each one comes in. */
function PhoneChart() {
  const clockRef = useClock();
  const bars = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    const t = clockRef.current ?? 0;
    bars.current.forEach((bar, i) => {
      if (!bar) return;
      const h = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 1.1));
      bar.scale.y = h;
      bar.position.y = -0.45 + h / 2;
    });
  });
  return (
    <Screen size={[1, 1.7]} position={PHONE} rotation={[0, -0.4, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          ref={(el) => {
            bars.current[i] = el;
          }}
          position={[-0.3 + i * 0.2, -0.2, 0.01]}
        >
          <planeGeometry args={[0.12, 1]} />
          <meshBasicMaterial color={i === 2 ? C.gold : C.blue} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[0, 0.55, 0.01]}>
        <planeGeometry args={[0.7, 0.12]} />
        <meshBasicMaterial color={C.tint} />
      </mesh>
    </Screen>
  );
}

export default function ServiceIotFilm({ playing }: { playing: boolean }) {
  return (
    <Film playing={playing} start={1.2} halfWidth={3.5} look={[0, 1.7, 0]} elevation={0.07}>
      {/* The field and the river. */}
      {[
        [-2, -0.4],
        [-0.4, -1.6],
        [0.6, 0.9],
      ].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.8, 1.5]} />
          <meshStandardMaterial color={C.dim} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[-1.2, 0.03, 2.4]} rotation={[-Math.PI / 2, 0, 0.15]}>
        <planeGeometry args={[9, 0.9]} />
        <meshStandardMaterial color={C.cobalt} emissive={C.cobalt} emissiveIntensity={0.3} roughness={0.2} />
      </mesh>

      {/* The house that has no power tonight. */}
      <group position={[-2.6, 0, -2]}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.1, 0.9, 0.9]} />
          <meshStandardMaterial color={C.navy} roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.15, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.9, 0.55, 4]} />
          <meshStandardMaterial color={C.dim} roughness={0.7} />
        </mesh>
      </group>

      {SENSORS.map((p, i) => (
        <group key={p.join()}>
          <Sensor position={p} solar={i === 1} phase={i * 1.4} />
          <Flow source={[p[0] + 0.1, 1.8, p[2]]} target={TOWER_TOP} count={4} speed={0.45} arc={1} size={0.07} colour={C.gold} />
        </group>
      ))}
      <Tower />
      <Flow source={TOWER_TOP} target={PHONE} count={5} speed={0.6} arc={0.4} size={0.08} colour={C.blue} shape="cube" />
      <PhoneChart />
    </Film>
  );
}
