'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Tile } from './Tile';
import { PixelPoints } from './PixelPoints';
import { useHeroTimeline, phaseAt, SCRIPTED_DURATION } from './useHeroTimeline';
import {
  COLLAGE_WORLD_HEIGHT,
  COLLAGE_WORLD_WIDTH,
  type TileData,
} from './collage-layout';

interface CollageSceneProps {
  tiles: TileData[];
  isMobile: boolean;
  /** False when the hero scrolls out of view: the loop stops. */
  isVisible?: boolean;
  onReady: () => void;
  onPhaseChange?: (phase: string) => void;
}

/** Camera distance. At fov 35 this frames roughly 40% of the collage. */
const CAMERA_Z = 26;
const PAN_START = 26;
const PAN_END = -26;

/** Tiles that get the water/rain ripple are marked in Tile.tsx. */
function SceneInner({
  tiles,
  isMobile,
  onReady,
  onPhaseChange,
}: CollageSceneProps) {
  const { gl } = useThree();
  void gl;

  const { clock } = useHeroTimeline({ autoPlay: true });
  const [time, setTime] = useState(0);
  const [phase, setPhase] = useState('pixel-intro');
  const [panProgress, setPanProgress] = useState(0);
  const lastPhaseRef = useRef<string>('');
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerTargetRef = useRef({ x: 0, y: 0 });

  // Tiles are revealed left to right, so sort by their left edge.
  const ordered = useMemo(
    () => [...tiles].sort((a, b) => a.x - b.x || a.y - b.y),
    [tiles],
  );

  // One master clock, advanced by the render loop.
  useFrame((state, delta) => {
    clock.advance(Math.min(delta, 0.05));
    const now = clock.time;
    setTime(now);

    const currentPhase = phaseAt(now);
    if (currentPhase !== lastPhaseRef.current) {
      lastPhaseRef.current = currentPhase;
      setPhase(currentPhase);
      onPhaseChange?.(currentPhase);
    }

    // Pan progress: 0 -> 1 across the camera-pan and settle phases.
    const pan = Math.min(Math.max((now - 5) / 7, 0), 1);
    setPanProgress(pan);

    const cam = state.camera;

    // Pointer parallax, desktop only, capped at 8px of screen travel.
    const px = isMobile ? 0 : pointerRef.current.x;
    const py = isMobile ? 0 : pointerRef.current.y;

    if (now < 5) {
      // Hold on the left edge of the collage while the intro plays.
      cam.position.x = PAN_START;
      cam.position.y = 0;
      cam.position.z = CAMERA_Z;
    } else if (now < SCRIPTED_DURATION) {
      // Linear pan across the full collage.
      cam.position.x = PAN_START + (PAN_END - PAN_START) * pan;
      cam.position.y = 0;
      cam.position.z = CAMERA_Z;
    } else {
      // Idle: a very slow back and forth drift, three percent of the run.
      const idleT = state.clock.getElapsedTime() * 0.06;
      const drift = Math.sin(idleT) * 0.03 * (PAN_START - PAN_END);
      cam.position.x = PAN_END + drift;
      cam.position.y = 0;
      cam.position.z = CAMERA_Z;
    }

    // Pointer parallax is layered on top of whichever base position we have.
    cam.position.x += px * 0.22;
    cam.position.y += py * 0.12;
    cam.lookAt(cam.position.x, cam.position.y, 0);
  });

  // Pointer tracking, desktop only.
  useEffect(() => {
    if (isMobile) return;
    const onPointerMove = (event: PointerEvent) => {
      pointerTargetRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerTargetRef.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [isMobile]);

  // Ease the pointer value so the parallax is not jittery.
  useFrame(() => {
    pointerRef.current.x += (pointerTargetRef.current.x - pointerRef.current.x) * 0.06;
    pointerRef.current.y += (pointerTargetRef.current.y - pointerRef.current.y) * 0.06;
  });

  // r3f keeps the camera's aspect in step with the canvas on resize, and
  // the `dpr` prop on the Canvas caps the device pixel ratio at 2.

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <>
      <color attach="background" args={['#000000']} />

      <PixelPoints
        time={time}
        bounds={{ width: COLLAGE_WORLD_WIDTH, height: COLLAGE_WORLD_HEIGHT }}
        enabled={!isMobile}
        onComplete={() => undefined}
      />

      {ordered.map((tile, index) => (
        <Tile
          key={tile.id}
          id={tile.id}
          src={`/hero/tiles/${tile.id}.webp`}
          x={tile.x}
          y={tile.y}
          w={tile.w}
          h={tile.h}
          group={tile.group}
          revealIndex={index}
          time={time}
          panProgress={panProgress}
          phase={phase}
          isMobile={isMobile}
        />
      ))}
    </>
  );
}

export function CollageScene({
  tiles,
  isMobile,
  isVisible = true,
  onReady,
  onPhaseChange,
}: CollageSceneProps) {
  const [failed, setFailed] = useState(false);

  const handleCreated = useCallback(
    (state: { gl: THREE.WebGLRenderer }) => {
      state.gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    },
    [],
  );

  if (failed) return null;

  return (
    <Canvas
      className="h-full w-full"
      aria-hidden="true"
      role="presentation"
      dpr={[1, 2]}
      frameloop={isVisible ? "always" : "never"}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      }}
      camera={{
        position: [PAN_START, 0, CAMERA_Z],
        fov: 35,
        near: 0.1,
        far: 500,
      }}
      onCreated={handleCreated}
      onError={() => setFailed(true)}
    >
      <SceneInner
        tiles={tiles}
        isMobile={isMobile}
        onReady={onReady}
        onPhaseChange={onPhaseChange}
      />
    </Canvas>
  );
}
