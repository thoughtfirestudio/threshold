// All room tile maps and metadata.
// Tile values: 0=ground (walkable), 1=wall (blocked), 2=path (walkable)
//
// exits: array of { edge:'n'|'s'|'e'|'w', destRoom, destX, destY }
//   — walking off an edge triggers a room transition.
//   destX/destY is where the player lands in the destination room.
//
// objects: array of { x, y, id }
//   — face a tile + press A → fires scene's onInteract(id) handler.
//
// startX/startY: default player position when first entering this room.

export const ROOMS = {

  // ── FOREST 1 — Opening. Deer in the upper clearing. Path winds north.
  forest_1: {
    tiles: [
      [1,1,1,1,0,2,0,1,1,1],  // row 0 — exit north at col 4-5
      [1,1,0,0,0,2,0,0,1,1],  // row 1
      [1,0,0,0,0,2,0,0,0,1],  // row 2 — open upper clearing
      [1,0,0,1,0,2,0,0,0,1],  // row 3 — isolated tree (col 3)
      [1,1,0,0,0,2,0,0,1,1],  // row 4
      [1,1,1,0,0,2,0,1,1,1],  // row 5
      [1,1,1,0,0,2,0,1,1,1],  // row 6
      [1,1,1,1,0,2,0,1,1,1],  // row 7 — player starts here
      [1,1,1,1,1,2,1,1,1,1],  // row 8 — solid south wall
    ],
    exits: [
      { edge: 'n', destRoom: 'forest_2', destX: 5, destY: 8 },
    ],
    objects: [
      { x: 7, y: 2, id: 'deer' },          // deer entity (special — not a static object)
      { x: 6, y: 4, id: 'mushrooms_1' },   // mushroom cluster, flavor
    ],
    startX: 5, startY: 7,
  },

  // ── FOREST 2 — Shrine. Mushroom ring. Fork on the return pass.
  forest_2: {
    tiles: [
      [1,1,1,0,0,2,0,1,1,1],  // row 0 — exit north
      [1,1,0,0,0,2,0,0,1,1],  // row 1
      [1,0,0,0,0,2,0,0,0,1],  // row 2
      [1,0,0,0,0,2,0,0,0,1],  // row 3 — mushroom ring right side
      [1,0,0,0,0,2,0,0,0,1],  // row 4 — shrine left side (col 2)
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
      { x: 2, y: 4, id: 'shrine' },        // the shrine — key object
      { x: 7, y: 3, id: 'mushrooms_2' },   // mushroom ring — flavor
      { x: 8, y: 4, id: 'mushrooms_3' },
      { x: 7, y: 5, id: 'mushrooms_4' },
    ],
    startX: 5, startY: 8,
  },

  // ── FOREST 3 — Deep woods. Log. Hidden carved stones. Cabin door to the north.
  forest_3: {
    tiles: [
      [1,1,1,1,0,2,0,1,1,1],  // row 0 — exit north → CABIN
      [1,1,0,0,0,2,0,0,1,1],  // row 1
      [1,0,0,0,0,2,0,0,0,1],  // row 2
      [1,0,0,1,1,2,0,0,0,1],  // row 3 — log at (3,3) and (4,3) [col 5 path clear]
      [1,0,0,0,0,2,0,0,0,1],  // row 4
      [1,1,0,0,0,2,0,0,1,1],  // row 5
      [1,1,0,0,0,2,0,1,1,1],  // row 6
      [1,1,1,0,0,2,0,1,1,1],  // row 7
      [1,1,1,1,0,2,0,1,1,1],  // row 8 — exit south
    ],
    exits: [
      { edge: 'n', destRoom: 'cabin', destX: 4, destY: 7 },
      { edge: 's', destRoom: 'forest_2', destX: 5, destY: 0 },
    ],
    objects: [
      { x: 3, y: 3, id: 'log' },           // fallen log — flavor + "walk behind" payoff
      { x: 2, y: 2, id: 'stone_1' },       // carved stone — mute before crossing
      { x: 7, y: 2, id: 'stone_2' },       // carved stone — mute before crossing
    ],
    startX: 5, startY: 8,
  },

  // ── CABIN — Intimate single room. The artifact on the table.
  cabin: {
    tiles: [
      [1,1,1,1,1,1,1,1,1,1],  // row 0 — back wall
      [1,0,0,0,0,0,0,0,0,1],  // row 1 — shelves, window, mirror zone
      [1,0,0,0,0,0,0,0,0,1],  // row 2
      [1,0,0,0,0,0,0,0,0,1],  // row 3
      [1,0,0,0,1,1,0,0,0,1],  // row 4 — table (1=blocked, artifact above table)
      [1,0,0,0,1,1,0,0,0,1],  // row 5
      [1,0,0,0,0,0,0,0,0,1],  // row 6
      [1,0,0,0,0,0,0,0,0,1],  // row 7 — player arrives here
      [1,1,1,1,0,0,1,1,1,1],  // row 8 — exit south at cols 4,5 → forest_3
    ],
    exits: [
      { edge: 's', destRoom: 'forest_3', destX: 5, destY: 0 },
    ],
    objects: [
      { x: 4, y: 4, id: 'artifact' },      // THE object — the bone bowl (on table surface)
      { x: 1, y: 1, id: 'window' },        // glowing window (flavor)
      { x: 7, y: 1, id: 'mirror' },        // mirror (a beat too slow)
      { x: 6, y: 1, id: 'books' },         // shelf of books
      { x: 2, y: 1, id: 'journal' },       // open journal, ink trailing off
      { x: 3, y: 6, id: 'tea' },           // cold full cup of tea
    ],
    startX: 4, startY: 7,
  },

  // ── HYPERSPACE rooms — open (all walkable ground), entity at center-top
  hyper_weaver: {
    tiles: [
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0,0],
    ],
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
