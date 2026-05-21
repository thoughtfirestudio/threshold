// Versioned localStorage save system.
// SAVE_VERSION bumps every time the save shape changes.
// migrate() staircase ensures old saves never break.

const KEY = 'threshold_save';
export const SAVE_VERSION = 2; // bumped: hall redesign replaces forest/cabin

export function defaultSave() {
  return {
    version: SAVE_VERSION,
    flags: {
      hasCrossed:   false,
      door1Open:    false,
      door2Open:    false,
      door3Open:    false,
      metWeaver:    false,
      metTwin:      false,
      metGardener:  false,
    },
    room: 'hall_1',
    playerX: 5,
    playerY: 7,
  };
}

function migrate(s) {
  if (!s.version) s.version = 1;
  // v1 was forest/cabin world — incompatible. Reset to v2 defaults.
  if (s.version < 2) {
    return defaultSave();
  }
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
