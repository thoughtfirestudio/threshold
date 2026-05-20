# THE THRESHOLD

A short exploration-puzzle adventure. Native 160×144, scaled ×3. D-pad + A + B only.

---

## How to run (local dev)

The project is plain static files with ES module imports. Browsers require `http://` for ES modules — `file://` won't work. Start any static server:

```bash
# Option A — Python (usually pre-installed)
cd projects/games/threshold
python3 -m http.server 8080

# Option B — Node (npx, no install)
npx serve .

# Option C — VS Code: install "Live Server" extension, right-click index.html → "Open with Live Server"
```

Then open: **http://localhost:8080**

No build step. No npm install. Save a file, refresh the browser. That's the whole dev loop.

---

## Controls

| Desktop      | Action          |
|------------- |-----------------|
| Arrow keys   | Move (D-pad)    |
| WASD         | Move (D-pad)    |
| Z / Space / Enter | A button  |
| X / Backspace / Escape | B button |

On touch devices: the GB-style overlay renders in-canvas. D-pad bottom-left, A & B bottom-right.

---

## Build order (where we are)

- [x] **Step 1** — Scaffold: canvas, input layer (keyboard + touch), renderer, forest scene demo
- [ ] **Step 2** — Tilemap + grid movement + collision
- [ ] **Step 3** — Full Act I forest: all screens, deer mechanic, reach the cabin
- [ ] **Step 4** — Cabin + artifact + yes/no dialogue system
- [ ] **Step 5** — The threshold warp transition
- [ ] **Step 6** — First hyperspace room (The Weaver)
- [ ] **Step 7** — Remaining entities + final choice / endings
- [ ] **Step 8** — The Return: `hasCrossed` flag, transformed forest
- [ ] **Step 9** — Versioned save/load + autosave + secrets + audio
- [ ] **Step 10** — Deploy to Coolify with auto-deploy on push

---

## Architecture notes

- **`src/main.js`** — Boot, game loop, current scene logic (will be refactored to scene manager in Step 3)
- **`src/engine/input.js`** — Single input layer: keyboard + touch → `{up, down, left, right, a, b}`
- **`src/engine/renderer.js`** — Canvas helpers: `px`, `dither`, `sprite`, `drawDialogue`, `drawOverlay`
- **`src/data/palettes.js`** — Three named 4-color palettes (FOREST, CABIN, HYPERSPACE)
- **`src/data/sprites.js`** — String-grid sprite definitions

The `hasCrossed` flag (added in Step 8) is the core design move: one forest map, rendered twice based on a single boolean. The second pass is the real game.

---

## Visual reference

See `docs/threshold-reference.html` — open in a browser. These are the target mockups for composition, palette, and UI. Match these when in doubt.
