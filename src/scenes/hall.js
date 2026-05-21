// Hall scene — Elite Four-style linear corridor.
// Three rooms with locked doors (unlocked by speaking to the hooded figure inside).
// Final chamber holds a bowl of smoke. Yes → threshold warp → hyperspace.

import { px, sprite, drawOverlay, getCtx } from '../engine/renderer.js';
import { isHeld, wasPressed } from '../engine/input.js';
import { isWalkable, TILE, tileToPixel } from '../engine/tilemap.js';
import { dlg } from '../engine/dialogue.js';
import { flags, setFlag } from '../engine/flags.js';
import { transition } from '../engine/scene.js';
import { PALETTES } from '../data/palettes.js';
import { ROOMS } from '../data/maps.js';
import { DIALOGUES } from '../data/dialogues.js';
import {
  PLAYER_DOWN, PLAYER_UP, PLAYER_LEFT, PLAYER_RIGHT,
  HOODED_FIGURE,
} from '../data/sprites.js';

const H = PALETTES.HALL;
const HD = { '0': H['3'], '3': H['0'] }; // inverted for dialogue on dark bg
const PLAYER_PAL  = { '0': H['0'], '1': H['2'], '2': H['3'] };
const FIGURE_PAL  = { '0': H['0'], '1': H['2'], '2': H['3'] };

// Per-room metadata
const ROOM_META = {
  hall_1:       { doorFlag: 'door1Open', nextRoom: 'hall_2',       prevRoom: null     },
  hall_2:       { doorFlag: 'door2Open', nextRoom: 'hall_3',       prevRoom: 'hall_1' },
  hall_3:       { doorFlag: 'door3Open', nextRoom: 'hall_chamber', prevRoom: 'hall_2' },
  hall_chamber: { doorFlag: null,        nextRoom: null,            prevRoom: 'hall_3' },
};

const MOVE_TIME = 0.14;

const player = {
  tileX: 5, tileY: 7,
  px: 0, py: 0,
  facing: 'up',
  moving: false,
  moveTimer: 0,
  queuedDir: null,
};

let currentRoom = 'hall_1';
let room = null;
let animT = 0;

let autosaveCb = null;
export function setHallAutosave(cb) { autosaveCb = cb; }
export function getHallRoom()      { return currentRoom; }
export function getHallPlayerTile(){ return { x: player.tileX, y: player.tileY }; }

function snapToTile() {
  const { x, y } = tileToPixel(player.tileX, player.tileY, 12, 16);
  player.px = x; player.py = y;
}

function enterRoom(id, startX, startY) {
  currentRoom = id;
  room = ROOMS[id];
  player.tileX = startX ?? room.startX;
  player.tileY = startY ?? room.startY;
  snapToTile();
  player.moving  = false;
  player.queuedDir = null;
  player.facing  = 'up';
  if (autosaveCb) autosaveCb();
}

export const hallScene = {
  enter({ room: r, x, y } = {}) {
    animT = 0;
    enterRoom(r || 'hall_1', x, y);
  },

  update(dt) {
    animT += dt;
    if (dlg.isActive()) { dlg.update(dt); return; }
    updatePlayer(dt);
  },

  draw() {
    drawHall();
    drawObjects();
    drawPlayer();
    dlg.draw();
    drawOverlay(false);
  },

  exit() {},
};

// ── Movement ──────────────────────────────────────────────────────────────────

const DIR_DELTA = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };

