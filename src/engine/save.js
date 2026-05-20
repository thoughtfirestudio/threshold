// Versioned localStorage save system.
// SAVE_VERSION bumps every time the save shape changes.
// migrate() staircase ensures old saves never break.

const KEY = 'threshold_save';
export const SAVE_VERSION = 1;

export function defaultSave() {
  return {
    version: SAVE_VERSION,
    flags: {
      hasCrossed:   false,
      shrineFilled: false,
      metWeaver:    false,
      metTwin:      false,
      metGardener:  false,
      journalRead:  false,
      mirrorSeen:   false,
    },
    room: 'forest_1',
    playerX: 5,
    playerY: 7,
  };
}

function migrate(s) {
  if (!s.version) s.version = 1;
  // v1 → v2 would go: if (s.version === 1) { s.newField = default; s.version = 2; }
  return s;
}

export function loadSave() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    return migrate(s);
  } catch (e) {
    console.warn('[save] corrupt, ignoring:', e);
    return null;
  }
}

export function writeSave(data) {
  localStorage.setItem(KEY, JSON.stringify({ ...data, version: SAVE_VERSION }));
}

export function clearSave() {
  localStorage.removeItem(KEY);
}

export function hasSave() {
  return !!localStorage.getItem(KEY);
}
