// Tilemap: 10×9 grid, 16px tiles = 160×144 (exact GBC resolution)
// Tile values: 0=ground (walkable), 1=wall (blocked), 2=path (walkable, lighter)

import { px, sprite } from './renderer.js';
import { TREE } from '../data/sprites.js';

export const TILE = 16;
export const MAP_W = 10;
export const MAP_H = 9;

export function isWalkable(tx, ty, tiles) {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return false;
  const t = tiles[ty][tx];
  return t === 0 || t === 2;
}

export function getTile(tx, ty, tiles) {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return 1;
  return tiles[ty][tx];
}

export function drawTiles(tiles, pal) {
  // Tree palette: dark outline, mid canopy, lighter highlight spots (Pokemon Gold style)
  const treePal = { '0': pal['0'], '1': pal['1'], '2': pal['2'] };

  // Ground base — flat solid fill (Pokemon-style clean grass)
  px(0, 0, 160, 144, pal['2']);

  for (let row = 0; row < MAP_H; row++) {
    for (let col = 0; col < MAP_W; col++) {
      const t = tiles[row][col];
      const x = col * TILE;
      const y = row * TILE;

      if (t === 1) {
        // Tree/wall tile: dark solid base
        px(x, y, TILE, TILE, pal['0']);
        // Tree sprite at 2× (8×8 → 16×16) fills the whole tile
        // Interior tiles only — edge tiles stay as solid dark border
        if (row > 0 && row < MAP_H - 1 && col > 0 && col < MAP_W - 1) {
          sprite(TREE, x, y, treePal, 1, 2);
        }
      } else if (t === 2) {
        // Path tile — lighter flat color
        px(x, y, TILE, TILE, pal['3']);
      }
    }
  }
}

// Convert tile coords to pixel position for a sprite.
// Default: 12×16 player (2× scaled 6×8 sprite) centered in 16px tile.
// Feet sit at tile bottom: y offset = TILE - spriteH = 0 for 16px sprite.
export function tileToPixel(tx, ty, spriteW = 12, spriteH = 16) {
  return {
    x: tx * TILE + Math.floor((TILE - spriteW) / 2),
    y: ty * TILE + (TILE - spriteH),   // feet at bottom of tile (Pokemon-style)
  };
}
