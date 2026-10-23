# Quasi Atlas G2 — Discovery Notebook / Replay

Version: G2 Beta v0.5.0-beta.1 (2026-10-24)

## User workflow

Studio → “▤ 发现日志” → write research question, hypothesis, observations, counterexample and tentative conclusion → save a mathematical snapshot → change a parameter → observe stale label → save a second snapshot → compare the two → replay selected saved finite grid → export/download Notebook JSON, CSV or active SVG → import on another device or use the headless CLI.

All content stays in browser localStorage unless the user explicitly downloads it. **LocalStorage is not guaranteed permanent**; export a JSON archive before clearing browser data. No account or server storage needed.

The G2 notebook works on audited 2D scalar fields only; the beats lesson is 1D and must not be passed to a 2D contour evaluator. The original G0/G1 functionality remains accessible.

## Data contracts and model fidelity

- Notebook schema: quasi-atlas.notebook/1.0; replay engine g2-replay/1.0.
- Snapshot schema: quasi-atlas.snapshot/1.0; each snapshot includes snapshotHash, authored notes, display view and a complete unchanged scientific experiment.
- Scientific experiment: quasi-atlas.experiment/1.0 (G0/G1 contract) including exact preset, finite domain, parameter values, float32 sampling, numeric contour stats, engine/algorithm identification and E1 evidence.
- scientificHash signs scientific content; snapshotHash signs snapshot content excluding informational createdAt timestamps; notebookHash signs archive content excluding exportedAt.
- Integrity hashes detect changes, **not authentication or proof**.
- Verified legacy migration supports a G0 scientific experiment bundle or a G0 wrapper with a .scientific field. Mathematical inputs are preserved; reconstructed historical display view is explicitly approximate.
- Unrecognized versions are rejected (no speculative migrations). Algorithms/source code from user-supplied JSON are never executed.

## Offline headless replay

Prerequisite: Node.js 22 or newer, source checkout.

    cd /Users/wahaha/Documents/Me/Project/cursor/quasi-atlas
    node scripts/replay-notebook.mjs /path/to/quasi-atlas-notebook.json

Exit status 0: MATCH for every snapshot, with exact component count and absolute contour-length tolerance 1e-5 + 1e-5 × max(expected/actual lengths).

Exit status 1: DIFFERENT; differences are shown with original and recalculated counts and length.

Exit status 2: invalid / tampered / oversized / unsupported bundle.

This reuses the **same** field evaluator and Marching Squares math implementation; success is an intra-engine replay result, **not independent differential verification or numerical certification**. Independent TTK/GUDHI comparisons remain G3 and validated numerics G4.

## Resource limits and privacy

- Maximum 16 snapshots, imported file ≤2 MB, validated model grid budget 2,097,152 cells.
- Strict model domain, phase, level, sampling, source definition, engine ID, evidence and hash checks.
- CSV formula injection protection for text columns; numeric columns remain numeric.
- No eval of formulas or scripts from imported JSON; no backend upload.
- Snapshot hashes survive repeated same-content runs; timestamps are informational.
- Evidence level remains E1 for finite grid numerical observations; G2 cannot mint E2/E3/E4.

## G2 Acceptance status (beta)

Implemented tests:
- G2 schema, hash mismatch, falsified results, unsupported versions, duplicate snapshots, CSV safety, G0 migration, same-content stable fingerprints.
- Headless replay from two isolated Node processes and deliberate corrupted-file rejection.
- Browser: capture A/B, stale state after change, parameter comparison, worker MATCH, JSON → CLI MATCH, CSV, page reload/local persistence, malicious import refusal, verified G0 migration, G2 roundtrip import.
- Mobile: Notebook usability in 390px viewport, no horizontal overflow.
- Previous G0/G1 math contract and browser regression remain required.

Not yet claimed:
- Two physically separate computers/OSes replayed the identical file, or an independent numerical algorithm validated these results.
- Full cross-version engine migrations and pinned source/dependency-lock provenance.
- External research-grade or educational-scientific review.

## Delivery

Local Mac → private GitHub tubban1/quasi-atlas main → Git-backed independent Vercel quasi-atlas-math project → Cloudflare math.edunest.app. DNS is static. Production Vercel build is fail-closed: 6 required test files, at least 62 tests, and successful Vite build. GitHub Actions runners are currently blocked by the known GitHub account-level billing/spending limit, not by test failures.
