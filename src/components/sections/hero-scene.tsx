"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// Simplified Bangladesh outline points (normalized, illustrative silhouette)
const BD_OUTLINE: [number, number][] = [
  [0.1, 1.5], [0.4, 1.7], [0.6, 1.5], [0.55, 1.1], [0.8, 1.0],
  [0.9, 0.6], [0.7, 0.3], [0.75, -0.2], [0.5, -0.6], [0.55, -1.0],
  [0.3, -1.4], [0.0, -1.5], [-0.3, -1.2], [-0.35, -0.7], [-0.6, -0.4],
  [-0.55, 0.1], [-0.3, 0.4], [-0.4, 0.8], [-0.15, 1.1], [-0.1, 1.4],
];

function BangladeshMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    BD_OUTLINE.forEach(([x, y], i) => {
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.25,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 3,
    });
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
      <mesh ref={meshRef} geometry={geometry} rotation={[0.35, 0, 0]}>
        <meshStandardMaterial color="#006A4E" metalness={0.3} roughness={0.4} />
      </mesh>
    </Float>
  );
}

function Particles({ count }: { count: number }) {
  // Lazy initializer: runs once per mount, not on every render, so the
  // random scatter is stable without violating component purity rules.
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  });

  const colors = count > 60 ? "#F42A41" : "#FF9100";

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color={colors} size={0.035} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

export function HeroScene({ particleCount }: { particleCount: number }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#8fd9c4", "#04261c", 0.6]} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#FFFFFF" />
      <directionalLight position={[-3, -2, -4]} intensity={0.4} color="#F42A41" />
      <BangladeshMesh />
      <Particles key={particleCount} count={particleCount} />
    </Canvas>
  );
}
