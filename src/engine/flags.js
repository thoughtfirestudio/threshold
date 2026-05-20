// Global game-state flags. The heart of the "transformed world" mechanic.
// hasCrossed is the big one — a single boolean flip changes the whole forest.

export const flags = {
  hasCrossed:   false,  // has the player been through the threshold?
  shrineFilled: false,  // filled the shrine bowl on return?
  metWeaver:    false,  // completed Weaver dialogue?
  metTwin:      false,  // completed Twin dialogue?
  metGardener:  false,  // completed Gardener dialogue?
  journalRead:  false,  // read the cabin journal?
  mirrorSeen:   false,  // faced the mirror?
};

// Registered callback — called after any flag changes so the game can autosave.
let _onChange = null;
export function onFlagChanged(cb) { _onChange = cb; }

export function setFlag(name, value = true) {
  flags[name] = value;
  if (_onChange) _onChange();
}

export function loadFlags(saved) {
  // Merge saved flags over defaults (so new flags added in dev get their default)
  for (const k of Object.keys(flags)) {
    if (k in saved) flags[k] = saved[k];
  }
}
