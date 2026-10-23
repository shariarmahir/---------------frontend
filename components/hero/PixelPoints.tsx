'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from './random';

interface PixelPointsProps {
  /** Seconds since the timeline started. */
  time: number;
  /** World bounds the points drift across. */
  bounds: { width: number; height: number };
  /** Desktop gets the full cloud; mobile gets a plain fade instead. */
  enabled: boolean;
  /** Called once the intro finishes so the scene can move on. */
  onComplete: () => void;
}

const INTRO_END = 2.5;
const GOLD = new THREE.Color('#E4B027');

/**
 * A coarse outline of Bangladesh, traced as a point cloud.
 *
 * The shape is a hand-set list of normalised coordinates (roughly the
 * country's outline, north at the top), sampled with a little jitter so
 * the edge reads as drawn rather than stamped.
 */
const OUTLINE: Array<[number, number]> = [
  [0.32, 0.06], [0.38, 0.09], [0.44, 0.07], [0.5, 0.1], [0.56, 0.09],
  [0.62, 0.13], [0.68, 0.12], [0.72, 0.16], [0.78, 0.19], [0.82, 0.24],
  [0.86, 0.3], [0.83, 0.36], [0.88, 0.42], [0.9, 0.48], [0.87, 0.54],
  [0.84, 0.58], [0.79, 0.6], [0.76, 0.66], [0.7, 0.7], [0.66, 0.76],
  [0.6, 0.8], [0.54, 0.86], [0.47, 0.9], [0.42, 0.88], [0.38, 0.82],
  [0.34, 0.76], [0.3, 0.72], [0.25, 0.7], [0.22, 0.64], [0.18, 0.6],
  [0.15, 0.54], [0.12, 0.48], [0.14, 0.42], [0.18, 0.38], [0.2, 0.32],
  [0.24, 0.28], [0.26, 0.22], [0.29, 0.16], [0.3, 0.11],
];

export function PixelPoints({
  time,
  bounds,
  enabled,
  onComplete,
}: PixelPointsProps) {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const completedRef = useRef(false);

  const count = 5200;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const random = mulberry32(0x4b414e44);

    const positions = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const seeds = new Float32Array(count);

    // The outline is scaled to sit in the middle third of the band.
    const outlineW = bounds.width * 0.34;
    const outlineH = bounds.height * 0.62;
    const outlineX = -bounds.width * 0.04;
    const outlineY = -bounds.height * 0.04;

    for (let i = 0; i < count; i++) {
      const seed = random();
      seeds[i] = seed;

      // Start off the left or right edge, drifting inward.
      const fromRight = seed > 0.5;
      const startX = fromRight
        ? bounds.width * (0.55 + random() * 0.3)
        : -bounds.width * (0.55 + random() * 0.3);
      const startY = (random() - 0.5) * bounds.height * 1.1;
      const startZ = -6 - random() * 14;

      positions[i * 3] = startX;
      positions[i * 3 + 1] = startY;
      positions[i * 3 + 2] = startZ;

      // Target: a point on the Bangladesh outline, with a little jitter.
      const edgeIndex = Math.floor(random() * OUTLINE.length);
      const edge = OUTLINE[edgeIndex];
      const next = OUTLINE[(edgeIndex + 1) % OUTLINE.length];
      const t = random();
      const jx = (random() - 0.5) * 0.012;
      const jy = (random() - 0.5) * 0.012;

      targets[i * 3] = outlineX + (edge[0] + (next[0] - edge[0]) * t + jx) * outlineW;
      targets[i * 3 + 1] = outlineY + (edge[1] + (next[1] - edge[1]) * t + jy) * outlineH;
      targets[i * 3 + 2] = (random() - 0.5) * 3;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aTarget", new THREE.BufferAttribute(targets, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    return geo;
  }, [count, bounds.width, bounds.height]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useEffect(() => {
    if (time >= INTRO_END && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [time, onComplete]);

  useFrame(() => {
    const material = materialRef.current;
    if (!material) return;

    const progress = Math.min(time / INTRO_END, 1);
    // The points hold their outline, then dissolve as the tiles arrive.
    material.uniforms.uProgress.value = progress;
    material.uniforms.uTime.value = time;
  });

  if (!enabled) return null;

  return (
    <points frustumCulled={false}>
      <primitive object={geometry} attach="geometry" />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        toneMapped={false}
        uniforms={{
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uColor: { value: GOLD },
          uSize: { value: 1.6 },
        }}
        vertexShader={`
          attribute vec3 aTarget;
          attribute float aSeed;
          uniform float uProgress;
          uniform float uTime;
          uniform float uSize;
          varying float vAlpha;

          void main() {
            // Stagger the arrival so the shape draws in rather than snapping.
            float local = clamp((uProgress - aSeed * 0.35) / 0.65, 0.0, 1.0);
            float eased = 1.0 - pow(1.0 - local, 3.0);

            vec3 pos = mix(position, aTarget, eased);

            // A touch of drift while they are in flight.
            float drift = (1.0 - eased) * 1.6;
            pos.x += sin(uTime * 0.7 + aSeed * 12.0) * drift;
            pos.y += cos(uTime * 0.6 + aSeed * 9.0) * drift;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            gl_PointSize = uSize * (300.0 / -mvPosition.z) * (0.6 + eased * 0.4);

            // Fade out across the last third of the intro.
            vAlpha = smoothstep(1.0, 0.62, uProgress) * smoothstep(0.0, 0.12, uProgress);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            // Square points, not round sprites.
            if (abs(gl_PointCoord.x - 0.5) > 0.5 || abs(gl_PointCoord.y - 0.5) > 0.5) discard;
            gl_FragColor = vec4(uColor, vAlpha);
          }
        `}
      />
    </points>
  );
}
