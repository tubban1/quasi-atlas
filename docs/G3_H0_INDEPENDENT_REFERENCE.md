# G3.1 — Finite-grid H0 persistence and independent reference (2026-10-24)

**Historical G3.1 H0 acceptance.** Finite H1 threshold counts were subsequently implemented and GUDHI-compared in [G3–G6 engineering delivery](G3_G6_ENGINEERING_DELIVERY.md). Neither full H1 persistence pair tracking nor Gate G3 is complete.

## Why an ordinary person might care

The same mathematical question appears in familiar places:
- **Mountains:** raise the waterline. Which peaks remain as separate islands, and at which height do formerly separated regions connect?
- **Rain puddles:** lower or raise a height threshold; separate wet patches can merge into one.
- **Wi-Fi / temperature:** which points are above the minimum signal strength or temperature, and when do disconnected coverage zones appear?

Changing a cutoff turns a field into a collection of areas. **H0** counts connected components; tracking these areas as the cutoff moves gives a *persistence barcode*. A long bar means a feature survives many cutoff changes **in this finite sampled model**. It does not automatically mean a real-world physical structure exists.

## Scope and mathematical convention

We represent the field as a **finite, open-boundary, 4-neighbour vertex grid graph** (not a 2D continuous plane, not periodic, and not a 2D cubical complex with explicitly represented 2-cells).

- Vertices indexed row-major: i + j*(nx+1).
- Input values are finite float32 field samples.
- **Sublevel**: include vertex v when f(v) <= c; **superlevel**: include when f(v) >= c.
- Included adjacent vertices share a horizontal or vertical graph edge (NOT diagonal 8-neighbour).
- Edges become active as soon as both endpoints are included.
- Tied vertex values activate as one batch; zero-lifetime pairs are reported as a count but omitted from visible positive-persistence barcodes.
- Persistent H0 birth/death assignment uses union-find, elder rule, deterministic tie-index ordering; one final essential component in the full rectangle. For superlevel, the oldest component has the highest birth value.
- The browser shows up to 22 longest positive-persistence bars, plus the essential component. This is a display bound, **not a topological truncation of the threshold-count comparison**.
- Finite-grid H0 and finite-window contour component counts refer to **different spaces** and are never silently equated. H1 holes, contour trees, continuous-domain critical point proofs and E2–E4 evidence remain unavailable.

Primary implementation: src/math/topology-h0.js; separate flood-fill oracle: src/math/h0-flood-reference.js. The current UI restricts grids to approximately 97×97 vertices for predictable runtime. Invalid arrays, NaN/Infinity, huge grids, unknown direction and malformed thresholds fail closed. No personal data leaves the browser for this analysis.

## Independent reference and 30 golden fixtures

A standalone **Python standard-library BFS** (scripts/g3_reference.py) generated a fixed machine-readable golden corpus: fixtures/g3/h0-bfs-golden.json, 30 cases, 480 checks, with sampled vertices and expected component counts for each threshold and both filtration directions.

Families (5 parameter variants each):
1. two synthetic islands and connecting isthmuses;
2. saddle regions close to critical levels;
3. checkerboards containing ambiguous-looking cells;
4. equal-value plateaus and deterministic ties;
5. rings / holes **as input patterns**, but only H0 is assessed;
6. waves with perturbations and boundary intersections.

In the Node test, two different JavaScript algorithms (union-find sweep vs direct BFS flood fill) must both match all 480 **Python-generated** expected results. A deliberately corrupted H0 count must yield a DIFFERENT report. The Python script can revalidate the fixture independently:

    python3 scripts/g3_reference.py --verify
    node --test tests/g3-h0.test.js

This cross-check is **not** GUDHI or TTK. The Python reference compares H0 *threshold component counts*, not all individual birth/death pairing identities. Its grid graph and field samples match the JavaScript inputs by definition. It is an independently implemented discrete reference, not an independent physical measurement or certification.

## Third-party GUDHI H0 persistence reference (executed)

An isolated Python 3.11 environment with **gudhi==3.11.0** and **numpy==2.4.6** executed `gudhi.CubicalComplex(vertices=...)` on the identical 30 finite grid data sets, with their stored float32 values passed losslessly to float64. Superlevel persistence is computed by negating the scalar field, which converts it to a lower-star filtration. For H0 the cubical complex's 1-skeleton is the same 4-neighbour vertex adjacency; top-dimensional squares appear no earlier than their bounding edges.

