# Quasi Atlas — Studio Focus UI / Information Architecture (2026-10-24)

## Why the previous workspace was difficult

Previously, the left column simultaneously contained six Life Lens lessons, multiple preset worlds and a challenge. The right column simultaneously showed experimental data, hypotheses, numerical research actions, phase/scale/resolution controls, multiple export formats, formulas and explanations. Users were forced to parse three competing columns before taking a first action.

## New structure, fully implemented

Desktop: **one immersive mathematical canvas + one contextual inspector**. The third persistent column was removed. A compact "☷ 换主题" button opens a native modal dialog listing the six Life Lens lessons, preset fields and challenges; the drawer closes after selection or Escape.

Top of workspace: three explicit modes (original state.mode remains unchanged):
- **观察** (wander): live contour total, components, boundary and curve length, before/after baseline, brief epistemic caveat
- **学习** (learn): only the selected Life Lens lesson, with predict / adjust / explanation / counterexample / recording steps. Without a selected lesson, one invitation button opens the world drawer
- **研究** (research): candidate critical points and multi-grid verification. Detailed scale/phase/resolution changes and PNG/JSON/SVG exports live behind separate expandable sections. Formula and model limitations remain available

Notebook is a distinct and prominent G2 dialog reached with "▤ 发现日志", not nested within the inspector. All existing control IDs and math engine bindings are preserved, including the one-dimensional beat display, world pin, sliders, original G0 export schema, G1 learning JSON, and G2 pinned Notebook 1.1.

Mobile 390px: canvas first, inspector second; theme selection through modal drawer instead of squeezed columns. The browser audit validates no horizontal overflow, topic switching, inspector mode selection, Escape behavior and research-details disclosure.

No user accounts, cloud data upload or artificial scientific certification introduced. The interface does not remove research functions; it changes their discovery order.

## Navigation

Home topic card -> Studio and Learning tab automatically; choose a different lesson from drawer -> Learning tab; choose pure mathematical preset -> Observe tab; enter research from a lesson -> Research tab. Desktop and mobile share identical mode semantics and core controls.

## QA

- scripts/studio-focus-smoke.mjs: desktop, keyboard drawer, tabs, disclosures, mobile responsiveness, JavaScript error guard
- scripts/life-smoke.mjs: six teaching lessons, including 1D beats and JSON export
- scripts/smoke.mjs: G0 candidate critical points, grid checks, E1 export; opens research disclosure before export
- scripts/g2-smoke.mjs: immutable Notebook, replay, tamper rejection, persistence and migration
- scripts/ui-smoke.mjs: home, roadmap, studio, mobile overflow
- npm run gate: 67/67 math/contract/replay tests with pinned fixed canary

Remaining independent mathematical algorithm verification is a separate G3 scientific obligation, not represented by this UI redesign.
