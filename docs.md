# Mafia Game — Developer Docs

## Stack

| Layer | Tech |
|---|---|
| Renderer | Phaser (WebGL/Canvas, `AUTO`) |
| UI | React 18 + TypeScript |
| Styles | SCSS → compiled to `public/global.css` |
| Bridge | `EventBus` (Phaser `Events.EventEmitter` singleton) |

---

## Project Structure

```
src/
  game/
    main.ts                   Phaser config + StartGame factory
    EventBus.ts               Shared event emitter (Phaser ↔ React)
    effects/
      tapRipple.ts            Reusable canvas visual feedback
    scenes/
      Boot.ts                 Loads background asset, starts Preloader
      Preloader.ts            Asset loading screen
      MainMenu.ts             Title screen, tap anywhere → Game
      Game.ts                 Main game scene
      GameOver.ts             End screen

  context/
    PanelContext.tsx          Panel state (activePanel), EventBus bridge, PanelProvider

  hooks/
    usePanel.ts               usePanel() — open/close panels from any component

  components/
    UIOverlay.tsx             8-zone grid overlay (corners + centers)
    PanelLayer.tsx            Full-screen panel host, animation state machine
    panels/
      index.ts                Panel registry (PanelName → Component)
      MarketPanel.tsx         Market UI stub
      SettingsPanel.tsx       Settings UI stub
      PausePanel.tsx          Pause menu stub

  App.tsx                     Root — PanelProvider wraps AppUI
  PhaserGame.tsx              Mounts Phaser, bridges current-scene-ready
  global.scss                 All styles (tokens, overlay, glassmorphism, panels)
```

---

## DOM Stack

```
#app
 ├── #game-container     Phaser canvas (z-index: auto)
 ├── #ui-overlay         8-zone HUD grid (pointer-events: none base)
 └── #panel-layer        Full-screen panel mount (z-index: 10)
```

`pointer-events: none` on `#ui-overlay` and `#panel-layer` by default — empty areas pass all touch/click through to Phaser. Only interactive children re-enable it.

---

## Touch & Input

Phaser maps touch events to its pointer system automatically. Use `this.input.on('pointerdown', ...)` in any scene — it fires for both mouse and touch.

```ts
this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    const isTouch = pointer.wasTouch; // true on mobile
    tapRipple(this, pointer.x, pointer.y);
});
```

### Multi-touch

```ts
this.input.addPointer(2); // support up to 3 simultaneous pointers
```

### `tapRipple(scene, x, y, options?)`

Located in `src/game/effects/tapRipple.ts`. Spawns a fading circle at the tap point.

```ts
tapRipple(this, pointer.x, pointer.y);
tapRipple(this, x, y, { color: 0xff00ff, radius: 30, duration: 600 });
```

---

## Panel System

Full-screen overlay panels (Market, Settings, Pause, etc.) sit in the React layer above Phaser.

### Opening a panel — from React

```tsx
const { openPanel, closePanel } = usePanel();

<button onClick={() => openPanel('Market')}>Open Market</button>
```

### Opening a panel — from Phaser

```ts
import { PANEL_EVENTS } from '../../context/PanelContext';

EventBus.emit(PANEL_EVENTS.OPEN, 'Market');
EventBus.emit(PANEL_EVENTS.CLOSE);
```

### EventBus events

| Event constant | String | Direction | Payload |
|---|---|---|---|
| `PANEL_EVENTS.OPEN` | `panel:open` | Phaser → React | `PanelName` |
| `PANEL_EVENTS.CLOSE` | `panel:close` | Phaser → React | — |
| `PANEL_EVENTS.OPENED` | `panel:opened` | React → Phaser | `PanelName` |
| `PANEL_EVENTS.CLOSED` | `panel:closed` | React → Phaser | — |

`Game.ts` listens for `OPENED`/`CLOSED` and toggles `this.input.enabled` to prevent Phaser from receiving taps behind an open panel.

### Adding a new panel

1. Create `src/components/panels/MyPanel.tsx`
2. Add `'MyPanel'` to the `PanelName` union in `PanelContext.tsx`
3. Add one entry to `PANEL_REGISTRY` in `panels/index.ts`

No changes needed in `PanelLayer` or `App`.

### Animation

`PanelLayer` runs a local state machine: `closed → open → closing → closed`.

- **Open**: `panel-in` keyframe (fade + scale up), 250ms
- **Close**: `panel-out` keyframe (fade + scale down), 200ms — panel stays mounted until animation finishes
- Backdrop fades in/out independently

Click the backdrop to dismiss any panel.

---

## UI Overlay Zones

The `#ui-overlay` grid has 8 named zones. Place React content as children:

```tsx
<UITopLeft>
    <button className="ui-btn" onClick={() => openPanel('Pause')}>Menu</button>
</UITopLeft>

<UITopCenter>
    <div className="ui-box">Score: 0</div>
</UITopCenter>
```

### Zone map

```
┌─────────┬───────────┬──────────┐
│ TopLeft │ TopCenter │ TopRight │
├─────────┼───────────┼──────────┤
│  Left   │  (canvas) │  Right   │
├─────────┼───────────┼──────────┤
│ BotLeft │ BotCenter │ BotRight │
└─────────┴───────────┴──────────┘
```

---

## Styles

All styles live in `src/global.scss` and must be compiled:

```bash
npm run sass:watch   # dev
npm run sass:build   # one-shot
```

### SCSS tokens

```scss
$cyber-cyan:    #00d4ff;
$cyber-yellow:  #f5e642;
$cyber-magenta: #ff2d9b;
$glass-bg:      rgba(255, 255, 255, 0.12);
$glass-border:  rgba(255, 255, 255, 0.45);
$glass-blur:    16px;
```

### UI primitives

| Class | Use |
|---|---|
| `.ui-btn` | Glassmorphism cyberpunk button (hover + active states) |
| `.ui-box` | Static display box (score, labels) |

### Panel primitives

| Class | Use |
|---|---|
| `.panel-box` | Panel chrome (glass background, border, shadow) |
| `.panel-header` | Title + close button row |
| `.panel-title` | Uppercase neon heading |
| `.panel-close` | ✕ dismiss button |
| `.panel-body` | Scrollable content area |
| `.panel-placeholder` | Muted placeholder text |

---

## Scene Flow

```
Boot → Preloader → MainMenu → Game → GameOver
                       ↑                ↓
                       └────────────────┘  (loop)
```

- **MainMenu**: tap/click anywhere → `Game`
- **Game**: `changeScene()` → `GameOver`
- **GameOver**: (wire return to `MainMenu` as needed)

---

## EventBus Cleanup

Always pass the named handler to `removeListener` to avoid removing other listeners on the same event:

```ts
// Good
const handler = (name: string) => { ... };
EventBus.on('panel:open', handler);
EventBus.removeListener('panel:open', handler);

// Bad — removes ALL listeners for this event
EventBus.removeListener('panel:open');
```

In Phaser scenes, clean up in `shutdown()`, which fires when the scene stops.
