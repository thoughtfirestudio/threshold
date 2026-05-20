// Cabin scene — intimate single room. The artifact on the table.
// The yes/no choice here is the hinge of the whole game.

import {
  dither, sprite, px, radialGradientFill, drawOverlay, getCtx,
} from '../engine/renderer.js';
import { isHeld, wasPressed } from '../engine/input.js';
import { isWalkable, drawTiles, TILE, tileToPixel } from '../engine/tilemap.js';
import { dlg } from '../engine/dialogue.js';
import { flags, setFlag } from '../engine/flags.js';
import { transition } from '../engine/scene.js';
import { PALETTES } from '../data/palettes.js';
import { ROOMS } from '../data/maps.js';
import { DIALOGUES } from '../data/dialogues.js';
import {
  PLAYER_DOWN, PLAYER_UP, PLAYER_LEFT, PLAYER_RIGHT,
  ARTIFACT_BOWL,
} from '../data/sprites.js';

const A = PALETTES.CABIN;
const PLAYER_PAL = { '0': A['0'], '1': A['2'] };
const BOWL_PAL   = { '0': A['0'], '1': A['1'], '3': A['3'] };

const MOVE_TIME = 0.14;

const player = {
  tileX: 4, tileY: 7,
  px: 0, py: 0,
  facing: 'down',
  moving: false,
  moveTimer: 0,
  queuedDir: null,
};

const room = ROOMS.cabin;

function snapPlayerToTile() {
  const { x, y } = tileToPixel(player.tileX, player.tileY, 12, 16);
  player.px = x; player.py = y;
}

let autosaveCb = null;
export function setCabinAutosave(cb) { autosaveCb = cb; }

let bowlGlowT = 0;

export const cabinScene = {
  enter({ x, y } = {}) {
    player.tileX = x ?? room.startX;
    player.tileY = y ?? room.startY;
    snapPlayerToTile();
    player.moving = false;
    player.facing = 'up'; // player walks in from south, faces north
    bowlGlowT = 0;
    if (autosaveCb) autosaveCb();
  },

  update(dt) {
    bowlGlowT += dt;
    if (dlg.isActive()) { dlg.update(dt); return; }
    updatePlayer(dt);
  },

  draw() {
    drawCabin();
    drawArtifact();
    drawPlayer();
    dlg.draw();
    drawOverlay(false);
  },

  exit() {},
};

// ── Movement (same grid-lerp logic as forest.js) ─────────────────────────────

const DIR_DELTA = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };

function updatePlayer(dt) {
  if (player.moving) {
    player.moveTimer += dt;
    const target = tileToPixel(player.tileX, player.tileY, 12, 16);
    player.px += (target.x - player.px) * Math.min(dt * 14, 1);
    player.py += (target.y - player.py) * Math.min(dt * 14, 1);
    if (player.moveTimer >= MOVE_TIME) {
      snapPlayerToTile();
      player.moving = false;
      player.moveTimer = 0;
      checkExit();
      if (player.queuedDir) {
        const d = player.queuedDir; player.queuedDir = null; tryMove(d);
      }
    }
  } else {
    for (const d of ['up','down','left','right']) {
      if (isHeld(d)) { tryMove(d); break; }
    }
  }
  if (player.moving) {
    for (const d of ['up','down','left','right']) {
      if (isHeld(d)) { player.queuedDir = d; break; }
    }
  }
  if (!player.moving && wasPressed('a')) checkInteract();
}

const EDGE_MAP = { up: 'n', down: 's', left: 'w', right: 'e' };

function tryMove(dir) {
  const [dx, dy] = DIR_DELTA[dir];
  const nx = player.tileX + dx, ny = player.tileY + dy;
  player.facing = dir;
  if (isWalkable(nx, ny, room.tiles)) {
    player.tileX = nx; player.tileY = ny;
    player.moving = true; player.moveTimer = 0;
  } else {
    fireEdgeExit(dir);
  }
}

function fireEdgeExit(dir) {
  const edge = EDGE_MAP[dir];
  for (const exit of room.exits) {
    if (exit.edge === edge) {
      transition('forest', { room: exit.destRoom, x: exit.destX, y: exit.destY });
      return;
    }
  }
}

function checkExit() {
  // No longer needed — exits fire from tryMove when walking into out-of-bounds tile.
}

function facingTile() {
  const [dx, dy] = DIR_DELTA[player.facing];
  return { x: player.tileX + dx, y: player.tileY + dy };
}

function checkInteract() {
  const ft = facingTile();
  // Check facing tile AND the tile 2 steps ahead (for objects on the far side of a wall like the table)
  const [dx, dy] = DIR_DELTA[player.facing];
  const ft2 = { x: ft.x + dx, y: ft.y + dy };
  for (const obj of room.objects) {
    if ((obj.x === ft.x  && obj.y === ft.y) ||
        (obj.x === ft2.x && obj.y === ft2.y) ||
        (obj.x === player.tileX && obj.y === player.tileY)) {
      fireInteract(obj.id);
      return;
    }
  }
}

// ── Interactions ──────────────────────────────────────────────────────────────

function startDlg(key, onDone) {
  const d = DIALOGUES[key];
  if (!d) { if (onDone) onDone(); return; }
  dlg.start({ pages: d.pages, pal: A, onDone });
}

