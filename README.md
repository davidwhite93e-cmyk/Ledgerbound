# Ledgerbound (prototype)

This is the Phase 1 prototype described in the "Frontier Mobile Clone" plan's Stage 6 Claude
Code prompt: a node-map trading RPG with buy/sell trading, a contraband good tied to per-city
crime ratings, two placeholder factions with a standing system, tap-resolve travel encounters,
a stat-allocation character creation screen, a gold win condition, and local save/load.

## Important: why this isn't Phaser + Vite (yet)

The prompt calls for **TypeScript + Phaser 3 + Vite**, wrapped later with Capacitor. This build
was produced inside a sandboxed environment whose network policy blocks `registry.npmjs.org`
entirely (`npm install` fails with `403 host_not_allowed`), so **no npm package could be
installed** -- not Vite, not Phaser, nothing beyond what was already on the machine.

To still deliver something real and testable, this prototype is **zero-dependency**: plain
TypeScript (compiled with `tsc`, which was already installed), rendered with the DOM plus a
single `<canvas>` for the map screen, served as static files. No bundler, no game engine.

**On your own machine (or in Claude Code running locally with normal internet access), npm
will work fine.** See "Migrating to Phaser + Vite + Capacitor" below for how to move this into
the originally-intended stack -- the data and state layers were written with zero DOM
dependencies specifically so that step is a port, not a rewrite.

## Running it

No build step is required to just play it -- `dist/` is already compiled and checked in.

```
cd ledgerbound
python3 -m http.server 8123
# then open http://localhost:8123 in a browser, ideally with a narrow/mobile-width window
```

Any static file server works (`npx serve`, VS Code's Live Server, etc.) -- it's plain HTML/CSS/JS.

### If you edit the TypeScript

```
npm install -g typescript   # if tsc isn't already available
tsc --watch                 # recompiles src/*.ts -> dist/*.js on save
```

Then just refresh the browser tab.

## What's implemented (matches the Stage 6 prompt's 10-point checklist)

1. Project scaffolded (TypeScript + tsconfig, static HTML/CSS shell in place of Vite)
2. Map screen with 9 tappable city nodes and travel connections (canvas-drawn graph)
3. Market screen: buy/sell with +/- steppers, no typing required
4. Travel between cities with a distance-based gold/day cost model and an animated progress bar
5. Stat allocation screen shown once at character creation (12-point budget across Trade/Combat/Travel/Defense)
6. Two factions ("The Concord", "The Free Companies") with a 0-100 standing value that moves based on encounter choices and a Guild Hall "do a favor" action
7. A random travel encounter system with a genuine "ignore or engage" choice (Free Company Raiders = combat, Concord Patrol = inspection/bribe, Traveling Merchant = peaceful) -- roughly 45% chance per travel leg
8. A "reach 1,000 gold" win condition with a win screen (checked after *every* gold-changing action, not just travel -- this was a real bug caught during testing: winning via a Guild favor originally didn't trigger the win screen until the next trip)
9. Placeholder visuals only (colored circles/DOM styling, no real art assets) -- structured so real art can be dropped in without touching game logic
10. Local save/load via `localStorage`, verified by reloading mid-game and confirming it resumes at the correct city rather than restarting character creation

Also seeded, ahead of schedule, per the plan's Stage 6 note about not hardcoding a two-faction
assumption: faction data is a list, not two fixed fields, and the encounter/inspection system
already has the contraband-consequence hook (getting caught with Moonleaf by a Concord patrol
docks Concord standing) that the full Longhunters bounty system will build on later.

## Verified end-to-end (via a headless-browser test, not just by reading the code)

- Character creation -> stat allocation -> Begin Journey -> Map
- Map -> tap current city -> Market -> buy a good -> Guild Hall -> "do a favor" (gold + standing change)
- Map -> tap a connected city -> travel confirm panel -> Confirm -> travel animation -> random encounter triggered -> Concord Patrol inspection resolved -> arrival
- Reload mid-game -> resumes at the correct city instead of restarting
- Pushing gold to the 1,000 target via a Guild favor -> win screen appears correctly

## What's deliberately simplified for this first prototype

- Combat is a single power-comparison roll, not the full turn-based exchange described in the
  design doc -- enough to prove the loop, not tuned for balance.
- Only 2 of the 3 planned factions are here. The plan's Stage 6 prompt explicitly asked for the
  faction system to be built so a third slot (the Longhunters bounty-hunting guild) can be added
  without a rewrite -- `FACTIONS` is a list for exactly this reason.
- No ancient-ruin/artifact tier, no wise-mentor onboarding NPC, no achievements -- all called out
  as later-phase items in the plan document, not part of the Phase 1 slice.
- "Moonleaf" is used as the contraband good instead of a real-world drug name on purpose --
  most app stores apply a stricter age rating to literal drug references, so keeping it fictional
  avoids that friction later.
- Name entry is a plain text field, not the fancier flow a real build would want.

## Migrating to Phaser + Vite + Capacitor

When you're somewhere with normal npm access:

1. `npm create vite@latest ledgerbound-web -- --template vanilla-ts`, then `npm install phaser`.
2. Copy `src/data/` and `src/state/` over almost as-is -- they have zero DOM/Canvas dependencies,
   they're just plain TypeScript data and a state class.
3. Re-implement each file in `src/screens/` as a Phaser `Scene` instead of a DOM-render function --
   the underlying logic (what happens on buy/sell/travel/encounter) can move over largely unchanged;
   only the rendering calls change (Phaser `GameObjects` instead of `document.createElement`).
4. Once it runs under Vite, follow Capacitor's official "Add Capacitor to an existing web app"
   guide to get iOS/Android builds.

## File structure

```
index.html          entry point, loads dist/main.js as an ES module
style.css            all styling (mobile-first, dark parchment-ish placeholder palette)
src/
  data/              cities, goods, factions, encounters -- pure data, no logic
  state/GameState.ts  player state, buy/sell/travel/leveling logic, localStorage save/load
  systems/            encounter resolution (combat math, inspection outcomes)
  screens/            one render function per screen (Create, Map, City, Travel, Win)
  ui/dom.ts            tiny helper for building DOM elements without a framework
  screenManager.ts     swaps the visible screen
  main.ts              wires navigation between screens
dist/                compiled JS output (checked in so it runs with no build step)
```
