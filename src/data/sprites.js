// Sprite string-grids.
// Each character maps to a key in the palette passed to sprite().
// '.' and ' ' are transparent — the renderer skips them.
// Keep sprites small (8×8, 9×9, 16×16) — we live in 160×144 space.

// 8×8 round tree (drawn at 2× = 16×16, fills one tile).
// Pokemon Gold-style: round canopy with 4 lighter highlight patches, dark trunk.
// Palette: '0'=dark outline/trunk, '1'=canopy body, '2'=canopy highlight spots
export const TREE = [
  '.011110.',
  '01211210',
  '01221210',
  '01111110',
  '01221210',
  '.012210.',
  '..0110..',
  '..0000..',
];

// 6×8 player sprite — Pokemon Gold overworld style.
// Palette: '0'=dark outline, '1'=clothing/body, '2'=skin tone
// Drawn at 2× = 12×16px. Hat, face, body, legs all distinct.

// Facing down — can see face
export const PLAYER_DOWN = [
  '.0000.',
  '.1221.',
  '011110',
  '011110',
  '.0110.',
  '011110',
  '0.11.0',
  '0....0',
];

// Facing up — back of head, backpack visible
export const PLAYER_UP = [
  '.0000.',
  '.1111.',
  '011110',
  '011210',
  '.0110.',
  '011110',
  '0.11.0',
  '0....0',
];

// Facing left
export const PLAYER_LEFT = [
  '.0000.',
  '.1221.',
  '011110',
  '011110',
  '.0110.',
  '.01110',
  '0.110.',
  '0.....',
];

// Facing right
export const PLAYER_RIGHT = [
  '.0000.',
  '.1221.',
  '011110',
  '011110',
  '.0110.',
  '011110',
  '.0110.',
  '.....0',
];

// 8×8 deer — alert posture (head raised, legs apart)
// Palette: '0'=body
export const DEER_ALERT = [
  '..0..0..',
  '..0..0..',
  '.000000.',
  '00000000',
  '0000000.',
  '.0....0.',
  '.0....0.',
  '00....00',
];

// 8×8 deer — calm posture (head lowered, grazing)
export const DEER_CALM = [
  '........',
  '..0..0..',
  '.0000000',
  '00000000',
  '0000000.',
  '.0....0.',
  '.0....0.',
  '00....00',
];

// 8×8 mushroom ring circle (individual mushroom)
export const MUSHROOM = [
  '..000...',
  '.01110..',
  '.01110..',
  '..000...',
  '..010...',
  '..010...',
  '........',
  '........',
];

// 10×8 fallen log (horizontal)
export const LOG = [
  '.00000000.',
  '0111111110',
  '0111111110',
  '0110000110',
  '0110000110',
  '0111111110',
  '0111111110',
  '.00000000.',
];

// 10×10 shrine (stone base with bowl)
export const SHRINE_EMPTY = [
  '..000000..',
  '.01111110.',
  '0111111110',
  '0111111110',
  '0111111110',
  '.01111110.',
  '..000000..',
  '...0000...',
  '...0110...',
  '...0000...',
];

export const SHRINE_ACTIVE = [
  '..000000..',
  '.01111110.',
  '0111111110',
  '0133331110',
  '0133331110',
  '.03333310.',
  '..033330..',
  '...0330...',
  '...0330...',
  '...0000...',
];

// 6×8 stone (decorated, carved — Act I mute decor, Act IV glowing)
export const CARVED_STONE = [
  '.00000.',
  '011111.',
  '010010.',
  '011010.',
  '010110.',
  '011111.',
  '000000.',
  '.......',
];

// 6×4 bone bowl artifact (cabin table)
export const ARTIFACT_BOWL = [
  '.0000.',
  '011110',
  '031310',
  '.0000.',
];