function fireInteract(id) {
  switch (id) {
    case 'artifact':
      if (flags.hasCrossed) {
        // Bowl is inert on return
        startDlg('artifact');
      } else {
        // THE moment — show text then offer choice
        startDlg('artifact', () => {
          dlg.start({
            pages: [['What will you do?']],
            pal: A,
            choice: {
              options: ['Use it.', 'Not yet.'],
              callback: (sel) => {
                if (sel === 0) {
                  // Use it → threshold warp
                  transition('threshold', {});
                } else {
                  // Not yet → stay in cabin
                  dlg.start({
                    pages: [['The bowl waits.', 'Warm and patient.']],
                    pal: A,
                  });
                }
              },
            },
          });
        });
      }
      break;

    case 'journal':
      startDlg(flags.hasCrossed ? 'journal_after' : 'journal_before', () => {
        if (!flags.journalRead) { setFlag('journalRead'); if (autosaveCb) autosaveCb(); }
      });
      break;

    case 'mirror':
      startDlg(flags.hasCrossed ? 'mirror_after' : 'mirror_before', () => {
        if (!flags.mirrorSeen) { setFlag('mirrorSeen'); if (autosaveCb) autosaveCb(); }
      });
      break;

    case 'books':
      startDlg('books');
      break;

    case 'window':
      startDlg('window');
      break;

    case 'tea':
      startDlg(flags.hasCrossed ? 'tea_after' : 'tea');
      break;
  }
}

// ── Drawing ───────────────────────────────────────────────────────────────────

function drawCabin() {
  // Floor — warm dither
  dither(0, 0, 160, 144, A['1'], A['0']);
  // Floorboard lines at tile row boundaries
  const ctx = getCtx();
  ctx.fillStyle = A['0'];
  for (let fy = 20; fy < 144; fy += 20) ctx.fillRect(0, fy, 160, 1);

  // Back wall (row 0 = 0–20px)
  dither(0, 0, 160, 20, A['1'], A['0']);

  // Window at tile (1,1): x=20–40, y=20–40
  px(20, 20, 20, 20, A['0']);           // frame
  px(22, 22, 7, 7, A['3']);            // pane TL
  px(31, 22, 7, 7, A['3']);            // pane TR
  px(22, 31, 7, 7, A['3']);            // pane BL
  px(31, 31, 7, 7, A['3']);            // pane BR
  ctx.fillStyle = A['2'];
  ctx.fillRect(29, 22, 2, 16);         // vertical cross
  ctx.fillRect(22, 29, 16, 2);         // horizontal cross
  const wg = ctx.createRadialGradient(30, 30, 2, 30, 30, 24);
  wg.addColorStop(0, 'rgba(216,184,115,0.45)');
  wg.addColorStop(1, 'rgba(216,184,115,0)');
  ctx.fillStyle = wg; ctx.fillRect(14, 14, 32, 32);

  // Journal at tile (2,1): x=40–60, y=20–40 — open book, ink trailing off
  px(41, 22, 18, 14, A['1']);          // pages
  px(41, 22, 1, 14, A['0']);           // left cover
  px(58, 22, 1, 14, A['0']);           // right cover
  px(49, 22, 2, 14, A['2']);           // spine
  ctx.fillStyle = A['0'];
  for (let ly = 25; ly < 34; ly += 3) ctx.fillRect(43, ly, 5, 1); // ink lines left
  for (let ly = 25; ly < 34; ly += 3) ctx.fillRect(51, ly, 5, 1); // ink lines right

  // Books at tile (5,1): x=100–120, y=20–40
  px(100, 34, 20, 2, A['0']);          // shelf board
  const bookColors = [A['2'], A['3'], A['1'], A['2']];
  bookColors.forEach((c, i) => { px(101 + i * 5, 20, 4, 14, c); });

  // Mirror at tile (6,1): x=120–140, y=20–40
  px(120, 20, 20, 20, A['0']);         // frame
  px(122, 22, 16, 16, A['1']);         // surface

  // Table: visually spans x=44–116, tiles (3,3) and (3,4) are wall
  px(44, 58, 72, 22, A['0']);          // tabletop
  px(46, 60, 68, 14, A['1']);          // surface
  px(48, 82, 6, 20, A['0']);           // left leg
  px(110, 82, 6, 20, A['0']);          // right leg

  // Tea at tile (2,5): x=40–60, y=100–120
  px(44, 106, 12, 8, A['1']);          // cup body
  px(43, 106, 13, 2, A['0']);          // cup rim
  px(43, 114, 14, 2, A['0']);          // saucer
}

function drawArtifact() {
  const glow = Math.sin(bowlGlowT * 1.8) * 0.1 + 0.8;
  const ctx = getCtx();

  // Bowl centered on table: ARTIFACT_BOWL 6×4 at 2× = 12×8
  // Table surface at y=60–74; bowl sits at y=50 (floating above)
  const bx = 74, by = 50;
  sprite(ARTIFACT_BOWL, bx, by, BOWL_PAL, 1, 2);

  // Glowing core (center of 12×8 sprite)
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = glow;
  ctx.fillRect(bx + 4, by + 2, 4, 3);
  ctx.globalAlpha = 1;

  // Halo
  const gg = ctx.createRadialGradient(bx+6, by+4, 1, bx+6, by+4, 26);
  gg.addColorStop(0, `rgba(216,184,115,${glow * 0.6})`);
  gg.addColorStop(1, 'rgba(216,184,115,0)');
  ctx.fillStyle = gg;
  ctx.fillRect(bx - 20, by - 20, 52, 48);
}

function drawPlayer() {
  const sprites = { up: PLAYER_UP, down: PLAYER_DOWN, left: PLAYER_LEFT, right: PLAYER_RIGHT };
  sprite(sprites[player.facing] || PLAYER_DOWN,
         Math.round(player.px), Math.round(player.py), PLAYER_PAL, 1, 2);
}
