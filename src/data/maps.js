// All room tile maps and metadata.
// Tile values: 0=ground (walkable), 1=wall (blocked), 2=path (walkable)
// Grid: 8 cols × 7 rows, 20px per tile = 160×140 px
//
// exits: array of { edge:'n'|'s'|'e'|'w', destRoom, destX, destY }
// objects: array of { x, y, id }
// startX/startY: default player position when first entering this room.

export const ROOMS = {

  // ── FOREST 1 — Opening. Deer in the upper clearing. Path winds north.
  forest_1: {
    tiles: [
      [1,1,0,0,2,0,1,1],  // row 0 — exit north
      [1,0,0,0,2,0,0,1],  // row 1
      [1,0,0,0,2,0,0,1],  // row 2 — open clearing, deer at (5,2)
      [1,0,0,1,2,0,0,1],  // row 3 — isolated tree (col 3)
      [1,1,0,0,2,0,1,1],  // row 4 — mushrooms at (5,4)
      [1,1,0,0,2,0,1,1],  // row 5
      [1,1,1,0,2,0,1,1],  // row 6 — player starts here
    ],
    exits: [
      { edge: 'n', destRoom: 'forest_2', destX: 4, destY: 6 },
    ],
    objects: [
      { x: 5, y: 2, id: 'deer' },
      { x: 5, y: 4, id: 'mushrooms_1' },
    ],
    startX: 3, startY: 6,
  },

  // ── FOREST 2 — Shrine. Mushroom ring. Fork on the return pass.
  forest_2: {
    tiles: [
      [1,1,0,0,2,0,1,1],  // row 0 — exit north
      [1,0,0,0,2,0,0,1],  // row 1
      [1,0,0,0,2,0,0,1],  // row 2
      [1,0,0,0,2,0,0,1],  // row 3 — mushroom ring right (5,3)
      [1,0,0,0,2,0,0,1],  // row 4 — shrine left (2,4), mushrooms (5,4)
      [1,0,0,0,2,0,0,1],  // row 5 — mushrooms (5,5)
      [1,1,0,0,2,0,1,1],  // row 6 — exit south
    ],
    exits: [
      { edge: 'n', destRoom: 'forest_3', destX: 4, destY: 6 },
      { edge: 's', destRoom: 'forest_1', destX: 4, destY: 0 },
    ],
    objects: [
      { x: 2, y: 4, id: 'shrine' },
      { x: 5, y: 3, id: 'mushrooms_2' },
      { x: 5, y: 4, id: 'mushrooms_3' },
      { x: 5, y: 5, id: 'mushrooms_4' },
    ],
    startX: 4, startY: 6,
  },

  // ── FOREST 3 — Deep woods. Log. Hidden carved stones. Cabin to the north.
  forest_3: {
    tiles: [
      [1,1,1,0,2,0,1,1],  // row 0 — exit north → CABIN
      [1,1,0,0,2,0,0,1],  // row 1
      [1,0,0,0,2,0,0,1],  // row 2 — stones at (2,2) and (5,2)
      [1,0,0,1,2,0,0,1],  // row 3 — log at (3,3)
      [1,0,0,0,2,0,0,1],  // row 4
      [1,1,0,0,2,0,1,1],  // row 5
      [1,1,1,0,2,0,1,1],  // row 6 — exit south
    ],
    exits: [
      { edge: 'n', destRoom: 'cabin', destX: 3, destY: 5 },
      { edge: 's', destRoom: 'forest_2', destX: 4, destY: 0 },
    ],
    objects: [
      { x: 3, y: 3, id: 'log' },
      { x: 2, y: 2, id: 'stone_1' },
      { x: 5, y: 2, id: 'stone_2' },
    ],
    startX: 4, startY: 6,
  },

  // ── CABIN — Intimate single room. The artifact on the table.
  cabin: {
    tiles: [
      [1,1,1,1,1,1,1,1],  // row 0 — back wall
      [1,0,0,0,0,0,0,1],  // row 1 — window, journal, books, mirror
      [1,0,0,0,0,0,0,1],  // row 2
      [1,0,1,1,1,0,0,1],  // row 3 — table blocks cols 2,3,4; artifact above table (col 3)
      [1,0,1,1,1,0,0,1],  // row 4 — table continues
      [1,0,0,0,0,0,0,1],  // row 5 — player arrives, tea
      [1,1,1,0,0,1,1,1],  // row 6 — exit south at cols 3,4
    ],
    exits: [
      { edge: 's', destRoom: 'forest_3', destX: 4, destY: 0 },
    ],
    objects: [
      { x: 3, y: 2, id: 'artifact' },  // just above table surface
      { x: 1, y: 1, id: 'window' },
      { x: 6, y: 1, id: 'mirror' },
      { x: 5, y: 1, id: 'books' },
      { x: 2, y: 1, id: 'journal' },
      { x: 2, y: 5, id: 'tea' },
    ],
    startX: 3, startY: 5,
  },

  // ── HYPERSPACE rooms — 8×7 all-walkable, entity near top-center
  hyper_weaver: {
    tiles: Array.from({length:7}, () => Array(8).fill(0)),
    exits: [],
    objects: [{ x: 4, y: 2, id: 'weaver' }],
    startX: 4, startY: 6,
  },
  hyper_twin: {
    tiles: Array.from({length:7}, () => Array(8).fill(0)),
    exits: [],
    objects: [{ x: 4, y: 2, id: 'twin' }],
    startX: 4, startY: 6,
  },
  hyper_gardener: {
    tiles: Array.from({length:7}, () => Array(8).fill(0)),
    exits: [],
    objects: [{ x: 4, y: 2, id: 'gardener' }],
    startX: 4, startY: 6,
  },
  hyper_threshold: {
    tiles: Array.from({length:7}, () => Array(8).fill(0)),
    exits: [],
    objects: [{ x: 4, y: 1, id: 'threshold_entity' }],
    startX: 4, startY: 6,
  },
};
