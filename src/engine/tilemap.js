// Tilemap: 8×7 grid, 20px tiles.
// Tile values: 0=ground (walkable), 1=wall (blocked), 2=path (walkable, lighter)
//
// 8 cols × 20px = 160px | 7 rows × 20px = 140px (4px margin at bottom for dialogue)

import { dither, sprite, px } from './renderer.js';
import { TREE } from '../data/sprites.js';

export const TILE = 20;
export const MAP_W = 8;
export const MAP_H = 7;

export function isWalkable(tx, ty, tiles) {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return false;
  const t = tiles[ty][tx];
  return t === 0 || t === 2;
}

export function getTile(tx, ty, tiles) {
  if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return 1;
  return tiles[ty][tx];
}

// Deterministic per-tile variation so trees aren't pixel-perfect grid.
function treeOffset(col, row) {
  const h = (col * 31 + row * 17 + col * row * 7) % 8;
  return { dx: h % 3, dy: h % 2 };
}

export function drawTiles(tiles, pal) {
  const treePal = { '0': pal['0'], '1': pal['1'] };

  // 1. Ground dither — fills entire canvas
  dither(0, 0, 160, 144, pal['2'], pal['1']);

  for (let row = 0; row < MAP_H; row++) {
    for (let col = 0; col < MAP_W; col++) {
      const t = tiles[row][col];
      const x = col * TILE;
      const y = row * TILE;

      if (t === 1) {
        dither(x, y, x + TILE, y + TILE, pal['0'], pal['1']);
        // Tree sprites on interior walls (not edge walls)
        if (row > 0 && row < MAP_H - 1 && col > 0 && col < MAP_W - 1) {
          const { dx, dy } = treeOffset(col, row);
          // TREE is 9×9; at 2× = 18×18. Center in 20px tile + variation.
          sprite(TREE, x + dx, y + dy, treePal, 1, 2);
        }
      } else if (t === 2) {
        dither(x, y, x + TILE, y + TILE, pal['3'], pal['2']);
      }
    }
  }
}

// Convert tile coords to pixel position for a sprite centered in the tile.
export function tileToPixel(tx, ty, spriteW = 12, spriteH = 16) {
  return {
    x: tx * TILE + Math.floor((TILE - spriteW) / 2),
    y: ty * TILE + Math.floor((TILE - spriteH) / 2),
  };
}
