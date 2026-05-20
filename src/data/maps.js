// All room tile maps — 10×9 grid, 16px tiles = 160×144 (GBC native)
// Tile values: 0=ground (walkable), 1=wall (blocked), 2=path (walkable)
//
// exits: { edge:'n'|'s'|'e'|'w', destRoom, destX, destY }
// objects: { x, y, id }
// startX/Y: default player position entering room

export const ROOMS = {

  // ── FOREST 1 — Opening. Deer in the upper clearing.
  forest_1: {
    tiles: [
      [1,1,1,1,0,2,0,1,1,1],  // row 0 — exit north
      [1,1,0,0,0,2,0,0,1,1],  // row 1
      [1,0,0,0,0,2,0,0,0,1],  // row 2 — open clearing
      [1,0,0,1,0,2,0,0,0,1],  // row 3 — isolated wall tree col 3
      [1,1,0,0,0,2,0,0,1,1],  // row 4
      [1,1,1,0,0,2,0,1,1,1],  // row 5
      [1,1,1,0,0,2,0,1,1,1],  // row 6
      [1,1,1,1,0,2,0,1,1,1],  // row 7 — player starts
      [1,1,1,1,1,2,1,1,1,1],  // row 8 — solid south wall
    ],
    exits: [
      { edge: 'n', destRoom: 'forest_2', destX: 5, destY: 8 },
    ],
    objects: [
      { x: 7, y: 2, id: 'deer' },
      { x: 6, y: 4, id: 'mushrooms_1' },
    ],
    startX: 5, startY: 7,
  },

  // ── FOREST 2 — Shrine. Mushroom ring.
  forest_2: {
    tiles: [
      [1,1,1,0,0,2,0,1,1,1],  // row 0 — exit north
      [1,1,0,0,0,2,0,0,1,1],  // row 1
      [1,0,0,0,0,2,0,0,0,1],  // row 2
      [1,0,0,0,0,2,0,0,0,1],  // row 3
      [1,0,0,0,0,2,0,0,0,1],  // row 4 — shrine left (2,4)
      [1,0,0,0,0,2,0,0,0,1],  // row 5
      [1,1,0,0,0,2,0,0,1,1],  // row 6
      [1,1,1,0,0,2,0,1,1,1],  // row 7
      [1,1,1,1,0,2,0,1,1,1],  // row 8 — exit south
    ],
    exits: [
      { edge: 'n', destRoom: 'forest_3', destX: 5, destY: 8 },
      { edge: 's', destRoom: 'forest_1', destX: 5, destY: 0 },
    ],
    objects: [
      { x: 2, y: 4, id: 'shrine' },
      { x: 7, y: 3, id: 'mushrooms_2' },
      { x: 7, y: 4, id: 'mushrooms_3' },
      { x: 7, y: 5, id: 'mushrooms_4' },
    ],
    startX: 5, startY: 8,
  },

  // ── FOREST 3 — Deep woods. Log. Carved stones. Cabin north.
  forest_3: {
    tiles: [
      [1,1,1,1,0,2,0,1,1,1],  // row 0 — exit north → CABIN
      [1,1,0,0,0,2,0,0,1,1],  // row 1
      [1,0,0,0,0,2,0,0,0,1],  // row 2
      [1,0,0,1,1,2,0,0,0,1],  // row 3 — log (cols 3-4 wall)
      [1,0,0,0,0,2,0,0,0,1],  // row 4
      [1,1,0,0,0,2,0,0,1,1],  // row 5
      [1,1,0,0,0,2,0,1,1,1],  // row 6
      [1,1,1,0,0,2,0,1,1,1],  // row 7
      [1,1,1,1,0,2,0,1,1,1],  // row 8 — exit south
    ],
    exits: [
      { edge: 'n', destRoom: 'cabin', destX: 5, destY: 7 },
      { edge: 's', destRoom: 'forest_2', destX: 5, destY: 0 },
    ],
    objects: [
      { x: 3, y: 3, id: 'log' },
      { x: 2, y: 2, id: 'stone_1' },
      { x: 7, y: 2, id: 'stone_2' },
    ],
    startX: 5, startY: 8,
  },

  // ── CABIN — Single room. Table in center. Artifact on table.
  // Wall objects span full rows/cols so collision = visible footprint.
  //   Shelf row: row 1 fully blocked (wall draws the shelf items)
  //   Table: cols 3-6, rows 3-4 (48×32px table matching visual)
  cabin: {
    tiles: [
      [1,1,1,1,1,1,1,1,1,1],  // row 0 — back wall
      [1,1,1,1,1,1,1,1,1,1],  // row 1 — shelf / window / mirror row (all blocked)
      [1,0,0,0,0,0,0,0,0,1],  // row 2 — walkable in front of shelf
      [1,0,0,1,1,1,1,0,0,1],  // row 3 — table top edge (cols 3-6 blocked)
      [1,0,0,1,1,1,1,0,0,1],  // row 4 — table body
      [1,0,0,0,0,0,0,0,0,1],  // row 5 — in front of table
      [1,0,0,0,0,0,0,0,0,1],  // row 6
      [1,0,0,0,0,0,0,0,0,1],  // row 7 — player arrives
      [1,1,1,1,0,0,1,1,1,1],  // row 8 — exit south cols 4-5
    ],
    exits: [
      { edge: 's', destRoom: 'forest_3', destX: 5, destY: 0 },
    ],
    objects: [
      { x: 4, y: 2, id: 'artifact' },   // face north toward shelf-top, interact from row 2
      { x: 1, y: 1, id: 'window' },
      { x: 8, y: 1, id: 'mirror' },
      { x: 6, y: 1, id: 'books' },
      { x: 3, y: 1, id: 'journal' },
      { x: 7, y: 6, id: 'tea' },
    ],
    startX: 5, startY: 7,
  },

  // ── HYPERSPACE — 10×9 all-walkable
  hyper_weaver: {
    tiles: Array.from({length:9}, () => Array(10).fill(0)),
    exits: [],
    objects: [{ x: 5, y: 3, id: 'weaver' }],
    startX: 5, startY: 7,
  },
  hyper_twin: {
    tiles: Array.from({length:9}, () => Array(10).fill(0)),
    exits: [],
    objects: [{ x: 5, y: 3, id: 'twin' }],
    startX: 5, startY: 7,
  },
  hyper_gardener: {
    tiles: Array.from({length:9}, () => Array(10).fill(0)),
    exits: [],
    objects: [{ x: 5, y: 3, id: 'gardener' }],
    startX: 5, startY: 7,
  },
  hyper_threshold: {
    tiles: Array.from({length:9}, () => Array(10).fill(0)),
    exits: [],
    objects: [{ x: 5, y: 2, id: 'threshold_entity' }],
    startX: 5, startY: 7,
  },
};
