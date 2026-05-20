// Scene manager. Each scene: { enter(params?), update(dt), draw(), exit?() }
// Scenes register themselves; main.js calls tick() and render() each frame.

const _scenes = {};
let _current = null;
let _currentName = '';

export function registerScene(name, scene) {
  _scenes[name] = scene;
}

export function currentSceneName() { return _currentName; }

export function transition(name, params = {}) {
  if (_current?.exit) _current.exit();
  const next = _scenes[name];
  if (!next) { console.error('[scene] unknown scene:', name); return; }
  _current = next;
  _currentName = name;
  if (_current.enter) _current.enter(params);
}

export function tick(dt) {
  if (_current?.update) _current.update(dt);
}

export function render() {
  if (_current?.draw) _current.draw();
}
