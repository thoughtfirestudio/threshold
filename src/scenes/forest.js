// Forest scene — handles all three forest rooms (forest_1, forest_2, forest_3).
// One boolean (flags.hasCrossed) transforms the entire experience.
// The map renders once; interactables change behavior based on flags.

import {
  dither, sprite, radialGradientFill, drawOverlay, px, dots, getCtx,
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
  DEER_ALERT, DEER_CALM, MUSHROOM, LOG, SHRINE_EMPTY, SHRINE_ACTIVE,
  CARVED_STONE, TREE,
} from '../data/sprites.js';

const F  = PALETTES.FOREST;
const FW = { // "warm" forest — same palette, used post-crossing (fog less dense)
  ...PALETTES.FOREST,
  // Slightly warmer hint: override the lightest color
  '3': '#c4b898',
};

const MOVE_TIME = 0.14; // seconds per tile
const DEER_NERVE_THRESH = 1.4; // seconds of continuous close approach before deer bolts
const DEER_FLEE_DIST = 4;      // tiles (manhattan) — inside this, nervous timer ticks

const PLAYER_PAL = { '0': F['0'], '1': F['2'] };
const DEER_PAL_A = { '0': F['0'] };       // alert — darkest silhouette
const DEER_PAL_C = { '0': F['1'] };       // calm  — slightly lighter
const MUSH_PAL   = { '0': F['0'], '1': F['2'] };
const LOG_PAL    = { '0': F['0'], '1': F['1'] };
const STONE_PAL  = { '0': F['0'], '1': F['1'] };
const STONE_GLOW = { '0': F['2'], '1': F['3'] }; // after crossing: stones glow
const SHRINE_PAL = { '0': F['0'], '1': F['1'] };
const SHRINE_GLOW= { '0': F['1'], '1': F['2'], '3': F['3'] };

// ── Player state ────────────────────────────────────────────────────────────

const player = {
  tileX: 3, tileY: 6,
  // Visual pixel position (lerps toward tile * TILE + sprite centering offset)
  px: 0, py: 0,
  facing: 'down',
  moving: false,
  moveTimer: 0,
  // queued next direction (for responsive feel while mid-lerp)
  queuedDir: null,
};

function playerPixelTarget() {
  const { x, y } = tileToPixel(player.tileX, player.tileY, 12, 16);
  return { x, y };
}

function snapPlayerToTile() {
  const t = playerPixelTarget();
  player.px = t.x; player.py = t.y;
}

// ── Deer state ───────────────────────────────────────────────────────────────

const deer = {
  tileX: 5, tileY: 2,
  px: 0, py: 0,
  state: 'alert',   // 'alert' | 'calm' | 'bolted'
  boltTargetX: 6, boltTargetY: 0,
  nervousTimer: 0,
  boltProgress: 0,
};

function initDeer() {
  deer.tileX = 5; deer.tileY = 2;
  const { x, y } = tileToPixel(deer.tileX, deer.tileY, 16, 16);
  deer.px = x; deer.py = y;
  deer.state = flags.hasCrossed ? 'calm' : 'alert';
  deer.nervousTimer = 0;
  deer.boltProgress = 0;
}

// ── Shrine state ─────────────────────────────────────────────────────────────

let shrineGlowT = 0; // animates shrine glow after filling

// ── Room / scene state ───────────────────────────────────────────────────────

let currentRoom = 'forest_1';
let room = null; // current ROOMS entry

function enterRoom(id, px, py) {
  currentRoom = id;
  room = ROOMS[id];
  player.tileX = px ?? room.startX;
  player.tileY = py ?? room.startY;
  snapPlayerToTile();
  player.moving = false;
  player.queuedDir = null;
  if (id === 'forest_1') initDeer();
  if (autosaveCb) autosaveCb();
}

// Autosave wired from main.js
let autosaveCb = null;
export function setAutosave(cb) { autosaveCb = cb; }
export function getCurrentRoom() { return currentRoom; }
export function getPlayerTile() { return { x: player.tileX, y: player.tileY }; }

// ── Scene API ────────────────────────────────────────────────────────────────

export const forestScene = {
  enter({ room: r, x, y } = {}) {
    enterRoom(r || 'forest_1', x, y);
    shrineGlowT = flags.shrineFilled ? 1 : 0;
  },

  update(dt) {
    if (dlg.isActive()) {
      dlg.update(dt);
      return; // pause player movement during dialogue
    }

    updatePlayer(dt);
    if (currentRoom === 'forest_1') updateDeer(dt);
    if (flags.shrineFilled) shrineGlowT = Math.min(1, shrineGlowT + dt * 2);
  },

  draw() {
    const pal = flags.hasCrossed ? FW : F;
    drawTiles(room.tiles, pal);
    drawProps();
    drawPlayer();
    drawFog(pal);
    dlg.draw();
    drawOverlay(false);
  },

  exit() {},
};

