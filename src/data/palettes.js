// Named palettes per register.
// FOREST and CABIN: strict 4-color Gameboy constraint.
// HYPERSPACE: intentionally breaks the constraint — that's the point.

export const PALETTES = {
  // Act I & IV (return) — muted, foggy, low-contrast
  FOREST: {
    '0': '#1b211a', // darkest  — outlines, trunks, shadows
    '1': '#3a4a39', // dark     — ground mid, canopy body
    '2': '#6f7d5a', // mid      — ground base, player body
    '3': '#aeb38c', // lightest — path, bright highlights
  },

  // Act II — amber, intimate, still
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
