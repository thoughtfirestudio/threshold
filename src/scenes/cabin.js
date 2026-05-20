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
  tileX: 5, tileY: 7,
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
      if (player.queuedDir && isHeld(player.queuedDir)) {
        const d = player.queuedDir; player.queuedDir = null; tryMove(d);
      } else {
        player.queuedDir = null;
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
  // Floorboard lines at 16px tile boundaries
  for (let fy = 16; fy < 144; fy += 16) ctx.fillRect(0, fy, 160, 1);

  // Back wall rows 0-1 (y=0–32)
  dither(0, 0, 160, 32, A['1'], A['0']);
  // Shelf rail at bottom of row 1
  px(16, 29, 128, 3, A['0']);

  // Window tile (1,1): x=16–32, y=16–32
  px(16, 16, 16, 16, A['0']);
  px(18, 18, 5, 5, A['3']); px(25, 18, 5, 5, A['3']);
  px(18, 25, 5, 5, A['3']); px(25, 25, 5, 5, A['3']);
  ctx.fillStyle = A['2'];
  ctx.fillRect(23, 18, 2, 12); ctx.fillRect(18, 23, 12, 2);
  const wg = ctx.createRadialGradient(24, 24, 1, 24, 24, 20);
  wg.addColorStop(0, 'rgba(216,184,115,0.45)');
  wg.addColorStop(1, 'rgba(216,184,115,0)');
  ctx.fillStyle = wg; ctx.fillRect(8, 8, 32, 32);

  // Journal tile (3,1): x=48–64, y=16–32
  px(49, 18, 13, 11, A['1']); px(49, 18, 1, 11, A['0']); px(61, 18, 1, 11, A['0']); px(55, 18, 1, 11, A['2']);
  ctx.fillStyle = A['0'];
  for (let ly = 21; ly < 28; ly += 3) { ctx.fillRect(51, ly, 3, 1); ctx.fillRect(57, ly, 3, 1); }

  // Books tile (6,1): x=96–112, y=16–32
  [A['2'], A['3'], A['1'], A['2'], A['3']].forEach((c, i) => px(97 + i * 3, 17, 2, 12, c));

  // Mirror tile (8,1): x=128–144, y=16–32
  px(128, 16, 16, 16, A['0']); px(130, 18, 12, 12, A['1']);

  // Table: cols 3-6 (x=48–112), rows 3-4 (y=48–80) = 64×32px
  // Front face (the visible part players see)
  px(48, 48, 64, 32, A['0']);   // outer body
  px(50, 50, 60, 22, A['1']);   // surface
  // Front legs visible below table at y=80
  px(54, 80, 5, 14, A['0']);   // left leg
  px(101, 80, 5, 14, A['0']); // right leg

  // Tea tile (7,6): x=112–128, y=96–112
  px(116, 100, 9, 7, A['1']); px(115, 100, 10, 2, A['0']); px(115, 107, 11, 2, A['0']);
}

function drawArtifact() {
  const glow = Math.sin(bowlGlowT * 1.8) * 0.1 + 0.8;
  const ctx = getCtx();

  // Bowl sits on the table surface. Table surface at y=50.
  // ARTIFACT_BOWL 6×4 at 2× = 12×8. Center of table x=(48+112)/2=80, so bx=74.
  const bx = 74, by = 48;
  sprite(ARTIFACT_BOWL, bx, by, BOWL_PAL, 1, 2);

  // Glowing core (center of 12×8 sprite)
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = glow;
  ctx.fillRect(bx + 4, by + 2, 4, 3);
  ctx.globalAlpha = 1;

  const gg = ctx.createRadialGradient(bx+6, by+4, 1, bx+6, by+4, 24);
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
