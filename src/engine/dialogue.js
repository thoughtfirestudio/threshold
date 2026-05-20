// Dialogue controller — type-on text box, multi-page, optional yes/no choice.
//
// Usage:
//   import { dlg } from './dialogue.js';
//   dlg.start({ pages: [['Line 1', 'Line 2']], pal, onDone: () => {}, choice: { options, callback } });
//   // each frame: dlg.update(dt), dlg.draw()
//   // on input A/B/up/down: dlg.handleInput(action) → returns true if consumed

import { drawDialogue } from './renderer.js';
import { isHeld, wasPressed } from './input.js';

const CHAR_DELAY = 0.033; // seconds per character (~30 chars/sec)

const state = {
  active: false,
  pages: [],      // Array of string[] (lines per page)
  pageIdx: 0,
  charIdx: 0,     // how many chars have been "typed" on current page
  timer: 0,
  pal: null,
  choice: null,   // { options: string[], sel: number, callback: fn(sel) } | null
  onDone: null,
  blinkTimer: 0,
  blinkOn: true,
};

export const dlg = {
  start({ pages, pal, onDone = null, choice = null }) {
    state.active = true;
    state.pages = pages;
    state.pageIdx = 0;
    state.charIdx = 0;
    state.timer = 0;
    state.pal = pal;
    state.onDone = onDone;
    state.choice = choice ? { ...choice, sel: 0 } : null;
    state.blinkTimer = 0;
    state.blinkOn = true;
  },

  isActive() { return state.active; },

  update(dt) {
    if (!state.active) return;

    // Blink cursor
    state.blinkTimer += dt;
    if (state.blinkTimer > 0.4) { state.blinkTimer = 0; state.blinkOn = !state.blinkOn; }

    // Type-on: count total chars in current page
    const page = state.pages[state.pageIdx];
    const totalChars = page.reduce((s, l) => s + l.length, 0);
    if (state.charIdx < totalChars) {
      state.timer += dt;
      while (state.timer >= CHAR_DELAY && state.charIdx < totalChars) {
        state.charIdx++;
        state.timer -= CHAR_DELAY;
      }
    }

    // A — advance / skip / confirm
    if (wasPressed('a')) {
      if (state.charIdx < totalChars) {
        // Skip to end of page
        state.charIdx = totalChars;
        state.timer = 0;
      } else {
        const isLast = state.pageIdx >= state.pages.length - 1;
        if (state.choice && isLast) {
          // Confirm choice
          const cb = state.choice.callback;
          const sel = state.choice.sel;
          state.active = false;
          cb(sel);
        } else if (!isLast) {
          // Next page
          state.pageIdx++;
          state.charIdx = 0;
          state.timer = 0;
          state.blinkTimer = 0;
        } else {
          // Done
          const cb = state.onDone;
          state.active = false;
          if (cb) cb();
        }
      }
    }

    // B — maps to "Not yet" (option 1) if in a choice, else skip
    if (wasPressed('b') && state.choice) {
      const page = state.pages[state.pageIdx];
      const totalChars = page.reduce((s, l) => s + l.length, 0);
      if (state.charIdx >= totalChars) {
        state.choice.sel = 1; // select second option
      }
    }

    // D-pad up/down — navigate choice
    if (state.choice) {
      const page = state.pages[state.pageIdx];
      const totalChars = page.reduce((s, l) => s + l.length, 0);
      if (state.charIdx >= totalChars) {
        const n = state.choice.options.length;
        if (wasPressed('up'))   state.choice.sel = (state.choice.sel - 1 + n) % n;
        if (wasPressed('down')) state.choice.sel = (state.choice.sel + 1) % n;
      }
    }
  },

  draw() {
    if (!state.active) return;
    const page = state.pages[state.pageIdx];
    const totalChars = page.reduce((s, l) => s + l.length, 0);
    const done = state.charIdx >= totalChars;
    const isLast = state.pageIdx >= state.pages.length - 1;

    // Distribute typed chars across lines
    const visibleLines = [];
    let remaining = state.charIdx;
    for (const line of page) {
      if (remaining <= 0) { visibleLines.push(''); }
      else { visibleLines.push(line.slice(0, remaining)); remaining -= line.length; }
    }

    // Determine choice to display (only on last page when done typing)
    const choiceToShow = (done && isLast && state.choice) ? state.choice : null;
    // Show blink arrow when done and not in choice mode
    const showBlink = done && !choiceToShow && state.blinkOn;

    drawDialogue(visibleLines, state.pal, choiceToShow, showBlink);
  },
};