// ── Movement ─────────────────────────────────────────────────────────────────

const DIR_DELTA = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };

function updatePlayer(dt) {
  if (player.moving) {
    player.moveTimer += dt;
    const frac = Math.min(player.moveTimer / MOVE_TIME, 1);
    const target = playerPixelTarget();
    // Record previous position (before lerp settles) for smooth interpolation
    player.px += (target.x - player.px) * Math.min(frac * 8 * dt / MOVE_TIME * 8, 1);
    player.py += (target.y - player.py) * Math.min(frac * 8 * dt / MOVE_TIME * 8, 1);

    if (player.moveTimer >= MOVE_TIME) {
      snapPlayerToTile();
      player.moving = false;
      player.moveTimer = 0;
      checkExit();
      // Only continue moving if the direction is still held (not a brief tap)
      if (player.queuedDir && isHeld(player.queuedDir)) {
        const d = player.queuedDir;
        player.queuedDir = null;
        tryMove(d);
      } else {
        player.queuedDir = null;
      }
    }
  } else {
    // Read fresh input this frame
    const dirs = ['up','down','left','right'];
    for (const d of dirs) {
      if (isHeld(d)) { tryMove(d); break; }
    }
  }

  // Queue input while moving for responsive feel
  if (player.moving) {
    for (const d of ['up','down','left','right']) {
      if (isHeld(d)) { player.queuedDir = d; break; }
    }
  }

  // Interact (A) — only when idle
  if (!player.moving && wasPressed('a')) {
    checkInteract();
  }
}

function tryMove(dir) {
  const [dx, dy] = DIR_DELTA[dir];
  const nx = player.tileX + dx;
  const ny = player.tileY + dy;
  player.facing = dir;

  if (isWalkable(nx, ny, room.tiles)) {
    player.tileX = nx;
    player.tileY = ny;
    player.moving = true;
    player.moveTimer = 0;
  } else {
    // If unwalkable because out-of-bounds, check for an edge exit
    fireEdgeExit(dir);
  }
}

const EDGE_MAP = { up: 'n', down: 's', left: 'w', right: 'e' };

function fireEdgeExit(dir) {
  const edge = EDGE_MAP[dir];
  for (const exit of room.exits) {
    if (exit.edge === edge) {
      if (exit.destRoom === 'cabin') {
        transition('cabin', { x: exit.destX, y: exit.destY });
      } else {
        enterRoom(exit.destRoom, exit.destX, exit.destY);
      }
      return;
    }
  }
}

function checkExit() {
  // Legacy — no longer needed with edge-exit firing in tryMove.
  // Kept as a no-op so call sites don't error.
}

function facingTile() {
  const [dx, dy] = DIR_DELTA[player.facing] || [0,0];
  return { x: player.tileX + dx, y: player.tileY + dy };
}

function checkInteract() {
  const ft = facingTile();
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
  dlg.start({ pages: d.pages, pal: F, onDone });
}

function fireInteract(id) {
  switch (id) {
    case 'deer':
      if (flags.hasCrossed) {
        startDlg('deer_calm');
      }
      // If alert and close enough, this would normally start a "watch each other" moment
      // but we don't force dialogue on the deer — player has to approach calmly
      break;

    case 'mushrooms_1': case 'mushrooms_2': case 'mushrooms_3': case 'mushrooms_4': {
      const key = (flags.hasCrossed && id !== 'mushrooms_1') ? 'mushrooms_2' : id;
      startDlg(key);
      break;
    }

    case 'log':
      startDlg('log');
      break;

    case 'stone_1':
      startDlg(flags.hasCrossed ? 'stone_1_after' : 'stone_1_before');
      break;

    case 'stone_2':
      startDlg(flags.hasCrossed ? 'stone_2_after' : 'stone_2_before');
      break;

    case 'shrine':
      if (flags.shrineFilled) {
        startDlg('shrine_filled');
      } else if (flags.hasCrossed) {
        startDlg('shrine_ready', () => {
          setFlag('shrineFilled');
          if (autosaveCb) autosaveCb();
        });
      } else {
        startDlg('shrine_before');
      }
      break;

    default:
      break;
  }
}

// ── Deer AI ───────────────────────────────────────────────────────────────────

