// main.js — Boot, wires everything together, runs the game loop.

import { initTouch, clearPressed } from './engine/input.js';
import { initRenderer }            from './engine/renderer.js';
import { registerScene, tick, render, currentSceneName } from './engine/scene.js';
import { flags, loadFlags, onFlagChanged }  from './engine/flags.js';
import { writeSave, loadSave, defaultSave } from './engine/save.js';

import { startScene, setStartGameCallback } from './scenes/start.js';
import { forestScene, setAutosave, getCurrentRoom, getPlayerTile } from './scenes/forest.js';
import { cabinScene, setCabinAutosave } from './scenes/cabin.js';
import { thresholdScene }  from './scenes/threshold.js';
import { hyperspaceScene, setHyperspaceAutosave } from './scenes/hyperspace.js';
import { endingScene }     from './scenes/ending.js';

// ── Canvas & engine init ─────────────────────────────────────────────────────

const canvas = document.getElementById('game');
initRenderer(canvas);
initTouch(canvas);

// ── Scene registration ────────────────────────────────────────────────────────

registerScene('start',      startScene);
registerScene('forest',     forestScene);
registerScene('cabin',      cabinScene);
registerScene('threshold',  thresholdScene);
registerScene('hyperspace', hyperspaceScene);
registerScene('ending',     endingScene);

// ── Autosave ──────────────────────────────────────────────────────────────────

function autosave() {
  const sceneName = currentSceneName();
  let room   = 'forest_1';
  let px = 5, py = 7;

  if (sceneName === 'forest') {
    room = getCurrentRoom();
    const t = getPlayerTile();
    px = t.x; py = t.y;
  } else if (sceneName === 'cabin') {
    room = 'cabin';
  }

  writeSave({
    flags: { ...flags },
    room,
    playerX: px,
    playerY: py,
  });
}

// Wire autosave into scenes and flag changes
setAutosave(autosave);
setCabinAutosave(autosave);
setHyperspaceAutosave(autosave);
onFlagChanged(autosave);

// Wire start screen
setStartGameCallback(({ flags: savedFlags }) => {
  if (savedFlags) loadFlags(savedFlags);
});

// ── Boot ──────────────────────────────────────────────────────────────────────

// Restore from save if one exists (the start scene handles the UI selection,
// but we pre-load flags so they're available immediately)
const existingSave = loadSave();
if (existingSave) {
  loadFlags(existingSave.flags);
}

// ── Game loop ─────────────────────────────────────────────────────────────────

let lastTime = null;

function loop(timestamp) {
  if (lastTime === null) lastTime = timestamp;
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50ms
  lastTime = timestamp;

  tick(dt);
  render();
  clearPressed(); // consume edge-events after scene has processed them

  requestAnimationFrame(loop);
}

// Wait for VT323 font before first draw (dialogue box uses it)
document.fonts.ready.then(() => {
  // Boot into the start scene
  import('./engine/scene.js').then(({ transition }) => {
    transition('start');
    requestAnimationFrame(loop);
  });
});
