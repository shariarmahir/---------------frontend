/**
 * Shared geometry for the hero collage.
 *
 * The source collage is 2572 x 718 pixels. Everything in the scene works
 * in world units instead, so the camera can be set in round numbers:
 * the collage is 100 units wide and about 27.9 units tall.
 */

export const COLLAGE_SOURCE_WIDTH = 2572;
export const COLLAGE_SOURCE_HEIGHT = 718;

/** World units per source pixel. */
export const SCALE = 100 / COLLAGE_SOURCE_WIDTH;

export const COLLAGE_WORLD_WIDTH = COLLAGE_SOURCE_WIDTH * SCALE; // 100
export const COLLAGE_WORLD_HEIGHT = COLLAGE_SOURCE_HEIGHT * SCALE; // ~27.9

export type TileGroup = 'archive' | 'youth' | 'rural';

export interface TileData {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  group: TileGroup;
}

/** Depth offset per group, so the camera pan gives a gentle parallax. */
export const GROUP_Z: Record<TileGroup, number> = {
  archive: 0,
  youth: 0.15,
  rural: 0.3,
};

/** The gold hairline that frames every tile, in source pixels. */
export const FRAME_THICKNESS_PX = 2;

/** Source-pixel rect of a tile, expressed in world units and centre-origin. */
export function tileToWorld(tile: { x: number; y: number; w: number; h: number }) {
  return {
    width: tile.w * SCALE,
    height: tile.h * SCALE,
    centerX: (tile.x + tile.w / 2 - COLLAGE_SOURCE_WIDTH / 2) * SCALE,
    centerY: (COLLAGE_SOURCE_HEIGHT / 2 - tile.y - tile.h / 2) * SCALE,
  };
}
