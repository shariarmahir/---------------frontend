'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { mulberry32, seedFromString } from './random';
import {
  FRAME_THICKNESS_PX,
  GROUP_Z,
  SCALE,
  tileToWorld,
  type TileGroup,
} from './collage-layout';

interface TileProps {
  id: string;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  group: TileGroup;
  /** Position in the left-to-right reveal order. */
  revealIndex: number;
  /** Seconds since the timeline started, read from the master clock. */
  time: number;
  /** 0 to 1 across the camera pan, for the parallax drift. */
  panProgress: number;
  /** Master clock phase name. */
  phase: string;
  isMobile: boolean;
}

const GOLD = new THREE.Color('#E4B027');

/** Tiles whose surfaces get the soft water/rain ripple. */
const RIPPLE_TILES = new Set([
  'rickshaw-rain',
  'flood-women',
  'lily-boat-girl',
  'honey-collector',
]);

const REVEAL_START = 2.5;
const REVEAL_STAGGER = 0.04;
const REVEAL_LENGTH = 0.8;

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 4);
}

export function Tile({
  id,
  src,
  x,
  y,
  w,
  h,
  group,
  revealIndex,
  time,
  panProgress,
  phase,
  isMobile,
}: TileProps) {
  const loaded = useTexture(src);

  // Clone the shared texture so the per-tile settings (colour space,
  // anisotropy) can be set without touching the loader's cache. The clone
  // shares the underlying image, so the GPU still uploads it once.
  const texture = useMemo(() => {
    const map = loaded.clone();
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 4;
    map.generateMipmaps = true;
    map.minFilter = THREE.LinearMipmapLinearFilter;
    map.magFilter = THREE.LinearFilter;
    map.needsUpdate = true;
    return map;
  }, [loaded]);
  const groupRef = useRef<THREE.Group | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const frameMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  const { width, height, centerX, centerY } = useMemo(
    () => tileToWorld({ x, y, w, h }),
    [x, y, w, h],
  );

  const z = GROUP_Z[group];
  const hasRipple = RIPPLE_TILES.has(id) && group !== 'archive';
  const shimmerPhase = useMemo(
    () => mulberry32(seedFromString(id))() * Math.PI * 2,
    [id],
  );

  // ── Texture setup ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  // ── Ripple shader injection (rural only) ─────────────────────────
  useEffect(() => {
    const material = materialRef.current;
    if (!material || !hasRipple) return;

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uAmp = { value: 0.0035 };
      shader.uniforms.uPhase = { value: shimmerPhase };
      material.userData.shader = shader;

      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying vec2 vRippleUv;',
        )
        .replace(
          '#include <uv_vertex>',
          '#include <uv_vertex>\nvRippleUv = uv;',
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float uTime;\nuniform float uAmp;\nuniform float uPhase;\nvarying vec2 vRippleUv;',
        )
        .replace(
          '#include <map_fragment>',
          `
          vec2 rippleUv = vRippleUv + vec2(
            sin(vRippleUv.y * 46.0 + uTime * 1.4 + uPhase) * uAmp,
            cos(vRippleUv.x * 38.0 + uTime * 1.1 + uPhase) * uAmp * 0.6
          );
          vec4 sampledDiffuseColor = texture2D( map, rippleUv );
          diffuseColor *= sampledDiffuseColor;
          `,
        );
    };
    material.needsUpdate = true;

    return () => {
      material.onBeforeCompile = () => {};
      material.userData.shader = undefined;
    };
  }, [hasRipple, shimmerPhase]);

  // ── Gold frame geometry: a ring of four quads, swept by distance ─
  const frameGeometry = useMemo(() => {
    const t = FRAME_THICKNESS_PX * SCALE;
    const hw = width / 2;
    const hh = height / 2;

    // Each side is a quad. `aDist` runs 0 -> 1 around the ring so a single
    // uniform can sweep the whole frame on.
    const sides: Array<[number, number, number, number, number, number, number]> = [
      // [x0,y0, x1,y1, d0, d1, thicknessAxis]
      [-hw, -hh, hw, -hh, 0.0, 0.25, 0], // bottom
      [hw, -hh, hw, hh, 0.25, 0.5, 1], // right
      [hw, hh, -hw, hh, 0.5, 0.75, 0], // top
      [-hw, hh, -hw, -hh, 0.75, 1.0, 1], // left
    ];

    const positions: number[] = [];
    const dists: number[] = [];
    const indices: number[] = [];

    sides.forEach(([x0, y0, x1, y1, d0, d1]) => {
      const dx = x1 - x0;
      const dy = y1 - y0;
      const len = Math.hypot(dx, dy);
      const nx = (-dy / len) * (t / 2);
      const ny = (dx / len) * (t / 2);

      const base = positions.length / 3;
      positions.push(
        x0 + nx, y0 + ny, 0,
        x0 - nx, y0 - ny, 0,
        x1 - nx, y1 - ny, 0,
        x1 + nx, y1 + ny, 0,
      );
      dists.push(d0, d0, d1, d1);
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('aDist', new THREE.Float32BufferAttribute(dists, 1));
    geo.setIndex(indices);
    return geo;
  }, [width, height]);

  useEffect(() => {
    return () => {
      frameGeometry.dispose();
    };
  }, [frameGeometry]);

  // ── Per-frame motion ─────────────────────────────────────────────
  useFrame((state) => {
    const tileGroup = groupRef.current;
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!tileGroup || !mesh || !material) return;

    // Reveal: staggered left to right, 40ms apart, 1.04 -> 1.0.
    const revealStart = REVEAL_START + revealIndex * REVEAL_STAGGER;
    const revealT = Math.min(Math.max((time - revealStart) / REVEAL_LENGTH, 0), 1);
    const revealed = easeOutQuint(revealT);

    material.opacity = revealed;
    const scale = 1.04 - revealed * 0.04;
    mesh.scale.setScalar(scale);

    // Gold frame draws in as a sweep around the ring.
    const frameMaterial = frameMaterialRef.current;
    if (frameMaterial) {
      frameMaterial.uniforms.uProgress.value = revealed;
    }

    // Ripple clock, only on the rural water/rain tiles.
    const shader = material.userData.shader as
      | { uniforms: { uTime: { value: number } } }
      | undefined;
    if (shader) {
      shader.uniforms.uTime.value = state.clock.getElapsedTime();
    }

    // Camera pan parallax: deeper groups slide a little more.
    if (phase === 'camera-pan' || phase === 'settle' || phase === 'idle') {
      const drift = panProgress * z * 0.9;
      tileGroup.position.x = centerX + drift;
    } else {
      tileGroup.position.x = centerX;
    }
    tileGroup.position.y = centerY;

    // Per-group motion, applied only once the tile is on screen.
    if (revealed > 0.99) {
      const t = state.clock.getElapsedTime();

      if (group === 'archive') {
        // Historical material: a slow, straight push-in and nothing else.
        const push = 1.02 + 0.03 * Math.min(1, Math.max(panProgress, 0));
        mesh.scale.setScalar(scale * push);
      } else if (group === 'youth') {
        // Ken Burns plus a faint 2 degree tilt.
        const kb = 1.0 + 0.06 * Math.min(1, Math.max(panProgress, 0));
        mesh.scale.setScalar(scale * kb);
        mesh.rotation.z = Math.sin(t * 0.25 + revealIndex) * (2 * Math.PI / 180);
        tileGroup.position.x += Math.sin(t * 0.3 + revealIndex) * width * 0.008;
        tileGroup.position.y += Math.cos(t * 0.22 + revealIndex) * height * 0.008;
      } else {
        // Rural: very slow Ken Burns with a one percent drift.
        const kb = 1.0 + 0.06 * Math.min(1, Math.max(panProgress, 0));
        mesh.scale.setScalar(scale * kb);
        tileGroup.position.x += Math.sin(t * 0.2 + revealIndex) * width * 0.01;
        tileGroup.position.y += Math.cos(t * 0.16 + revealIndex) * height * 0.01;
      }
    }
  });

  return (
    <group ref={groupRef} position={[centerX, centerY, z]}>
      <mesh ref={meshRef} scale={1.04}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          ref={materialRef}
          map={texture}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {!isMobile && (
        <mesh geometry={frameGeometry} position={[0, 0, 0.002]}>
          <shaderMaterial
            ref={frameMaterialRef}
            vertexShader={`
              attribute float aDist;
              varying float vDist;
              void main() {
                vDist = aDist;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              }
            `}
            fragmentShader={`
              uniform float uProgress;
              uniform vec3 uColor;
              varying float vDist;
              void main() {
                if (vDist > uProgress) discard;
                gl_FragColor = vec4(uColor, 1.0);
              }
            `}
            uniforms={{
              uProgress: { value: 0 },
              uColor: { value: GOLD },
            }}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}
