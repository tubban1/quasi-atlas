# Quasi Atlas — UI 2.0 / Information Architecture & Product Experience

**Version 0.4.0 · 2026-10-24 · Product and implementation specification**

## Design North Star

Make visitors feel "I can understand and play with this right now" without forcing them to face an entire numerical research interface first. The project is not just a graphing toy: it connects everyday observations, mathematical models, counterexamples, and honest scientific evidence.

**Visual direction:** quietly optimistic editorial learning; natural cream, pale sage, deep ocean teal, warm light; geometric SVG illustrations; careful typography and generous spacing. The living mathematical canvas remains vivid. Distinguish preview art (E0) from numerically calculated results (E1).

## Implemented information architecture

| Space | Promise | Primary CTA | Scientific status |
| --- | --- | --- | --- |
| Discover / 发现 | Start with a familiar curious question | Start first exploration or choose among six cards | Educational illustrations E0 |
| Living Studio / 探索工作台 | Change and investigate one phenomenon | Predict, adjust semantic parameter, inspect counterexample | Shared G0 engine E1 for numeric data |
| Research Roadmap / 研究路线 | Know what is real, planned, or still unproven | Try existing research tools | Explicit G0–G6 and E0–E4 |

Discover contains the first-screen proposition, contour hero SVG, three-stage onboarding, six daily topic cards (mountain, water, temperature, beats, moire, Wi-Fi), three depths of inquiry, and the distinction between beautiful visuals and scientific results.

Studio includes the actual existing canvas, on-canvas height slider, world selector, lesson question, mathematical explanation, counterexample, G0 finite-domain numeric statistics, grid checks and E1 research export. It does not use a fake screenshot or require an account.

Roadmap presents G0 engineering foundation as implemented, G1 six topics as interactive beta with user and teacher validation pending, and G2–G6 as plans only. Expandable detail blocks do not masquerade as active features. E0/E1 are usable, E2/E3/E4 are future research standards.

## User journeys

**Ordinary visitor, ~3 min:** Home → a curious everyday topic → one prediction → change height / phase / beat frequency → read explanation and model limitation → optionally save a learning JSON.

**Student or teacher:** Choose lesson → predict → compare variables → look for counterexample → discuss how visualization differs from evidence.

**Researcher:** Studio → research mode → formula/definition → parameter and resolution → critical candidate/heuristic grid check → explicit E1 JSON/SVG/PNG export. More advanced validated numerics do not exist yet.

## Interaction and responsive rules

- Three predictable primary destinations, consistent brand and navigation.
- No mandatory login and no fake controls.
- Desktop: visual workspace in the center, compact subject selection on left, progressively detailed inspector on right.
- Mobile: math visualization first, experiment/learning controls second, world selector third. Avoid compressing three columns side by side.
- Study route and parameters are available in shareable URLs; screen changes support browser Back/Forward.
- Keyboard focus states, responsive 390px / tablet / desktop, reduced-motion CSS preference.
- Topic illustrations are explicitly authored SVG visual metaphors, not real-world measurements.
- Scientific evidence remains E0 for didactic material and E1 for existing finite-window computed results.

## Test/release gates

- Existing golden/contract mathematical tests: 44 or more PASS and fail-closed Vercel build.
- End-to-end browser: G0 research, G1 six lessons, homepage/roadmap/studio navigation, smartphone overflow and JS errors.
- UI review screenshots under docs/ui-*.png.
- Deployment: GitHub main → Vercel independent project quasi-atlas-math → Cloudflare math.edunest.app.
- GitHub Actions hosted runners remain blocked by the account billing/spending limit until corrected separately. Vercel tests are an actual active gate; do not mislabel blocked Actions as passing.

## Scope limit

This is a redesign of currently usable G0/G1 features and a truthful interface for the entire roadmap. It does not implement G2–G6, add cloud storage/accounts, change mathematical core, certify E3/E4, or claim independently demonstrated learning gains.
