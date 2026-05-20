// ONE input layer.
// Keyboard (arrows / WASD / Z+X) and touch overlay both produce the same
// {up, down, left, right, a, b} events. There is no other input path.
//
// Usage:
//   import { initTouch, isHeld, wasPressed, clearPressed, isTouchDevice, getActiveActions } from './input.js';
//   initTouch(canvas);   // call once on boot
//   // each frame:
//   if (isHeld('up')) { ... }
//   if (wasPressed('a')) { ... }
//   clearPressed();      // at end of each frame

// --- State ---
const _held    = { up:false, down:false, left:false, right:false, a:false, b:false };
const _pressed = { up:false, down:false, left:false, right:false, a:false, b:false };

// Is this a touch-primary device? Set on first touch or via matchMedia.
let _isTouch = false;

// Map from touch identifier → action string (for tracking which touch owns which button)
const _touchMap = new Map();

// --- Public API ---

export function isHeld(action)    { return _held[action] ?? false; }
export function wasPressed(action) { return _pressed[action] ?? false; }
export function isTouchDevice()   { return _isTouch; }

export function clearPressed() {
  for (const k in _pressed) _pressed[k] = false;
}

// Returns a Set of currently held actions (used by renderer for button highlight feedback)
export function getActiveActions() {
  return new Set(_touchMap.values());
}

// --- Keyboard ---

// Mapping: KeyboardEvent.code → action
const KEY_MAP = {
  ArrowUp:    'up',
  ArrowDown:  'down',
  ArrowLeft:  'left',
  ArrowRight: 'right',
  KeyW: 'up',  KeyS: 'down',  KeyA: 'left',  KeyD: 'right',
  KeyZ: 'a',   KeyX: 'b',
  Space: 'a',  Enter: 'a',  Escape: 'b',  Backspace: 'b',
};

function applyKey(code, held) {
  const action = KEY_MAP[code];
  if (!action) return;
  if (held && !_held[action]) _pressed[action] = true; // rising edge
  _held[action] = held;
}

window.addEventListener('keydown', e => {
  if (KEY_MAP[e.code]) e.preventDefault();
  applyKey(e.code, true);
});
window.addEventListener('keyup', e => {
  applyKey(e.code, false);
});

// --- Touch overlay ---
// Overlay button hit areas defined in 160×144 canvas space (matching renderer's drawOverlay).
//
// D-pad cross:
//   up:    x=16,y=116,w=8,h=8
//   down:  x=16,y=132,w=8,h=8
//   left:  x=8, y=124,w=8,h=8
//   right: x=24,y=124,w=8,h=8
//   center:x=16,y=124,w=8,h=8  (dead zone — no action)
//
// A button: circle cx=146, cy=126, r=9
// B button: circle cx=126, cy=134, r=8

function hitRect(px, py, x, y, w, h) {
  return px >= x && px < x + w && py >= y && py < y + h;
}
function hitCircle(px, py, cx, cy, r) {
  const dx = px - cx, dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

function getTouchAction(cx, cy) {
  // A and B have priority (check circles first — they're in the corner)
  if (hitCircle(cx, cy, 146, 126, 9)) return 'a';
  if (hitCircle(cx, cy, 126, 134, 8)) return 'b';
  // D-pad
  if (hitRect(cx, cy, 16, 116,  8, 8)) return 'up';
  if (hitRect(cx, cy, 16, 132,  8, 8)) return 'down';
  if (hitRect(cx, cy,  8, 124,  8, 8)) return 'left';
  if (hitRect(cx, cy, 24, 124,  8, 8)) return 'right';
  if (hitRect(cx, cy, 16, 124,  8, 8)) return null; // center — dead zone
  return null;
}

function canvasCoords(canvas, touch) {
  const rect = canvas.getBoundingClientRect();
  // Map from CSS pixels (scaled display) back to canvas pixels (160×144)
  const x = (touch.clientX - rect.left)  * (160 / rect.width);
  const y = (touch.clientY - rect.top)   * (144 / rect.height);
  return { x, y };
}

function pressAction(action) {
  if (!action) return;
  if (!_held[action]) _pressed[action] = true;
  _held[action] = true;
}

function releaseAction(action) {
  if (!action) return;
  // Only release if no other active touch still holds this action
  const stillHeld = [..._touchMap.values()].includes(action);
  if (!stillHeld) _held[action] = false;
}

export function initTouch(canvas) {
  // Detect touch-primary device immediately via media query
  if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
    _isTouch = true;
  }

  canvas.addEventListener('touchstart', e => {
    _isTouch = true;
    e.preventDefault();
    for (const t of e.changedTouches) {
      const { x, y } = canvasCoords(canvas, t);
      const action = getTouchAction(x, y);
      _touchMap.set(t.identifier, action); // track even if null (for move updates)
      pressAction(action);
    }
  }, { passive: false });

  canvas.addEventListener('touchend', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const action = _touchMap.get(t.identifier);
      _touchMap.delete(t.identifier);
      releaseAction(action);
    }
  }, { passive: false });

  canvas.addEventListener('touchcancel', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const action = _touchMap.get(t.identifier);
      _touchMap.delete(t.identifier);
      releaseAction(action);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    for (const t of e.changedTouches) {
      const prevAction = _touchMap.get(t.identifier);
      const { x, y } = canvasCoords(canvas, t);
      const newAction = getTouchAction(x, y);
      if (prevAction !== newAction) {
        // Slide off one button onto another
        _touchMap.set(t.identifier, newAction);
        releaseAction(prevAction);
        pressAction(newAction);
      }
    }
  }, { passive: false });
}
