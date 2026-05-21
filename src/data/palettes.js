// Named palettes per register.
// HALL: dark stone corridor, torch-lit.
// FOREST/CABIN: kept for the threshold warp transition and start screen.
// HYPERSPACE: intentionally breaks the constraint — that's the point.

export const PALETTES = {
  // The Hall — dark stone, torch gold
  HALL: {
    '0': '#0d0a12', // deepest shadow / outline
    '1': '#1e1a2e', // dark stone floor / wall body
    '2': '#3d3560', // mid stone / figure robe
    '3': '#c8a84b', // torch gold / smoke glow
  },

  // Kept for threshold warp transition
  FOREST: {
    '0': '#1b211a',
    '1': '#3a4a39',
    '2': '#6f7d5a',
    '3': '#aeb38c',
  },

  // Kept for threshold warp transition
  CABIN: {
    '0': '#241a12',
    '1': '#4a3320',
    '2': '#8a6a3a',
    '3': '#d8b873',
  },

  // Act III — the only saturated palette.
  // More than 4 colors signals "you are no longer in the ordinary world."
  HYPERSPACE: {
    '0': '#10031f',
    '1': '#5d12a8',
    '2': '#e0379b',
    '3': '#ffe14d',
    '4': '#22e0c8',
    '5': '#ff6b35',
  },
};