Actual measured comparison, 2026-10-24:
- **30 datasets × 2 directions = 60 independent persistence computations.**
- **1,048 GUDHI H0 barcode intervals** compared birth/death endpoints against the JavaScript union-find implementation, tolerance 1e-8. **0 mismatches**.
- **480 threshold component counts** compared against the independent Python BFS expected values. **0 mismatches**.
- Fixed third-party golden stored in `fixtures/g3/h0-gudhi-golden.json`, including GUDHI/NumPy versions and SHA-256 of the original BFS fixture; Vercel's Node scientific test **must compare against this immutable external baseline**.
- `tests/g3-gudhi.test.js` deliberately mutates a third-party interval and requires DIFFERENT.

To reproduce the external GUDHI calculation without shipping its Python dependency to browsers:

```sh
uv venv --python 3.11 /tmp/quasi-g3-gudhi-venv
uv pip install --python /tmp/quasi-g3-gudhi-venv/bin/python 'gudhi==3.11.0' 'numpy==2.4.6'
/tmp/quasi-g3-gudhi-venv/bin/python scripts/g3_gudhi_reference.py --verify
```

GUDHI is used as an **offline reference only** and is not bundled into the client. Review its license and dependency/update policy before any future redistribution or production embedding. This independent reference validates **discrete H0 persistence**, not the previous G0 Marching Squares curves, H1, TTK, interval numerics or continuous mathematical proof.

## Studio user journey

Open math.edunest.app -> choose a 2D world -> Research -> expand "区域如何出现、合并？ · H0 实验".
1. Choose **高于水位的岛屿** (superlevel) or **低于水位的湖谷** (sublevel).
2. Click "分析 H0".
3. Read number of components at current threshold, most persistent H0 bars, and whether the two graph algorithms agree at five nearby thresholds.
4. Change the waterline or analysis direction. The old result is marked stale; **export is disabled** until rerun.
5. Export "quasi-atlas.h0-audit/1.0" JSON carrying model, exact finite window, sample resolution, H0 barcode summary, BFS comparison and strict E1 disclaimer.

The one-dimensional Beats lesson is intentionally not fed into a two-dimensional graph H0 engine. The G0/G1/G2 workbench, provenance and Notebook contracts remain unchanged.

## Acceptance and status

- 30 golden datasets, 480 independent precomputed threshold expectations;
- numerical / data-contract suite 75/75, including malformed input, plateau, merger, super/sublevel, falsified-result detection, and third-party GUDHI barcode-difference rejection;
- desktop browser H0, independent BFS MATCH, JSON export, stale input/direction rejection;
- mobile 390px H0 rendering, no horizontal overflow, JS errors = 0;
- legacy G0/G1/G2/studio/home/roadmap browser regressions pass;
- Vercel scientific gate must pass all 9 test files and >=75 tests, including stored independent GUDHI barcodes, then rerun the unchanged G2 pinned synthetic canary.

### What is still needed for Gate G3

- **G3.2:** H1 on a specified 2D complex and persistence diagram using verified boundary conventions.
- **G3.3 remaining:** external TTK reference cases for critical points and merge trees, and independent GUDHI **H1** when that implementation is added. GUDHI CubicalComplex(vertices=...) H0 has now been executed and compared with matching 1,048 barcode intervals / 480 rank checks; this does **not** close all G3 reference requirements.
- **G3.4:** map filtration events to actual contour branches; show before/at/after and evaluate sensitivity to grid/window refinement.
- **G3 Gate:** expert-reviewed degeneracies, 30-fixture reference deltas against stated independent TDA libraries, confidence and error bounds. G4 separately addresses certified numerics / interval arithmetic.

References (GUDHI H0 executed offline as an isolated reference; TTK remains planned):
- GUDHI cubical complex (https://gudhi.github.io/cubicalcomplex/)
- GUDHI cubical vertices filtration and persistence (https://gudhi.inria.fr/python/latest/periodic_cubical_complex_ref.html)
- TTK (https://topology-tool-kit.github.io/)

Research evidence remains E1. No scientific proof or independent TDA certification is implied.
