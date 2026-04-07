# Mafia Game — CLAUDE.md

## Project Overview

A 2D top-down mafia-themed game built with **Phaser 3.90** + **React 19** + **TypeScript**, bundled with **Vite 6**. Currently in early prototype stage — features a movable player on a grid world with Y-sorted rendering, placeholder UI panels, and a cyberpunk glassmorphism visual style.

## Commands

- `npm run dev` — Start dev server (localhost:8080) with SCSS watch + Vite HMR
- `npm run build` — Production build to `dist/`
- `npm run dev-nolog` / `npm run build-nolog` — Same without Phaser analytics ping

SCSS is compiled separately: `src/global.scss` -> `public/global.css` via the `sass` package (not Vite's built-in SCSS). The npm scripts handle this automatically.

## Architecture

### Two-Layer Rendering

The app uses a **hybrid React + Phaser** architecture:

1. **Phaser canvas** (`#game-container`) — all game world rendering (sprites, map, effects)
2. **React HTML overlay** (`#ui-overlay`, `#panel-layer`) — all UI (buttons, panels, HUD)

React sits on top of the Phaser canvas via absolute positioning. Empty overlay areas pass pointer events through to Phaser via `pointer-events: none`.

### React ↔ Phaser Communication

- **EventBus** (`src/game/EventBus.ts`) — a `Phaser.Events.EventEmitter` singleton shared between both layers. This is the **only** bridge; there is no shared state store.
- **PhaserGame.tsx** — React component that mounts the Phaser `Game` instance into `#game-container` using `forwardRef`. Exposes `game` and current `scene` via ref.
- Scenes emit `'current-scene-ready'` in their `create()` to notify React of scene transitions.

### Key Event Channels

| Event | Direction | Purpose |
|---|---|---|
| `current-scene-ready` | Phaser → React | Scene became active |
| `panel:open` / `panel:close` | Phaser → React | Request panel open/close |
| `panel:opened` / `panel:closed` | React → Phaser | Notify game of panel state (disables game input) |
| `player:move` / `player:stop` | React → Phaser | D-pad touch control |

## Project Structure

```
src/
├── main.tsx                    # React entry point
├── App.tsx                     # Root component: PhaserGame + UIOverlay + PanelLayer
├── PhaserGame.tsx              # React-Phaser bridge (forwardRef, mounts Game)
├── global.scss                 # All styles (compiled to public/global.css)
│
├── game/
│   ├── main.ts                 # Phaser Game config (1920x1080, WIDTH_CONTROLS_HEIGHT)
│   ├── EventBus.ts             # Shared event emitter
│   ├── scenes/
│   │   ├── Boot.ts             # Loads bg.png, transitions to Preloader
│   │   ├── Preloader.ts        # Animated splash (4s min), loads assets, → MainMenu
│   │   ├── MainMenu.ts         # Logo + "Main Menu" text, click → Game
│   │   ├── Game.ts             # Main gameplay: grid world, player, Y-sort, collisions
│   │   └── GameOver.ts         # Game over screen
│   ├── world/
│   │   ├── LayerManager.ts     # 5 ordered layers: ground(0), shadows(10), world(100), overhead(1000), effects(2000)
│   │   └── Player.ts           # Rectangle player with WASD/arrow/d-pad input, circle collision
│   └── effects/
│       └── tapRipple.ts        # Touch feedback circle animation
│
├── components/
│   ├── UIOverlay.tsx            # 9-zone CSS grid overlay (TopLeft, TopCenter, ..., BottomRight)
│   ├── PanelLayer.tsx           # Modal panel host with open/close animations
│   ├── Panel.tsx                # Reusable panel shell (header + scrollable body + close btn)
│   ├── ControlPad.tsx           # Touch d-pad (currently commented out in App.tsx)
│   ├── LoadingIndicator.tsx     # Spinner with label
│   └── panels/
│       ├── index.ts             # PANEL_REGISTRY — maps PanelName → Component
│       ├── MarketPanel.tsx      # Placeholder with simulated loading
│       ├── PausePanel.tsx       # Pause with resume button
│       └── SettingsPanel.tsx    # Placeholder
│
├── context/
│   └── PanelContext.tsx         # React context for panel state + EventBus integration
│
└── hooks/
    └── usePanel.ts             # Convenience hook wrapping PanelContext

public/assets/                  # Static assets loaded by Phaser
├── bg.png
├── logo.png
└── star.png
```

## Scene Flow

`Boot` → `Preloader` (4s splash) → `MainMenu` (click to start) → `Game` → `GameOver`

## Rendering & Y-Sort System

- **LayerManager** creates 5 Phaser layers at fixed depths (ground, shadows, world, overhead, effects)
- Game objects with origin `(0.5, 1)` — Y position represents "feet"
- `LayerManager.sort()` is called every frame to re-order the `world` layer by Y position
- Collision is circle-circle, resolved by pushing the player out of overlapping box colliders

## UI System

- **UIOverlay**: 9-zone CSS grid layout (`grid-template: auto 1fr auto / auto 1fr auto`) for HUD buttons
- **Panel system**: `PanelContext` manages which panel is open. `PanelLayer` renders the active panel with backdrop blur + open/close CSS animations. New panels are added by:
  1. Creating a component in `src/components/panels/`
  2. Adding its name to `PanelName` type in `PanelContext.tsx`
  3. Registering it in `PANEL_REGISTRY` in `panels/index.ts`

## Styling

All styles live in `src/global.scss` (single file). Visual theme is **cyberpunk glassmorphism** with:
- SCSS tokens: `$cyber-cyan: #00d4ff`, `$cyber-yellow: #f5e642`, `$cyber-magenta: #ff2d9b`
- Glass effects: `backdrop-filter: blur()` + semi-transparent backgrounds
- CSS custom property: `--ui-gap` for responsive spacing

## Game Config

- Resolution: **1920x1080**, scale mode: `WIDTH_CONTROLS_HEIGHT`, centered
- Renderer: `AUTO` (WebGL with Canvas fallback)
- No physics engine enabled — collision is manual circle-circle
- No audio, no tilemaps, no spritesheets yet — all visuals are primitives (rectangles, circles, text)

## Conventions

- Phaser scenes use class syntax extending `Phaser.Scene`
- React components use function components with hooks
- Player and world objects use manual `origin(0.5, 1)` for Y-sort anchoring
- All cross-layer communication goes through EventBus — never import React state into Phaser or vice versa
- Panel system is registry-based — add panels declaratively without touching PanelLayer