function updateDeer(dt) {
  if (flags.hasCrossed) { deer.state = 'calm'; return; }
  if (deer.state === 'bolted') return;

  const dist = Math.abs(player.tileX - deer.tileX) + Math.abs(player.tileY - deer.tileY);
  if (deer.state === 'alert') {
    if (player.moving && dist < DEER_FLEE_DIST) {
      deer.nervousTimer += dt;
      if (deer.nervousTimer > DEER_NERVE_THRESH) {
        deer.state = 'bolted';
        deer.tileX = 6; deer.tileY = 0;
        const { x, y } = tileToPixel(deer.tileX, deer.tileY, 16, 16);
        deer.px = x; deer.py = y;
      }
    } else {
      deer.nervousTimer = Math.max(0, deer.nervousTimer - dt * 2);
    }
  }
}

// ── Drawing ───────────────────────────────────────────────────────────────────

function drawProps() {
  // Draw props based on current room and flags
  for (const obj of room.objects) {
    const px_ = obj.x * TILE;
    const py_ = obj.y * TILE;
    switch (obj.id) {
      case 'deer':
        drawDeer();
        break;
      case 'mushrooms_1': case 'mushrooms_2': case 'mushrooms_3': case 'mushrooms_4':
        // MUSHROOM 8×8 at 2× = 16×16; centering in 20px tile: offset 2
        sprite(MUSHROOM, px_ + 2, py_ + 2, MUSH_PAL, 1, 2);
        break;
      case 'log':
        drawLog(px_, py_);
        break;
      case 'stone_1': case 'stone_2':
        drawStone(obj, px_, py_);
        break;
      case 'shrine':
        drawShrine(px_, py_);
        break;
    }
  }
}

function drawDeer() {
  const dSprite = (flags.hasCrossed || deer.state === 'calm') ? DEER_CALM : DEER_ALERT;
  const dPal    = (flags.hasCrossed || deer.state === 'calm') ? DEER_PAL_C : DEER_PAL_A;
  sprite(dSprite, Math.round(deer.px), Math.round(deer.py), dPal, 1, 2);
}

function drawLog(bx, by) {
  // LOG 10×8 at 2× = 20×16; fits tile width exactly, y-center = (20-16)/2 = 2
  sprite(LOG, bx, by + 2, LOG_PAL, 1, 2);
}

function drawStone(obj, bx, by) {
  const glow = flags.hasCrossed;
  const pal = glow ? STONE_GLOW : STONE_PAL;
  // CARVED_STONE 7×8 at 2× = 14×16; x-center = (20-14)/2 = 3, y = 2
  sprite(CARVED_STONE, bx + 3, by + 2, pal, 1, 2);
  if (glow) {
    const ctx = getCtx();
    const g = ctx.createRadialGradient(bx+10, by+10, 1, bx+10, by+10, 16);
    g.addColorStop(0, 'rgba(200,185,120,0.4)');
    g.addColorStop(1, 'rgba(200,185,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(bx, by, 20, 20);
  }
}

function drawShrine(bx, by) {
  const active = flags.shrineFilled;
  const near   = flags.hasCrossed && !active;
  const pal = (active || near) ? SHRINE_GLOW : SHRINE_PAL;
  // SHRINE 10×10 at 2× = 20×20; fits tile exactly
  sprite(active ? SHRINE_ACTIVE : SHRINE_EMPTY, bx, by, pal, 1, 2);

  if (active) {
    const ctx = getCtx();
    const glowAlpha = 0.5 + Math.sin(shrineGlowT * 3) * 0.15;
    const g = ctx.createRadialGradient(bx+10, by+6, 1, bx+10, by+6, 28);
    g.addColorStop(0, `rgba(255,240,180,${glowAlpha})`);
    g.addColorStop(1, 'rgba(255,240,180,0)');
    ctx.fillStyle = g;
    ctx.fillRect(bx - 8, by - 8, 36, 36);
  }
}

function drawPlayer() {
  const sprites = { up: PLAYER_UP, down: PLAYER_DOWN, left: PLAYER_LEFT, right: PLAYER_RIGHT };
  sprite(sprites[player.facing] || PLAYER_DOWN,
         Math.round(player.px), Math.round(player.py), PLAYER_PAL, 1, 2);
}

function drawFog(pal) {
  // On the return pass the fog lifts — clearer, warmer, less obscuring
  const alpha = flags.hasCrossed ? 0.25 : 0.55;
  radialGradientFill(80, 72, 35, 'rgba(174,179,140,0)', 110,
                     `rgba(174,179,140,${alpha})`);
}
