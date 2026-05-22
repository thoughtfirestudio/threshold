// Ending scene — brief poem, then fade to cabin (post-crossing).
// Two variants based on the Threshold's final choice.

import { px, clear, drawOverlay, getCtx } from '../engine/renderer.js';
import { wasPressed } from '../engine/input.js';
import { transition } from '../engine/scene.js';
import { flags, setFlag } from '../engine/flags.js';
import { PALETTES } from '../data/palettes.js';

const F  = PALETTES.FOREST;  // kept for text color
const HS = PALETTES.HYPERSPACE;

let t = 0;
let choice = 0;
let phase = 'white';  // 'white' | 'text' | 'fadeout'
let lineIdx = 0;      // which line we're on
let charT = 0;        // time spent revealing current line
let lineRevealed = false; // has current line finished typing?
const CHARS_PER_SEC = 28; // characters per second per line

const TEXTS = {
  0: [  // "I'm ready."
    'The smoke moves through you.',
    'Something ancient',
    'turns over, slowly.',
    '',
    'You know what you know.',
    'You have always known it.',
    '',
    'Wake up.',
  ],
  1: [  // "Not yet."
    'The smoke waits.',
    '',
    'The hall is always here.',
    'Behind every door',
    'you have ever opened.',
    '',
    'Return when you are ready.',
  ],
};

export const endingScene = {
  enter({ choice: c } = {}) {
    choice = c ?? 0;
    t = 0;
    phase = 'white';
    lineIdx = 0;
    charT = 0;
    lineRevealed = false;
    setFlag('hasCrossed', true);
  },

  update(dt) {
    t += dt;

    if (phase === 'white') {
      if (t > 1.0) { phase = 'text'; t = 0; charT = 0; lineIdx = 0; lineRevealed = false; }

    } else if (phase === 'text') {
      const lines = TEXTS[choice] || TEXTS[0];
      const line  = lines[lineIdx] || '';

      if (!lineRevealed) {
        charT += dt;
        if (charT >= line.length / CHARS_PER_SEC) lineRevealed = true;
      }

      // A or B: skip reveal OR advance to next line
      if (wasPressed('a') || wasPressed('b')) {
        if (!lineRevealed) {
          // Snap current line fully visible
          lineRevealed = true;
        } else {
          // Advance
          lineIdx++;
          charT = 0;
          lineRevealed = false;
          if (lineIdx >= lines.length) {
            phase = 'fadeout'; t = 0;
          }
        }
      }

    } else if (phase === 'fadeout') {
      if (t > 1.5) {
        transition('hall', { room: 'hall_1' });
      }
    }
  },

  draw() {
    const ctx = getCtx();

    if (phase === 'white') {
      const alpha = Math.max(0, 1 - t);
      px(0, 0, 160, 144, '#ffffff');
      ctx.globalAlpha = 1 - alpha;
      px(0, 0, 160, 144, '#0d0d0d');
      ctx.globalAlpha = 1;
    } else if (phase === 'text') {
      px(0, 0, 160, 144, '#0d0d0d');

      const lines = TEXTS[choice] || TEXTS[0];
      ctx.font = '10px "VT323", monospace';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';

      // Draw all fully-revealed past lines dimmer
      for (let i = 0; i < lineIdx; i++) {
        const line = lines[i];
        if (!line) continue;
        ctx.fillStyle = i < lineIdx - 2 ? F['0'] : F['1']; // older lines fade further
        ctx.fillText(line, 80, 28 + i * 16);
      }

      // Draw current line typewriter-style
      const curLine = lines[lineIdx] || '';
      const charsShown = lineRevealed
        ? curLine.length
        : Math.floor(charT * CHARS_PER_SEC);
      ctx.fillStyle = F['3'];
      ctx.fillText(curLine.slice(0, charsShown), 80, 28 + lineIdx * 16);

      ctx.textAlign = 'left';

      // "press A" prompt once line is fully revealed
      if (lineRevealed) {
        const blink = Math.floor(t * 3) % 2 === 0;
        if (blink) {
          ctx.fillStyle = F['1'];
          ctx.textAlign = 'center';
          ctx.fillText('▸ A to continue', 80, 130);
          ctx.textAlign = 'left';
        }
      }
    } else if (phase === 'fadeout') {
      px(0, 0, 160, 144, '#0d0d0d');
      const alpha = Math.min(1, t / 1.5);
      ctx.globalAlpha = alpha;
      px(0, 0, 160, 144, '#1b211a'); // forest dark
      ctx.globalAlpha = 1;
    }

    drawOverlay(false);
  },

  exit() {},
};
