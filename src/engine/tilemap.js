// Tilemap: 10×9 grid, 16px tiles.
// Tile values: 0=ground (walkable), 1=wall (blocked), 2=path (walkable, lighter)
//
// Renders: ground dither base, path dither on path tiles, dark underlay + tree
// sprites on interior wall tiles. Edge walls are left as dark dither (fog covers them).

import { dither, sprite, px } from './renderer.js';
import { TREE } from '../data/sprites.js';

export const TILE = 16;
export const MAP_W = 10;
export const MAP_H = 9;

// Is a tile walkable? Out-of-bounds = false (wall).
export function isWalkable(tx, ty, tiles) {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return false;
  const t = tiles[ty][tx];
  return t === 0 || t === 2;
}

export function getTile(tx, ty, tiles) {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return 1;
  return tiles[ty][tx];
}

// Slight per-tile variation so trees don't form a pixel-perfect grid.
// Pure function — same (col,row) always produces the same offset.
function treeOffset(col, row) {
  const h = (col * 31 + row * 17 + col * row * 7) % 8;
  return { dx: h % 4, dy: h % 3 };
}

export function drawTiles(tiles, pal) {
  const treePal = { '0': pal['0'], '1': pal['1'] };

  // 1. Ground dither — fills entire screen
  dither(0, 0, 160, 144, pal['2'], pal['1']);

  for (let row = 0; row < MAP_H; row++) {
    for (let col = 0; col < MAP_W; col++) {
      const t = tiles[row][col];
      const x = col * TILE;
      const y = row * TILE;

      if (t === 1) {
        // Wall: darker dither underlay, then tree sprite on interior tiles
        dither(x, y, x + TILE, y + TILE, pal['0'], pal['1']);
        // Only draw tree sprites on non-edge wall tiles (edge walls are just dark dither)
        if (row > 0 && row < MAP_H - 1 && col > 0 && col < MAP_W - 1) {
          const { dx, dy } = treeOffset(col, row);
          sprite(TREE, x + dx, y + dy - 2, treePal);
        }
      } else if (t === 2) {
        // Path: lighter dither
        dither(x, y, x + TILE, y + TILE, pal['3'], pal['2']);
      }
    }
  }
}

// Convert tile coords to pixel position for a sprite centered in the tile.
// spriteW/H is the sprite's pixel dimensions.
export function tileToPixel(tx, ty, spriteW = 6, spriteH = 8) {
  return {
    x: tx * TILE + Math.floor((TILE - spriteW) / 2),
    y: ty * TILE + Math.floor((TILE - spriteH) / 2),
  };
}
