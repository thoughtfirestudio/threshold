// Renderer — all canvas drawing goes through here.
// Works in 160×144 native space. The CSS scales it up ×3.
//
// Key exports:
//   initRenderer(canvas)    — call once on boot
//   getCtx()                — escape hatch for advanced canvas ops
//   clear(color)            — fill whole canvas
//   px(x,y,w,h,color)       — filled rectangle
//   dither(x0,y0,x1,y1,a,b) — checkerboard fill (uses createPattern for efficiency)
//   sprite(grid,dx,dy,pal,alpha) — draw a string-grid sprite
//   dots(points,color)      — scatter array of [x,y] pixel dots
//   radialGradientFill(cx,cy,r0,c0,r1,c1) — radial gradient over whole canvas
//   drawDialogue(lines,pal,choice) — GB-style dialogue box
//   drawOverlay(dark)       — semi-transparent D-pad + A/B (touch devices only)

import { isTouchDevice, getActiveActions } from './input.js';

let _ctx = null;

// Cached checkerboard patterns: key = "colorA||colorB" → CanvasPattern
const _ditherCache = new Map();

export function initRenderer(canvas) {
  _ctx = canvas.getContext('2d');
  _ctx.imageSmoothingEnabled = false;
  _ctx.textBaseline = 'top';
}

export function getCtx() { return _ctx; }

// --- Primitives ---

export function clear(color = '#000000') {
  _ctx.fillStyle = color;
  _ctx.fillRect(0, 0, 160, 144);
}

export function px(x, y, w, h, color) {
  _ctx.fillStyle = color;
  _ctx.fillRect(x, y, w, h);
}

// Checkerboard dither. Uses a cached 2×2 CanvasPattern so it's a single fillRect
// regardless of area — O(1) per call. Pattern aligns to canvas origin (0,0) so
// adjacent dither calls tile seamlessly with no seams.
export function dither(x0, y0, x1, y1, colorA, colorB) {
  const key = colorA + '|' + colorB;
  let pattern = _ditherCache.get(key);
  if (!pattern) {
    // Build a 2×2 offscreen tile:  A B
    //                              B A
    const off = document.createElement('canvas');
    off.width = 2; off.height = 2;
    const oc = off.getContext('2d');
    oc.fillStyle = colorA; oc.fillRect(0, 0, 1, 1); oc.fillRect(1, 1, 1, 1);
    oc.fillStyle = colorB; oc.fillRect(1, 0, 1, 1); oc.fillRect(0, 1, 1, 1);
    pattern = _ctx.createPattern(off, 'repeat');
    _ditherCache.set(key, pattern);
  }
  _ctx.fillStyle = pattern;
  _ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
}

// Draw a string-grid sprite. '.' and ' ' are transparent.
// pal is a plain object mapping char → css color string.
export function sprite(grid, dx, dy, pal, alpha = 1) {
  const prev = _ctx.globalAlpha;
  if (alpha !== 1) _ctx.globalAlpha = alpha;
  for (let row = 0; row < grid.length; row++) {
    const line = grid[row];
    for (let col = 0; col < line.length; col++) {
      const ch = line[col];
      if (ch === '.' || ch === ' ') continue;
      const color = pal[ch];
      if (!color) continue;
      _ctx.fillStyle = color;
      _ctx.fillRect(dx + col, dy + row, 1, 1);
    }
  }
  if (alpha !== 1) _ctx.globalAlpha = prev;
}

// Scatter array of [x, y] pixel dots in one color.
export function dots(points, color) {
  _ctx.fillStyle = color;
  for (const [x, y] of points) _ctx.fillRect(x, y, 1, 1);
}

// Radial gradient that fills the whole 160×144 canvas.
// r0/c0 = inner stop, r1/c1 = outer stop.
export function radialGradientFill(cx, cy, r0, c0, r1, c1) {
  const g = _ctx.createRadialGradient(cx, cy, r0, cx, cy, r1);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  _ctx.fillStyle = g;
  _ctx.fillRect(0, 0, 160, 144);
}

// Draw text using VT323 pixel font. size=7 matches the reference.
export function text(str, x, y, color, size = 7) {
  _ctx.fillStyle = color;
  _ctx.font = `${size}px "VT323", monospace`;
  _ctx.textBaseline = 'top';
  _ctx.fillText(str, x, y);
}

