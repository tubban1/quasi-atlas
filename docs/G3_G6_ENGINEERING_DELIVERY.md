# G3–G6 engineering delivery and scientific release ledger

Date: 2026-10-24. Version: **engineering beta**, **not research-ready 1.0**.

## Scope delivered now
### G3 — Topology
- G3.1 implemented: finite 4-neighbour vertex-grid **H0** union-find persistent intervals, independently compared to Python BFS and **GUDHI v3.11.0**, 30 fixtures/1,048 H0 intervals.
- G3.2 **partial**: finite planar cubical complex **H1 Betti count** at explicitly sampled thresholds, computed by Euler identity `H1 = H0 - (V-E+F)` for a finite planar cubical subset. Checked at **30 × 2 × 8 = 480** thresholds against independently generated `GUDHI CubicalComplex(vertices)` reference, including 58 nonzero H1 observations. The H1 results are **counts**, not fully tracked birth–death persistence pairing/barcodes. Finite open non-periodic boundary, vertex-inclusive threshold, 4-neighbour edges and 4-corner cells. These are not continuous-domain topology conclusions.
- G3.3–3.4 **blocked**: TTK critical/merge tree comparison, per-branch persistence identity, before/at/after event matching and multiresolution uncertainty/counterexample audit.

Recompute GUDHI H1 with the isolated environment:
```sh
/tmp/quasi-g3-gudhi-venv/bin/python scripts/g3_h1_gudhi.py verify
node --test tests/g3-h1.test.js
```
The pinned immutable golden fixture is `fixtures/g3/h1-gudhi-thresholds.json`. Client UI in Research -> H0 displays current **H1 hole count** and JSON includes the full finite-threshold sweep, explicitly marked E1.

### G4 — Verifiable numerical claims
- Prototype for **only** `f(x,y)=(x-a)^2+(y-b)^2` with rational `a,b` and rational open rectangle. The exact rational verifier uses bounded BigInt fraction cross-products, no floating point assumptions. Gradient `(2(x-a),2(y-b))`, Hessian `diag(2,2)`. A strictly interior zero is uniquely located; strictly outside is excluded; on boundary returns UNKNOWN. It rejects falsified claims, mismatched fields and attempts to claim E3/E4.
- Files: `src/math/radial-certificate.js`, `src/math/radial-verifier.js`, `tests/g4-radial.test.js`. These are separate from current 7 visual field presets and NOT a general-purpose solver.
- **Not complete**: outward-rounded interval arithmetic, interval branch-and-bound, generic critical-point containment/uniqueness, verified certificate signature, timeout/UNKNOWN on general numerics, human specialist review. Despite exact arithmetic in this narrow toy model, all reports remain E1 provisional and must not be advertised as E3-certified.

### G5 — Controlled quasiperiodic exploration
- Fixed four-frequency explicit matrix `[[1,0],[0,1],[sqrt(2),sqrt(3)],[sqrt(5),-sqrt(7)]]`, phase applied to term index 2. Deterministic **4 phases × 3 square radii × 3 levels = 36** finite-window marching squares experiments with sampling 64², approximate contour lengths, clipped boundary counts, and manifest SHA-256.
- Replay: `node scripts/g5_sweep.mjs verify`. Immutable `fixtures/g5/quasi-sweep.json`, tampering fails. Generate with `node scripts/g5_sweep.mjs generate`. No network access, source code or user data leaves machine.
- **Not complete:** reproduce a named published theorem with stated hypotheses, long-window limit, aliasing/error study, comparison with periodic approximants, external mathematics review. Finite boundary crossing never proves globally open level sets.

### G6 — Education & independent review
- Six locally graded, original transfer questions in Research -> "学过的数学，能用在别处吗？"; understanding of contour values, clipped-window limits, reproducibility vs proof, synthetic data, H0/H1 intuition, and published theorem hypotheses. Answers are not transmitted nor persisted, no account required. These are **practice questions**, not evidence from a human study.
- Machine-readable release record `fixtures/g6/research-release-status.json`; `node scripts/research-release-gate.mjs --enforce-research-ready` must **exit 3 BLOCKED** until substantive scientific and external review gates clear. Do NOT attach this high-stakes gate to normal beta Vercel deployments.
- **Not complete:** accessibility audit with keyboard + screen reader actual test devices, independent two educator reviews, independent mathematical reviewer, consented user study, open-source license permission and explicit release owner approval.

## Independent external review template
Reviewers must be humans independent of the implementing Agent. Record in the tracking issue: name/role (with consent), exact reviewed Git SHA, mathematics definitions, methods, fixtures, bug/limit list, severity, date, consent to publishing attributable comments, and approval/reject/needs work. Store reviewer evidence references in a non-public controlled tracker if identity is sensitive; do not upload personal data or raw student responses as 'anonymous evidence'. **No reviewer approval is currently recorded.**

Educational pilot protocol: adults or appropriately consented participants, separate pre/post tasks, six unseen transfer questions, correct explanation of E1 vs proof, scope, time to first meaningful action, confounding/selection bias notes and voluntary consent. Report denominator, missing responses and all failures, never just a percentage. Small pilot results do not establish educational efficacy. Independent educator review is required even if metrics are favorable.

## Release decision
Beta deployment only if `npm run gate` and all existing G0–G3 browser checks and Vercel build pass. Never claim **G3 complete**, **E3 certification**, **paper reproduced**, **external peer-reviewed**, **research-ready** or **G6 completed** without evidence and signatures. No mass distribution/licensing promises until open-source license and third-party dependencies are audited. See `fixtures/g6/research-release-status.json`.

Next high-priority implementation sequence: (1) G3 H1 persistence interval pairing and TTK cross-baseline (2) G4 reviewed interval arithmetic with outward rounding and independent verifier (3) G5 target-paper hypothesis/scoped experimental reproduction with negative cases (4) G6 field study and external signoff.
