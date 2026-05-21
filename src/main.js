// main.js — Boot, wires everything together, runs the game loop.

import { initTouch, clearPressed }           from './engine/input.js';
import { initRenderer }                       from './engine/renderer.js';
import { registerScene, tick, render, currentSceneName } from './engine/scene.js';
import { flags, loadFlags, onFlagChanged }    from './engine/flags.js';
import { writeSave, loadSave, defaultSave }   from './engine/save.js';

import { startScene, setStartGameCallback }   from './scenes/start.js';
import { hallScene, setHallAutosave, getHallRoom, getHallPlayerTile } from './scenes/hall.js';
import { thresholdScene }                     from './scenes/threshold.js';
import { hyperspaceScene, setHyperspaceAutosave } from './scenes/hyperspace.js';
import { endingScene }                        from './scenes/ending.js';

// ── Canvas & engine init ──────────────────────────────────────────────────────

const canvas = document.getElementById('game');
initRenderer(canvas);
initTouch(canvas);

// ── Scene registration ─────────────────────────────────────────────────────────

registerScene('start',      startScene);
registerScene('hall',       hallScene);
registerScene('threshold',  thresholdScene);
registerScene('hyperspace', hyperspaceScene);
registerScene('ending',     endingScene);

// ── Autosave ───────────────────────────────────────────────────────────────────

function autosave() {
  const sceneName = currentSceneName();
  let room  = 'hall_1';
  let px = 5, py = 7;

  if (sceneName === 'hall') {
    room = getHallRoom();
    const t = getHallPlayerTile();
    px = t.x; py = t.y;
  }

  writeSave({
    flags: { ...flags },
    room,
    playerX: px,
    playerY: py,
  });
}

setHallAutosave(autosave);
setHyperspaceAutosave(autosave);
onFlagChanged(autosave);

setStartGameCallback(({ flags: savedFlags }) => {
  if (savedFlags) loadFlags(savedFlags);
});

// ── Boot ───────────────────────────────────────────────────────────────────────

const existingSave = loadSave();
if (existingSave) loadFlags(existingSave.flags);

// ── Game loop ──────────────────────────────────────────────────────────────────

let lastTime = null;

function loop(timestamp) {
  if (lastTime === null) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  tick(dt);
  render();
  clearPressed();

  requestAnimationFrame(loop);
}

document.fonts.ready.then(() => {
  import('./engine/scene.js').then(({ transition }) => {
    transition('start');
    requestAnimationFrame(loop);
  });
});
