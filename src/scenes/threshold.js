// THE THRESHOLD — the warp transition.
// ~2 seconds. This is the hinge of the whole game. Make the floor change.
//
// Sequence (t = 0 → 1):
//   0.00–0.25  Amber light collapses to center point
//   0.25–0.55  Concentric rings bloom outward, palette bleeds
//   0.55–0.80  Player sprite dissolves into scattered pixels
//   0.80–1.00  White core explodes → fills screen
//   1.00       Cut to hyperspace

import { px, clear, sprite, drawOverlay, getCtx } from '../engine/renderer.js';
import { transition } from '../engine/scene.js';
import { PALETTES } from '../data/palettes.js';
import { PLAYER_DOWN } from '../data/sprites.js';

const F  = PALETTES.FOREST;
const A  = PALETTES.CABIN;
const HS = PALETTES.HYPERSPACE;

const DURATION = 2.0;

const RING_COLS = [
  A['2'], A['3'], F['2'], F['3'],
  '#8a6a3a', '#e0379b', HS['1'], HS['2'], HS['3'], HS['4'],
];

let t = 0;
let done = false;

// Seeded scatter positions for the dissolving player pixels (deterministic)
const SCATTER = Array.from({ length: 40 }, (_, i) => ({
  ang: (i / 40) * Math.PI * 2 + i * 0.3,
  d:   (i * 7 + 3) % 22,
}));

export const thresholdScene = {
  enter() {
    t = 0;
    done = false;
  },

  update(dt) {
    if (done) return;
    t += dt / DURATION;
    if (t >= 1) {
      t = 1;
      done = true;
      transition('hyperspace', { entity: 'weaver' });
    }
  },

  draw() {
    const ctx = getCtx();
    const cx = 80, cy = 72;

    // ── Phase 1 (0–0.25): Amber cabin dissolves toward center ──────────────
    if (t < 0.25) {
      const phase = t / 0.25; // 0→1 within this phase
      // Cabin-colored background fading to black
      const alpha = 1 - phase;
      px(0, 0, 160, 144, A['1']);
      ctx.globalAlpha = 1 - phase * 0.6;
      px(0, 0, 160, 144, A['0']);
      ctx.globalAlpha = 1;
      // Collapsing glow toward center
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 * (1 - phase));
      g.addColorStop(0, A['3']);
      g.addColorStop(0.5, A['2']);
      g.addColorStop(1, 'rgba(36,26,18,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 160, 144);
    }

    // ── Phase 2 (0.25–0.55): Concentric rings bloom, palette bleeds ─────────
    if (t >= 0.25 && t < 0.55) {
      const phase = (t - 0.25) / 0.30;
      px(0, 0, 160, 144, '#0a0612');

      // Rings expanding from center
      const maxR = 90 * phase;
      for (let r = maxR; r > 2; r -= 7) {
        const idx = Math.floor(r / 7) % RING_COLS.length;
        ctx.strokeStyle = RING_COLS[idx];
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.85 * (1 - (maxR - r) / maxR * 0.5);
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Radial spokes
      for (let a = 0; a < 12; a++) {
        const ang = a * Math.PI / 6;
        ctx.strokeStyle = a % 2 ? HS['3'] : HS['2'];
        ctx.globalAlpha = 0.4 * phase;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(ang) * 90, cy + Math.sin(ang) * 90);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Amber core shrinking
      const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 20 * (1 - phase));
      coreG.addColorStop(0, A['3']);
      coreG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreG;
      ctx.fillRect(cx - 20, cy - 20, 40, 40);
    }

    // ── Phase 3 (0.55–0.80): Player dissolves into scattered pixels ──────────
    if (t >= 0.55 && t < 0.80) {
      const phase = (t - 0.55) / 0.25; // 0→1

      px(0, 0, 160, 144, '#0a0612');

      // Keep rings as a faint echo
      for (let r = 70; r > 4; r -= 9) {
        ctx.strokeStyle = RING_COLS[Math.floor(r / 9) % RING_COLS.length];
        ctx.globalAlpha = 0.3 * (1 - phase);
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Player sprite fading
      const playerPal = { '0': '#ffffff', '1': '#ffffff' };
      ctx.globalAlpha = Math.max(0, 1 - phase * 2);
      sprite(PLAYER_DOWN, cx - 3, cy - 4, playerPal);
      ctx.globalAlpha = 1;

      // Scattered pixels spreading from center
      ctx.fillStyle = '#ffffff';
      for (const sc of SCATTER) {
        const dist = sc.d * phase;
        ctx.globalAlpha = Math.max(0, 1 - dist / 22);
        ctx.fillRect(
          Math.round(cx + Math.cos(sc.ang) * dist),
          Math.round(cy + Math.sin(sc.ang) * dist),
          2, 2
        );
      }
      ctx.globalAlpha = 1;
    }

    // ── Phase 4 (0.80–1.00): White core expands → whiteout ─────────────────
    if (t >= 0.80) {
      const phase = (t - 0.80) / 0.20;
      px(0, 0, 160, 144, '#0a0612');

      // Expanding white core
      const r = phase * 120;
      const blast = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      blast.addColorStop(0, 'rgba(255,255,255,1)');
      blast.addColorStop(0.4, `rgba(255,225,77,${1 - phase * 0.5})`);
      blast.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = blast;
      ctx.fillRect(0, 0, 160, 144);

      // Final whiteout
      ctx.globalAlpha = Math.max(0, phase - 0.5) * 2;
      px(0, 0, 160, 144, '#ffffff');
      ctx.globalAlpha = 1;
    }

    drawOverlay(true);
  },

  exit() {},
};