function updatePlayer(dt) {
  if (player.moving) {
    player.moveTimer += dt;
    const target = tileToPixel(player.tileX, player.tileY, 12, 16);
    player.px += (target.x - player.px) * Math.min(dt * 14, 1);
    player.py += (target.y - player.py) * Math.min(dt * 14, 1);
    if (player.moveTimer >= MOVE_TIME) {
      snapToTile();
      player.moving = false; player.moveTimer = 0;
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

function tryMove(dir) {
  const [dx, dy] = DIR_DELTA[dir];
  const nx = player.tileX + dx, ny = player.tileY + dy;
  player.facing = dir;
  if (isWalkable(nx, ny, room.tiles)) {
    player.tileX = nx; player.tileY = ny;
    player.moving = true; player.moveTimer = 0;
  } else {
    if (ny < 0)  fireNorthExit();
    // south: blocked silently — there is only forward
  }
}

function fireNorthExit() {
  const meta = ROOM_META[currentRoom];
  if (!meta || !meta.nextRoom) return; // hall_chamber: no north exit
  if (flags[meta.doorFlag]) {
    enterRoom(meta.nextRoom, 5, 7);
  } else {
    dlg.start({
      pages: [['The door will not open.', 'Not yet.']],
      pal: HD,
    });
  }
}

function checkInteract() {
  const [dx, dy] = DIR_DELTA[player.facing];
  for (const obj of room.objects) {
    const dist = Math.abs(obj.x - player.tileX) + Math.abs(obj.y - player.tileY);
    if (dist <= 2) {
      fireInteract(obj.id);
      return;
    }
  }
}

function fireInteract(id) {
  const meta = ROOM_META[currentRoom];

  if (id === 'bowl') {
    const d = DIALOGUES['bowl'];
    dlg.start({
      pages: d.pages,
      pal: HD,
      onDone: () => {
        dlg.start({
          pages: [['The smoke curls toward you.']],
          pal: HD,
          choice: {
            options: ['Inhale.', 'Not yet.'],
            callback: (sel) => {
              if (sel === 0) {
                setFlag('hasCrossed', true);
                if (autosaveCb) autosaveCb();
                transition('threshold', {});
              }
              // sel === 1: do nothing — player can keep walking
            },
          },
        });
      },
    });
    return;
  }

  // Hooded figure
  const d = DIALOGUES[id];
  if (!d) return;

  const alreadyTalked = meta && meta.doorFlag && flags[meta.doorFlag];
  if (alreadyTalked) {
    dlg.start({ pages: [['...'], ['Go forward.']], pal: HD });
    return;
  }

  dlg.start({
    pages: d.pages,
    pal: HD,
    onDone: () => {
      if (meta && meta.doorFlag) {
        setFlag(meta.doorFlag, true);
        if (autosaveCb) autosaveCb();
      }
    },
  });
}

// ── Drawing ───────────────────────────────────────────────────────────────────

function drawHall() {
  const ctx = getCtx();

  // Floor base
  px(0, 0, 160, 144, H['1']);

  // Subtle floor tile lines
  ctx.fillStyle = H['0'];
  for (let row = 1; row < 9; row++) ctx.fillRect(0, row * TILE, 160, 1);
  ctx.fillRect(0, 0, 1, 144);

  // Wall tiles
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 10; col++) {
      if (room.tiles[row][col] !== 1) continue;
      const x = col * TILE, y = row * TILE;
      px(x, y, TILE, TILE, H['0']);
      // Stone block highlight (top-left edge, lighter suggest)
      ctx.fillStyle = H['1'];
      ctx.fillRect(x + 1, y + 1, TILE - 2, 1);
      ctx.fillRect(x + 1, y + 1, 1, TILE - 2);
    }
  }

  // North door arch
  drawNorthDoor(ctx);

  // Torch glow on side walls, mid-height
  drawTorch(ctx, 16 + 6, 4 * TILE + 8);   // col 1
  drawTorch(ctx, 8 * TILE + 6, 4 * TILE + 8); // col 8

  // Central carpet strip (cols 4-5)
  ctx.fillStyle = H['2'];
  ctx.globalAlpha = 0.18;
  ctx.fillRect(4 * TILE, 0, 2 * TILE, 9 * TILE);
  ctx.globalAlpha = 1;
}

function drawNorthDoor(ctx) {
  const meta = ROOM_META[currentRoom];
  if (!meta || !meta.nextRoom) return; // hall_chamber: solid north wall

  const isOpen = meta.doorFlag && flags[meta.doorFlag];
  const dx = 4 * TILE; // x=64
  const dw = 2 * TILE; // width=32

  // Arch frame pillars
  ctx.fillStyle = H['2'];
  ctx.fillRect(dx,          0, 3, TILE);
  ctx.fillRect(dx + dw - 3, 0, 3, TILE);
  ctx.fillRect(dx + 3,      0, dw - 6, 3);

  if (isOpen) {
    // Void beyond — draw darkness fading to black
    px(dx + 3, 3, dw - 6, TILE - 3, '#000000');
    // Faint gold glow from beyond
    const g = ctx.createRadialGradient(dx + dw / 2, 0, 0, dx + dw / 2, 0, 24);
    g.addColorStop(0, 'rgba(200,168,75,0.35)');
    g.addColorStop(1, 'rgba(200,168,75,0)');
    ctx.fillStyle = g;
    ctx.fillRect(dx, 0, dw, 24);
  } else {
    // Closed door face
    ctx.fillStyle = H['1'];
    ctx.fillRect(dx + 3, 3, dw - 6, TILE - 3);
    // Keyhole
    ctx.fillStyle = H['0'];
    ctx.fillRect(dx + dw / 2 - 1, 8, 2, 5);
    ctx.fillRect(dx + dw / 2 - 2, 8, 4, 2);
  }
}

function drawTorch(ctx, tx, ty) {
  const flicker = Math.sin(animT * 7 + tx * 0.1) * 0.12 + 0.5;
  const g = ctx.createRadialGradient(tx, ty, 0, tx, ty, 20);
  g.addColorStop(0, `rgba(200,168,75,${flicker})`);
  g.addColorStop(1, 'rgba(200,168,75,0)');
  ctx.fillStyle = g;
  ctx.fillRect(tx - 20, ty - 20, 40, 40);

  // Torch bracket (2×5 px)
  ctx.fillStyle = H['3'];
  ctx.fillRect(tx - 1, ty - 4, 2, 5);
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = flicker * 0.9;
  ctx.fillRect(tx - 1, ty - 5, 2, 2);
  ctx.globalAlpha = 1;
}

function drawObjects() {
  for (const obj of room.objects) {
    const ox = obj.x * TILE;
    const oy = obj.y * TILE;

    if (obj.id === 'figure_1' || obj.id === 'figure_2' || obj.id === 'figure_3') {
      sprite(HOODED_FIGURE, ox + 2, oy, FIGURE_PAL, 1, 2);
    } else if (obj.id === 'bowl') {
      drawAltarAndBowl(ox, oy);
    }
  }
}

function drawAltarAndBowl(tileX, tileY) {
  const ctx = getCtx();
  // Altar surface spans cols 4-6 (x=64..112), row 3 (y=48..64)
  const ax = 4 * TILE, ay = 3 * TILE;
  const aw = 3 * TILE; // 48px wide

  // Altar stone surface
  ctx.fillStyle = H['2'];
  ctx.fillRect(ax, ay, aw, 3);        // top surface edge
  ctx.fillStyle = H['1'];
  ctx.fillRect(ax, ay + 3, aw, 13);  // altar body

  // Bowl centered on altar (cx = 80, sitting at y = ay = 48)
  const cx = 80, by = ay - 2;
  const glowA = 0.35 + Math.sin(animT * 1.8) * 0.1;

  // Glow from bowl
  const g = ctx.createRadialGradient(cx, by, 0, cx, by, 22);
  g.addColorStop(0, `rgba(200,168,75,${glowA * 1.6})`);
  g.addColorStop(1, 'rgba(200,168,75,0)');
  ctx.fillStyle = g;
  ctx.fillRect(cx - 22, by - 16, 44, 40);

  // Bowl body (pixel-art, 2× scale, ~12×8 px)
  ctx.fillStyle = H['2'];
  ctx.fillRect(cx - 6, by,     12, 2); // bowl rim
  ctx.fillRect(cx - 4, by + 2,  8, 4); // bowl body
  ctx.fillStyle = H['0'];
  ctx.fillRect(cx - 6, by,      2, 6); // left wall
  ctx.fillRect(cx + 4, by,      2, 6); // right wall
  ctx.fillRect(cx - 4, by + 6,  8, 1); // base

  // Glowing interior
  ctx.fillStyle = H['3'];
  ctx.globalAlpha = glowA;
  ctx.fillRect(cx - 2, by + 2, 4, 3);
  ctx.globalAlpha = 1;

  drawSmoke(ctx, cx, by);
}

function drawSmoke(ctx, cx, cy) {
  for (let i = 0; i < 7; i++) {
    const ot  = ((animT * 0.55 + i * 0.22) % 1);
    const sx  = cx + Math.sin(animT * 1.4 + i * 1.1) * 4;
    const sy  = cy - ot * 22;
    const alpha = (1 - ot) * 0.6;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = H['3'];
    ctx.fillRect(Math.round(sx) - 1, Math.round(sy), 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  const spriteMap = { up: PLAYER_UP, down: PLAYER_DOWN, left: PLAYER_LEFT, right: PLAYER_RIGHT };
  sprite(spriteMap[player.facing] || PLAYER_DOWN,
         Math.round(player.px), Math.round(player.py), PLAYER_PAL, 1, 2);
}
