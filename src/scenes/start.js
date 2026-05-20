// Start / title scene.
// Shows THE THRESHOLD title and either "PRESS A TO BEGIN" (new game)
// or both "NEW GAME" / "CONTINUE" options if a save exists.

import { px, dither, radialGradientFill, text, drawOverlay } from '../engine/renderer.js';
import { wasPressed, isTouchDevice } from '../engine/input.js';
import { hasSave, loadSave, clearSave } from '../engine/save.js';
import { loadFlags } from '../engine/flags.js';
import { transition } from '../engine/scene.js';
import { PALETTES } from '../data/palettes.js';

const F = PALETTES.FOREST;

const st = {
  // 'press' = just "PRESS A TO BEGIN" (no save), 'menu' = new/continue picker
  mode: 'press',
  sel: 0,       // 0=continue, 1=new game (in menu mode)
  blinkTimer: 0,
  blinkOn: true,
  // Subtle shimmer timer for the title screen ambiance
  t: 0,
};

// Called by main.js to wire the autosave callback after load
let _startGameCb = null;
export function setStartGameCallback(cb) { _startGameCb = cb; }

export const startScene = {
  enter() {
    st.mode = hasSave() ? 'menu' : 'press';
    st.sel = 0;
    st.blinkTimer = 0;
    st.blinkOn = true;
    st.t = 0;
  },

  update(dt) {
    st.t += dt;
    st.blinkTimer += dt;
    if (st.blinkTimer > 0.55) { st.blinkTimer = 0; st.blinkOn = !st.blinkOn; }

    if (st.mode === 'press') {
      if (wasPressed('a') || wasPressed('b')) startNew();
    } else {
      // menu mode: sel 0=continue, 1=new game
      if (wasPressed('up') || wasPressed('down')) {
        st.sel = 1 - st.sel; // toggle
      }
      if (wasPressed('a')) {
        if (st.sel === 0) loadContinue();
        else startNew();
      }
      if (wasPressed('b')) startNew();
    }
  },

  draw() {
    // Dark atmospheric background with subtle dither
    dither(0, 0, 160, 144, F['0'], F['1']);

    // Subtle fog from center (creates a sense of depth)
    const breathe = Math.sin(st.t * 0.6) * 0.05;
    radialGradientFill(80, 60, 0, `rgba(110,125,90,${0.08 + breathe})`, 90,
                       `rgba(27,33,26,0)`);

    // Title — large, centered
    const ctx = getCtxForTitle();
    if (ctx) {
      // "THE THRESHOLD" in two sizes
      ctx.fillStyle = F['3'];
      ctx.font = '7px "VT323", monospace';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';

      // Small kicker above
      ctx.fillStyle = F['2'];
      ctx.font = '10px "VT323", monospace';
      ctx.fillText('A SHORT EXPLORATION', 80, 28);

      // Big title
      ctx.fillStyle = F['3'];
      ctx.font = '18px "VT323", monospace';
      ctx.fillText('THE THRESHOLD', 80, 42);

      // Subtitle
      ctx.fillStyle = F['2'];
      ctx.font = '10px "VT323", monospace';
      ctx.fillText('D-PAD + A + B', 80, 66);

      ctx.textAlign = 'left';

      if (st.mode === 'press') {
        if (st.blinkOn) {
          ctx.fillStyle = F['3'];
          ctx.font = '10px "VT323", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('PRESS A TO BEGIN', 80, 98);
          ctx.textAlign = 'left';
        }
      } else {
        // Menu with two options
        ctx.font = '10px "VT323", monospace';
        const opts = ['CONTINUE', 'NEW GAME'];
        opts.forEach((opt, i) => {
          ctx.fillStyle = st.sel === i ? F['3'] : F['2'];
          ctx.textAlign = 'center';
          ctx.fillText(opt, 80, 94 + i * 16);
          if (st.sel === i && st.blinkOn) {
            ctx.textAlign = 'left';
            ctx.fillText('\u25B8', 42, 94 + i * 16);
          }
          ctx.textAlign = 'left';
        });
      }
    }

    drawOverlay(false);
  },
};

// Grab the canvas ctx — we need it for textAlign/center
function getCtxForTitle() {
  const canvas = document.getElementById('game');
  if (!canvas) return null;
  const c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false;
  return c;
}

function startNew() {
  clearSave();
  if (_startGameCb) _startGameCb({ room: 'forest_1', x: 5, y: 7, flags: null });
  transition('forest', { room: 'forest_1', x: 5, y: 7 });
}

function loadContinue() {
  const save = loadSave();
  if (!save) { startNew(); return; }
  loadFlags(save.flags);
  if (_startGameCb) _startGameCb({ room: save.room, x: save.playerX, y: save.playerY, flags: save.flags });
  transition('forest', { room: save.room, x: save.playerX, y: save.playerY });
}
