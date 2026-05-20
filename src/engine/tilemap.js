// Tilemap: 10×9 grid, 16px tiles = 160×144 (exact GBC resolution)
// Tile values: 0=ground (walkable), 1=wall (blocked), 2=path (walkable, lighter)

import { dither, sprite, px } from './renderer.js';
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

function treeOffset(col, row) {
  const h = (col * 31 + row * 17 + col * row * 7) % 8;
  return { dx: h % 3, dy: h % 2 };
}

export function drawTiles(tiles, pal) {
  const treePal = { '0': pal['0'], '1': pal['1'] };

  // Ground dither fills entire canvas
  dither(0, 0, 160, 144, pal['2'], pal['1']);

  for (let row = 0; row < MAP_H; row++) {
    for (let col = 0; col < MAP_W; col++) {
      const t = tiles[row][col];
      const x = col * TILE;
      const y = row * TILE;

      if (t === 1) {
        dither(x, y, x + TILE, y + TILE, pal['0'], pal['1']);
        // Tree sprites on interior (non-edge) wall tiles
        if (row > 0 && row < MAP_H - 1 && col > 0 && col < MAP_W - 1) {
          const { dx, dy } = treeOffset(col, row);
          // TREE 9×9 at 1× — fits inside 16px tile with 3–4px margin
          sprite(TREE, x + dx + 3, y + dy + 3, treePal, 1, 1);
        }
      } else if (t === 2) {
        dither(x, y, x + TILE, y + TILE, pal['3'], pal['2']);
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
