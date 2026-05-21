// Hyperspace — entity encounter scenes.
// Four entities in sequence: Weaver → Twin → Gardener → Threshold.
// After each dialogue, auto-advance to the next (with a flash).
// The pixel grid misbehaves here. High-saturation. Everything inverts.

import { px, dither, sprite, drawOverlay, getCtx, radialGradientFill } from '../engine/renderer.js';
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
} from '../data/sprites.js';

const HS = PALETTES.HYPERSPACE;
// Inverted dialogue palette (light background, dark text)
const HD = { '0': HS['3'], '3': HS['0'] };

const ENTITIES = ['weaver', 'twin', 'gardener', 'threshold_entity'];
const ENTITY_ROOMS = {
  weaver:           'hyper_weaver',
  twin:             'hyper_twin',
  gardener:         'hyper_gardener',
  threshold_entity: 'hyper_threshold',
};
const ENTITY_FLAG = {
  weaver:   'metWeaver',
  twin:     'metTwin',
  gardener: 'metGardener',
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

let currentEntity = 'weaver';
let animT = 0;           // global time for background animations
let flashT = -1;         // >0 = white flash transitioning to next entity
let talked = false;      // has player completed dialogue with current entity?
let endingChoice = -1;   // -1 = not chosen, 0 = "I'm ready", 1 = "Wait"

let autosaveCb = null;
export function setHyperspaceAutosave(cb) { autosaveCb = cb; }

function snapToTile() {
  const { x, y } = tileToPixel(player.tileX, player.tileY, 12, 16);
  player.px = x; player.py = y;
}

function enterEntity(id) {
  currentEntity = id;
  const room = ROOMS[ENTITY_ROOMS[id]];
  player.tileX = room.startX; player.tileY = room.startY;
  snapToTile();
  player.moving = false;
  player.queuedDir = null;
  player.facing = 'up';
  talked = false;
  animT = 0;
  flashT = -1;
}

export const hyperspaceScene = {
  enter({ entity } = {}) {
    enterEntity(entity || 'weaver');
    endingChoice = -1;
  },

  update(dt) {
    animT += dt;

    // Flash transition between entities
    if (flashT >= 0) {
      flashT += dt;
      if (flashT > 0.6) {
        flashT = -1;
        const next = nextEntity(currentEntity);
        if (next) {
          enterEntity(next);
        } else {
          // All entities done — go to ending
          transition('ending', { choice: endingChoice });
        }
      }
      return; // freeze movement during flash
    }

    if (dlg.isActive()) { dlg.update(dt); return; }

    updatePlayer(dt);
  },

  draw() {
    drawBackground(); // entity visuals are drawn inside drawEntityBackground()
    drawPlayer();
    dlg.draw();

    // Flash overlay
    if (flashT >= 0) {
      const alpha = flashT < 0.3 ? flashT / 0.3 : 1 - (flashT - 0.3) / 0.3;
      const ctx = getCtx();
      ctx.globalAlpha = Math.min(1, alpha);
      px(0, 0, 160, 144, '#ffffff');
      ctx.globalAlpha = 1;
    }

    drawOverlay(true);
  },

  exit() {},
};

// ── Entity sequence ───────────────────────────────────────────────────────────

function nextEntity(id) {
  const idx = ENTITIES.indexOf(id);
  if (idx < 0 || idx >= ENTITIES.length - 1) return null;
  return ENTITIES[idx + 1];
}

// ── Movement (same grid-lerp) ─────────────────────────────────────────────────

const DIR_DELTA = { up:[0,-1], down:[0,1], left:[-1,0], right:[1,0] };

function updatePlayer(dt) {
  const room = ROOMS[ENTITY_ROOMS[currentEntity]];

  if (player.moving) {
    player.moveTimer += dt;
    const target = tileToPixel(player.tileX, player.tileY, 12, 16);
    player.px += (target.x - player.px) * Math.min(dt * 14, 1);
    player.py += (target.y - player.py) * Math.min(dt * 14, 1);
    if (player.moveTimer >= MOVE_TIME) {
      snapToTile();
      player.moving = false; player.moveTimer = 0;
      if (player.queuedDir && isHeld(player.queuedDir)) {
        const d = player.queuedDir; player.queuedDir = null; tryMove(d, room);
      } else {
        player.queuedDir = null;
      }
    }
  } else {
    for (const d of ['up','down','left','right']) {
      if (isHeld(d)) { tryMove(d, room); break; }
    }
  }
  if (player.moving) {
    for (const d of ['up','down','left','right']) {
      if (isHeld(d)) { player.queuedDir = d; break; }
    }
  }

  if (!player.moving && wasPressed('a') && !talked) {
    checkInteract(room);
  }
}

function tryMove(dir, room) {
  const [dx, dy] = DIR_DELTA[dir];
  const nx = player.tileX + dx, ny = player.tileY + dy;
  player.facing = dir;
  // All hyperspace rooms are fully walkable, but clamp to grid bounds
  if (nx >= 0 && ny >= 0 && nx < 10 && ny < 9) {
    player.tileX = nx; player.tileY = ny;
    player.moving = true; player.moveTimer = 0;
  }
}

function checkInteract(room) {
  const [dx, dy] = DIR_DELTA[player.facing];
  const ftx = player.tileX + dx, fty = player.tileY + dy;
  for (const obj of room.objects) {
    const dist = Math.abs(obj.x - player.tileX) + Math.abs(obj.y - player.tileY);
    if (dist <= 2) { // within 2 tiles triggers dialogue
      fireInteract(obj.id);
      return;
    }
  }
}

function fireInteract(id) {
  const dlgKey = id; // dialogue keys match entity IDs
  const d = DIALOGUES[dlgKey];
  if (!d) return;

  if (id === 'threshold_entity') {
    // Final entity — offer the ending choice after text
    dlg.start({
      pages: d.pages,
      pal: HD,
      onDone: () => {
        dlg.start({
          pages: [['Make your choice.']],
          pal: HD,
          choice: {
            options: ["I'm ready.", "Wait."],
            callback: (sel) => {
              endingChoice = sel;
              talked = true;
              if (ENTITY_FLAG[id]) setFlag(ENTITY_FLAG[id]);
              if (autosaveCb) autosaveCb();
              flashT = 0; // begin transition flash → ending
            },
          },
        });
      },
    });
  } else {
    dlg.start({
      pages: d.pages,
      pal: HD,
      onDone: () => {
        talked = true;
        if (ENTITY_FLAG[id]) setFlag(ENTITY_FLAG[id]);
        if (autosaveCb) autosaveCb();
        // Brief pause then flash to next entity
        setTimeout(() => { flashT = 0; }, 400);
      },
    });
  }
}

// ── Drawing ───────────────────────────────────────────────────────────────────

function getEntityCenter() {
  const room = ROOMS[ENTITY_ROOMS[currentEntity]];
  const obj = room.objects[0];
  return { ecx: obj.x * TILE + TILE / 2, ecy: obj.y * TILE + TILE / 2 };
}

function drawBackground() {
  const ctx = getCtx();
  const { ecx, ecy } = getEntityCenter();

  // Animated tiling ground
  const offset = Math.floor(animT * 20) % 8;
  for (let y = -offset; y < 144; y += 8) {
    for (let x = -offset; x < 160; x += 8) {
      const t2 = ((x + y) / 8 + Math.floor(animT * 2)) % 3;
      ctx.fillStyle = t2 < 1 ? HS['0'] : t2 < 2 ? HS['1'] : HS['5'];
      ctx.globalAlpha = 0.55;
      ctx.fillRect(x, y, 8, 8);
    }
  }
  ctx.globalAlpha = 1;

  // Perspective lines converging to entity center
  for (let a = 0; a < 16; a++) {
    const ang = a * Math.PI / 8;
    ctx.strokeStyle = a % 2 ? HS['2'] : HS['3'];
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ecx, ecy);
    ctx.lineTo(ecx + Math.cos(ang) * 120, ecy + Math.sin(ang) * 120);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Floating cross symbols
  ctx.fillStyle = HS['4'];
  const symT = animT * 0.4;
  [[20,20],[140,16],[30,70],[134,64]].forEach(([sx,sy], i) => {
    const oy = Math.sin(symT + i * 1.5) * 3;
    ctx.fillRect(sx, sy + oy, 2, 8);
    ctx.fillRect(sx-3, sy+3+oy, 8, 2);
  });

  drawEntityBackground(ctx, ecx, ecy);
}

function drawEntityBackground(ctx, ecx, ecy) {

  if (currentEntity === 'weaver') {
    // Pulsing diamond/geometric entity body
    const pulse = Math.sin(animT * 2) * 2;
    diamond(ctx, ecx, ecy, 18 + pulse, [HS['3'], HS['2'], HS['1'], HS['4'], HS['5']]);
    // Glowing eye
    ctx.fillStyle = '#fff'; ctx.fillRect(ecx-2, ecy-2, 4, 4);
    ctx.fillStyle = HS['0']; ctx.fillRect(ecx-1, ecy-1, 2, 2);
  } else if (currentEntity === 'twin') {
    // Twin: mirrors the player sprite but inverted colors
    const twinPal = { '0': HS['3'], '1': HS['2'] };
    // Draw twin at entity center (ecx/ecy), offset so sprite is centered
    const x = ecx - 6, y = ecy - 8;
    sprite(PLAYER_DOWN, x, y, twinPal, 1, 2);
    const mPal = { '0': HS['4'], '1': HS['1'] };
    sprite(PLAYER_DOWN, x, y, mPal, 0.4, 2);
  } else if (currentEntity === 'gardener') {
    // Gardener: floats above a lattice of growing symbols
    diamond(ctx, ecx, ecy, 12, [HS['4'], HS['3'], HS['2']]);
    // Tending floating symbols (move more actively)
    ctx.fillStyle = HS['3'];
    [[-20,10],[20,10],[0,-15],[-10,20],[10,20]].forEach(([ox,oy], i) => {
      const t2 = animT * 0.7 + i * 0.8;
      ctx.fillRect(ecx + ox, ecy + oy + Math.sin(t2) * 4, 2, 6);
      ctx.fillRect(ecx + ox - 2, ecy + oy + 2 + Math.sin(t2) * 4, 6, 2);
    });
  } else if (currentEntity === 'threshold_entity') {
    // The Threshold entity: a doorway shape, glowing
    const ph = Math.sin(animT * 1.5) * 0.2 + 0.8;
    // Door frame
    ctx.strokeStyle = HS['3'];
    ctx.lineWidth = 2;
    ctx.globalAlpha = ph;
    ctx.beginPath();
    ctx.moveTo(ecx - 10, ecy + 20);
    ctx.lineTo(ecx - 10, ecy - 20);
    ctx.arc(ecx, ecy - 20, 10, Math.PI, 0);
    ctx.lineTo(ecx + 10, ecy + 20);
    ctx.stroke();
    ctx.globalAlpha = 1;
    // Glow from inside the door
    const dg = ctx.createRadialGradient(ecx, ecy, 0, ecx, ecy, 18);
    dg.addColorStop(0, `rgba(255,225,77,${ph * 0.6})`);
    dg.addColorStop(1, 'rgba(255,225,77,0)');
    ctx.fillStyle = dg;
    ctx.fillRect(ecx - 18, ecy - 20, 36, 40);
  }
}

function diamond(ctx, cx, cy, size, colors) {
  for (let dy = -size; dy <= size; dy++) {
    const w = size - Math.abs(dy);
    for (let dx = -w; dx <= w; dx++) {
      const d = Math.abs(dx) + Math.abs(dy);
      ctx.fillStyle = colors[d % colors.length];
      ctx.fillRect(cx + dx, cy + dy, 1, 1);
    }
  }
}

function drawPlayer() {
  const spriteMap = { up: PLAYER_UP, down: PLAYER_DOWN, left: PLAYER_LEFT, right: PLAYER_RIGHT };
  const hsPal = { '0': HS['3'], '1': HS['0'], '2': HS['4'] };
  sprite(spriteMap[player.facing] || PLAYER_DOWN,
         Math.round(player.px), Math.round(player.py), hsPal, 1, 2);
}