// --- Dialogue box ---
// lines: string[] — text to display (max ~3 lines at 7px)
// pal:   palette object with '0' (dark/border) and '3' (light/fill)
// choice: null | { options: string[], sel: number }
//   If choice is provided, renders the yes/no picker instead of the ▼ arrow.
// showBlink: boolean — whether to draw the ▼ continue arrow right now
export function drawDialogue(lines, pal, choice = null, showBlink = true) {
  const bx = 4, by = 92, bw = 152, bh = 48;

  // Outer border fill
  _ctx.fillStyle = pal['0'];
  _ctx.fillRect(bx, by, bw, bh);
  // Inner panel fill
  _ctx.fillStyle = pal['3'];
  _ctx.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
  // Inner accent border lines (the double-border GB look)
  _ctx.fillStyle = pal['0'];
  _ctx.fillRect(bx + 4, by + 4,      bw - 8, 1);      // top line
  _ctx.fillRect(bx + 4, by + bh - 5, bw - 8, 1);      // bottom line
  _ctx.fillRect(bx + 4, by + 4,      1, bh - 8);       // left line
  _ctx.fillRect(bx + bw - 5, by + 4, 1, bh - 8);       // right line

  // Text lines
  _ctx.fillStyle = pal['0'];
  _ctx.font = '7px "VT323", monospace';
  _ctx.textBaseline = 'top';
  lines.forEach((line, i) => {
    _ctx.fillText(line, bx + 9, by + 9 + i * 9);
  });

  if (choice) {
    // Choice picker — options listed below the text, arrow selects current
    choice.options.forEach((opt, i) => {
      _ctx.fillText(opt, bx + 18, by + 9 + (lines.length + i) * 9);
    });
    // Selection arrow
    _ctx.fillText('\u25B8', bx + 9, by + 9 + (lines.length + choice.sel) * 9);
  } else if (showBlink) {
    // Blinking continue arrow (▼). Caller controls showBlink for blink timing.
    _ctx.fillText('\u25BC', bx + bw - 13, by + bh - 12);
  }
}

// --- Touch overlay ---
// Semi-transparent GB-emulator D-pad + A/B buttons.
// Only drawn when isTouchDevice() is true.
// dark=true: use white buttons (for dark backgrounds like hyperspace).
export function drawOverlay(dark = false) {
  if (!isTouchDevice()) return;

  const active = getActiveActions();

  // Color tokens — base and active-pressed variants
  const base    = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.28)';
  const pressed = dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';
  const label   = dark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.45)';

  function btnColor(action) { return active.has(action) ? pressed : base; }

  // D-pad cross — five 8×8 tiles
  const dpadParts = [
    { action: 'up',    x: 16, y: 116 },
    { action: 'down',  x: 16, y: 132 },
    { action: 'left',  x:  8, y: 124 },
    { action: 'right', x: 24, y: 124 },
    { action: null,    x: 16, y: 124 }, // center dead zone
  ];
  for (const p of dpadParts) {
    _ctx.fillStyle = p.action ? btnColor(p.action) : base;
    _ctx.fillRect(p.x, p.y, 8, 8);
  }

  // A button — circle
  _ctx.fillStyle = btnColor('a');
  _ctx.beginPath(); _ctx.arc(146, 126, 9, 0, Math.PI * 2); _ctx.fill();
  _ctx.strokeStyle = label; _ctx.lineWidth = 1; _ctx.stroke();

  // B button — circle
  _ctx.fillStyle = btnColor('b');
  _ctx.beginPath(); _ctx.arc(126, 134, 8, 0, Math.PI * 2); _ctx.fill();
  _ctx.strokeStyle = label; _ctx.stroke();

  // Labels
  _ctx.fillStyle = label;
  _ctx.font = '6px monospace';
  _ctx.textBaseline = 'middle';
  _ctx.textAlign = 'center';
  _ctx.fillText('A', 146, 126);
  _ctx.fillText('B', 126, 134);
  // Reset text state
  _ctx.textAlign = 'left';
  _ctx.textBaseline = 'top';
}
