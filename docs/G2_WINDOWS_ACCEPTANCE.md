# G2 Windows Physical Reproduction — Acceptance (2026-10-24)

## Verified result

PASS — the connected Computer MCP Windows 10 x64 (10.0.19045), Node.js 24.21.0, Git 2.56.0.windows.2 checked out private Quasi Atlas commit 6d90d9d4af8f311498d8fc842b4e24fc013e1b06.

The headless CLI and the checked-in three-case fixture fixtures/g2/replay-canary.json returned MATCH on Windows. Genuine runtime receipts compared using the repository comparator yielded:
- Mac darwin-arm64 ↔ Windows win32-x64: MATCH
- Vercel Linux-x64 ↔ Windows win32-x64: MATCH

All three finite-grid experiments agree for component/closed/boundary counts and approximate contour length (length differences [0,0,0]).
- Notebook SHA256: sha256:e17ca4fd35323c8b0ea42b25db261f1f8023a068d0bf3da6d81aae4dfd584c49
- Math-source SHA256: sha256:3393c7753462b46ba042704f88e0a67d8c45eabd53b34f1070dcf60f42bc0
- npm lockfile SHA256: sha256:66fd2f12727bb16df9cc30aa22c28618313e44826fdba397c49637c8c751b1a4
- Samples: archipelago (3 components, length 57.938295309947094), saddle (2, length 55.788478281279836), quasi (72, length 488.2283968173891).

This is cross-OS intra-engine reproducibility, not a separately implemented numerical solver, numerical certification or mathematical proof.

## Diagnosed a real Windows-specific problem

Initial Windows clone had Git core.autocrlf=true, transforming audited JavaScript and package-lock.json bytes into CRLF. Strict provenance verification correctly failed with MATH_SOURCE_MISMATCH. Cloning with git -c core.autocrlf=false preserved LF and passed.

The repo now enforces .gitattributes text eol=lf for audited JS/MJS/JSON/CSS/HTML, and eol=crlf for Windows-specific scripts. This protects ordinary future clones independently of global core.autocrlf settings.

## Reproduction procedure (PowerShell)

Prerequisite: authorized GitHub access and Node 22+.

    cd C:\Users\i95i\mcp-workspace
    git clone https://github.com/tubban1/quasi-atlas.git quasi-atlas-g2-qa
    cd quasi-atlas-g2-qa
    npm ci
    node scripts/canary-receipt.mjs fixtures/g2/replay-canary.json --out windows-receipt.json
    node scripts/replay-notebook.mjs fixtures/g2/replay-canary.json --receipt windows-full-report.json

Compare Windows receipt against one captured on Mac with scripts/compare-canary-receipts.mjs.

## Remaining research scope

G2 cross-operating-system same-engine fixed-experiment gate is PASS. Independent numerical algorithms, G3 topology, interval/error-bounded G4 certification, and formal proofs remain separate, unimplemented research targets. No personal user notebooks or credentials were uploaded for this qualification.
