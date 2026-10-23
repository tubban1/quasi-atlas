# G2 · Cross-runtime Replay Qualification

Version 0.5.0-beta.2 · 2026-10-24. **This document records successful Mac–Windows–Linux engineering replay; independently implemented mathematical verification remains outstanding.**

## What is new

The default new Notebook uses "quasi-atlas.notebook/1.1" (legacy "quasi-atlas.notebook/1.0" remains readable). The 1.1 archive adds buildProvenance:
- gitCommit: source revision recorded by the producing Vite build
- mathSourceSha256: canonical SHA-256 of src/math/fields.js, src/math/contours.js, src/math/contract.js and src/notebook-core.js in fixed file/path order
- lockSha256: SHA-256 of the exact package-lock.json
- packageVersion and G2 engine identity

These fields are covered by the Notebook SHA-256. **They are NOT a digital signature or proof of author identity**; users can generate a new hash. They provide reproducibility diagnostics and explain provenance differences.

All new browser exports include this information; imported pinned files retain the original source/lock fingerprint. If an archive's pinned mathematical source or lockfile differs from the running version, the UI blocks a new snapshot or replay and reports ENVIRONMENT_MISMATCH. The user can export the original file and create a fresh local Notebook (button "＋ 新建"). A legacy 1.0 archive stays explicitly unpinned rather than being silently attributed to the new codebase.

Commit changes with identical source and lockfile are tracked but do not by themselves prevent compatible replay. Engine and domain/schema validation, integer counts and contour-length tolerance remain mandatory.

## Fixed canary and acceptance

The exact checked-in file is fixtures/g2/replay-canary.json and includes 3 datasets: archipelago, saddle and quasi. It is a finite-grid E1 audit, not a topology proof.

The same file is evaluated in at least two different execution environments using Node >=22 and the identical mathematical source/lockfile. Each run records:
- notebook SHA-256 and each snapshot SHA-256
- local math implementation SHA-256 and npm lock SHA-256
- operating system, CPU architecture, Node major
- closed/boundary/component integer contour counts and contour-length approximation

All integer counts must match exactly; length comparison tolerates at most 1e-5 + 1e-5 × max(|length A|, |length B|). The comparison script rejects two receipts from the same OS/architecture (for example two macOS processes) as insufficient cross-runtime evidence. It does not prove two physically separate devices when runtime labels are not independently attested.

## Run on Mac

From the repository root, with Node >=22:

    npm ci
    npm run gate
    node scripts/canary-receipt.mjs fixtures/g2/replay-canary.json --out mac-receipt.json

mac-receipt.json is a local test report, not user-source data. Do not commit personal test logs.

## Run on Windows (requires online authorized Windows computer)

Using PowerShell in an authorized clone of the **same commit**:

    git clone https://github.com/tubban1/quasi-atlas.git
    cd quasi-atlas
    node --version
    npm ci
    node scripts/replay-notebook.mjs fixtures/g2/replay-canary.json --receipt windows-full-report.json
    node scripts/canary-receipt.mjs fixtures/g2/replay-canary.json --out windows-receipt.json

The private repository requires GitHub access. Transfer the actual JSON receipt to Mac with an authorized method, then run:

    node scripts/compare-canary-receipts.mjs mac-receipt.json windows-receipt.json

The script returns MATCH only for two distinct platform/architecture labels with identical source/lock and notebook hashes, exact contour counts and acceptable numeric length differences. On Windows, filesystem paths and terminals use platform-native syntax; the Node scripts are cross-platform.

## Mac and Vercel Linux

Vercel builds the GitHub commit on Linux, runs the scientific gate (at least 67 tests) and repeats the **identical** fixtures/g2/replay-canary.json. Build logs include one concise G2_CANARY_RECEIPT record containing source/lock and the computed results. Compare this to the Mac receipt using scripts/compare-canary-receipts.mjs. This is one cross-runtime pairing; Windows was separately tested through Computer MCP as documented below.

## Verified cross-runtime result — 2026-10-24

**PASS: Mac darwin-arm64 (Node 22) vs Vercel Linux-x64 (Node 22).**

- Release deployment Git commit: `8ece83b` (Vercel Production READY).
- Mathematical code represented by the canary fixture was already committed at `c32057b`. Different later Git revisions are not treated as equal by name; the comparison explicitly verifies the identical math-source and lockfile content.
- Source: `sha256:3393c7753462b46ba042704f88e0a67d8c45eabd53b34f1070dcf60f42f42bc0`.
- Dependency lock: `sha256:66fd2f12727bb16df9cc30aa22c28618313e44826fdba397c49637c8c751b1a4`.
- Exact pinned canary notebook: `sha256:e17ca4fd35323c8b0ea42b25db261f1f8023a068d0bf3da6d81aae4dfd584c49`.
- Both real environments independently computed **MATCH** for 3 audited 2D finite-grid experiments; integer contour counts match and actual length differences are `[0, 0, 0]` within the published tolerances.
- Vercel build: `SCIENTIFIC_GATE_PASS 67/67 across 7 files`, plus the same pinned three-case canary.
- Production browser: Notebook 1.1 export has matching math and lockfile fingerprints, Worker MATCH, zero JavaScript errors; HTTPS custom domain verified.

**Windows physical-device gate: PASS** (2026-10-24). A live Windows 10 x64 machine connected through Computer MCP replayed the identical three-case fixture with Node 24. The actual Windows receipt was compared against both the Mac and Vercel Linux receipts; all three topology counts and all three contour lengths matched exactly (length deltas 0). The initial Windows clone caused a deliberate SHA mismatch because global Git core.autocrlf converted source bytes to CRLF; preserving LF during checkout fixed this. Repository .gitattributes now pins audited text checkout to LF. Full procedure and evidence: [G2_WINDOWS_ACCEPTANCE.md](G2_WINDOWS_ACCEPTANCE.md). The three observed environments establish same-engine platform reproducibility, **not** independent mathematical certification, cryptographically attested computer identity, or a proof.

## Failure codes

- Invalid/tampered/unrecognized Notebook: exit 2; no execution of imported expression/source.
- Valid pinned archive, math or lock mismatch: ENVIRONMENT_MISMATCH, exit 3; no false green MATCH.
- Same compatible engine but different computed counts or length: DIFFERENT, exit 1.
- Valid matching result: MATCH, exit 0; intra-engine deterministic replay only.
- 1.0 legacy: LEGACY_UNPINNED, replay possible, but source identity unavailable and never backfilled dishonestly.
- Failed canary or two receipts from the same OS/arch: CROSS_RUNTIME_UNVERIFIED, nonzero exit.

## Evidence status and remaining limitations

Mac, Windows via Computer MCP, and Vercel Linux results were independently computed and compared using the same pinned fixture on 2026-10-24; all three cases MATCH with length delta 0. Reproduction results are engineering observations only, not numerical certification.

The test receipts do not establish code signing, external numerical oracle equivalence, independent GUDHI/TTK verification, exact GPU/CPU visual identity, formal numerical certification or mathematical proof. Higher evidence tiers remain planned for G3/G4.

No actual personal notebooks or secrets should be uploaded to GitHub, Vercel or Cloudflare as part of this test.
