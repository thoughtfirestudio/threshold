// All room tile maps — 10×9 grid, 16px tiles = 160×144 (GBC native)
// Tile values: 0=ground (walkable), 1=wall (blocked)
//
// Hall rooms: linear corridor, Elite Four style.
// North wall has walkable doorway at cols 4-5 (tile=0).
// Player exits north from row 0 — scene handles door logic.
// exits: not used for hall (scene handles room transitions directly)
// objects: { x, y, id }

export const ROOMS = {

  // ── HALL 1 — The Warden's chamber.
  hall_1: {
    tiles: [
      [1,1,1,1,0,0,1,1,1,1],  // row 0 — north doorway cols 4-5
      [1,0,0,0,0,0,0,0,0,1],  // row 1
      [1,0,0,0,0,1,0,0,0,1],  // row 2 — figure at col 5
      [1,0,0,0,0,0,0,0,0,1],  // row 3
      [1,0,0,0,0,0,0,0,0,1],  // row 4
      [1,0,0,0,0,0,0,0,0,1],  // row 5
      [1,0,0,0,0,0,0,0,0,1],  // row 6
      [1,0,0,0,0,0,0,0,0,1],  // row 7 — player starts
      [1,1,1,1,0,0,1,1,1,1],  // row 8 — south wall with opening
    ],
    exits: [],
    objects: [{ x: 5, y: 2, id: 'figure_1' }],
    startX: 5, startY: 7,
  },

  // ── HALL 2 — The Witness's chamber.
  hall_2: {
    tiles: [
      [1,1,1,1,0,0,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,1,0,0,0,1],  // figure at col 5
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,0,0,1,1,1,1],
    ],
    exits: [],
    objects: [{ x: 5, y: 2, id: 'figure_2' }],
    startX: 5, startY: 7,
  },

  // ── HALL 3 — The Keeper's chamber.
  hall_3: {
    tiles: [
      [1,1,1,1,0,0,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,1,0,0,0,1],  // figure at col 5
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,0,0,1,1,1,1],
    ],
    exits: [],
    objects: [{ x: 5, y: 2, id: 'figure_3' }],
    startX: 5, startY: 7,
  },

  // ── HALL CHAMBER — The final room. The bowl. No north exit.
  hall_chamber: {
    tiles: [
      [1,1,1,1,1,1,1,1,1,1],  // row 0 — solid north wall
      [1,0,0,0,0,0,0,0,0,1],  // row 1
      [1,0,0,0,0,0,0,0,0,1],  // row 2
      [1,0,0,0,1,1,1,0,0,1],  // row 3 — altar (cols 4-6 blocked)
      [1,0,0,0,0,0,0,0,0,1],  // row 4
      [1,0,0,0,0,0,0,0,0,1],  // row 5
      [1,0,0,0,0,0,0,0,0,1],  // row 6
      [1,0,0,0,0,0,0,0,0,1],  // row 7
      [1,1,1,1,0,0,1,1,1,1],  // row 8 — south entrance
    ],
    exits: [],
    objects: [{ x: 5, y: 3, id: 'bowl' }],
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
