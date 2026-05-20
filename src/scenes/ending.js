// Ending scene — brief poem, then fade to cabin (post-crossing).
// Two variants based on the Threshold's final choice.

import { px, clear, drawOverlay, getCtx } from '../engine/renderer.js';
import { transition } from '../engine/scene.js';
import { flags, setFlag } from '../engine/flags.js';
import { PALETTES } from '../data/palettes.js';

const F = PALETTES.FOREST;
const HS = PALETTES.HYPERSPACE;

let t = 0;
let choice = 0; // 0="I'm ready", 1="Wait"
let phase = 'white';  // 'white' | 'text' | 'fadeout'
let textT = 0;

const TEXTS = {
  0: [  // "I'm ready."
    'You wake in the cabin.',
    'The tea is gone.',
    'The mirror moves with you.',
    '',
    'The journal is in your hand.',
    'The last line reads:',
    '"Go back into the woods."',
  ],
  1: [  // "Wait."
    'You wake in the cabin.',
    'Everything is the same.',
    'Except you.',
    '',
    'The door is open.',
    'The forest is waiting.',
    'It always was.',
  ],
};

export const endingScene = {
  enter({ choice: c } = {}) {
    choice = c ?? 0;
    t = 0;
    textT = 0;
    phase = 'white';
    // Mark hasCrossed
    setFlag('hasCrossed', true);
  },

  update(dt) {
    t += dt;

    if (phase === 'white') {
      if (t > 1.0) { phase = 'text'; textT = 0; t = 0; }
    } else if (phase === 'text') {
      textT += dt;
      if (textT > 5.0) { phase = 'fadeout'; t = 0; }
    } else if (phase === 'fadeout') {
      if (t > 1.5) {
        // Wake in cabin
        transition('cabin', { x: 4, y: 7 });
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
      // Reveal lines progressively
      const lines = TEXTS[choice] || TEXTS[0];
      const charsPerSec = 20;
      const totalChars = lines.reduce((s, l) => s + l.length, 0);
      const shown = Math.min(totalChars, Math.floor(textT * charsPerSec));

      ctx.fillStyle = F['2'];
      ctx.font = '7px "VT323", monospace';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'center';

      let rem = shown;
      lines.forEach((line, i) => {
        const vis = line.slice(0, rem);
        rem -= line.length;
        if (vis) ctx.fillText(vis, 80, 36 + i * 11);
      });

      ctx.textAlign = 'left';

      // Fade in "press A to continue" near the end
      if (textT > 3.5) {
        ctx.fillStyle = F['1'];
        ctx.textAlign = 'center';
        ctx.fillText('(A to continue)', 80, 130);
        ctx.textAlign = 'left';
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
