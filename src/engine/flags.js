// Global game-state flags.
// door flags unlock the next chamber after speaking to the hooded figure.
// hasCrossed: player inhaled the smoke and entered hyperspace.

export const flags = {
  hasCrossed:   false,  // inhaled the smoke?
  door1Open:    false,  // spoke to The Warden
  door2Open:    false,  // spoke to The Witness
  door3Open:    false,  // spoke to The Keeper
  metWeaver:    false,  // completed Weaver dialogue
  metTwin:      false,  // completed Twin dialogue
  metGardener:  false,  // completed Gardener dialogue
};

let _onChange = null;
export function onFlagChanged(cb) { _onChange = cb; }

export function setFlag(name, value = true) {
  flags[name] = value;
  if (_onChange) _onChange();
}

export function loadFlags(saved) {
  for (const k of Object.keys(flags)) {
    if (k in saved) flags[k] = saved[k];
  }
}
