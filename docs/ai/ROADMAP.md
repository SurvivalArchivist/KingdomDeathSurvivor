# Engineering Roadmap

Last updated: 2026-09-04

## Purpose
This document captures high-leverage follow-up work identified after reviewing the current app, codebase structure, and recent delivery history. It is meant to be a practical roadmap we can revisit, not a commitment to implement every item immediately.

## Current Read
- The app baseline is healthy: standard verification passed cleanly at the time this roadmap was written.
- The highest-value work now is less about fixing obvious breakage and more about improving scale, safety, and maintainability.
- LAN survivor-data Phases 1–7 are complete: Host/Client CRUD, status, reconnect behavior, SSE Settlement refresh, discovery, backup export, offline read recovery, and real-world acceptance are all in place.
- Settlement summary loading has already landed, which removes the biggest recent data-fetch cost from settlement refreshes.
- Settlement name/trait search is now debounced, which removes the most obvious interactive rerender churn while typing.
- Showdown end-save handling is now hardened against partial-save outcomes and keeps the departed session recoverable when only one survivor save succeeds.
- Create/Edit/default-template flows now prompt before reset/back/navigation when the current form has unsaved changes, and the create action rail shows a lightweight unsaved indicator while the form is dirty.
- Renderer workflow coverage now includes rename-without-duplicate handling, departed slot-lock behavior, and template-driven knowledge upgrades in both Create and Showdown.
- Settlement workflow coverage now exercises newer/derived column sorting, combined filter behavior, row-button showdown assignment swapping, and settlement-to-showdown resume behavior.
- Renderer workflow coverage now also verifies a departed Showdown survives navigation through Create and Settlement without reloading or unlocking its survivor slots.
- Bulk-update coverage now verifies processing continues after per-survivor save failures and reports accurate updated/unchanged/failed totals.
- Knowledge template and upgrade helper logic now has a browser-safe module boundary, loaded ahead of `renderer.js` from `index.html` without changing Electron security settings or adding a bundler.
- Settlement filtering, sorting, and derived-value helpers now also live behind a browser-safe helper boundary, reducing renderer responsibility without moving settlement event wiring yet.
- Settlement table rendering and settlement-specific event wiring now also live behind the settlement helper boundary, leaving the renderer responsible mainly for state ownership and cross-surface callbacks.
- Further settlement optimization should now be driven by profiling and real survivor counts rather than assumed hot spots.
- The largest structural pressure point remains renderer complexity.

## Recommended Order
1. Expand remaining renderer workflow coverage where gaps still block refactor confidence.
2. Continue extracting focused renderer seams incrementally using browser-safe helper files or other renderer-compatible patterns.
3. Revisit deeper settlement filtering/render optimization only if profiling still shows pressure.
4. Revisit secondary markdown and bulk-update ergonomics only if they become a clearer bottleneck.

## Recently Completed: LAN Survivor Data
Status:
- Completed on 2026-09-04 after a final offline-read recovery pass.
- Local Files, LAN Host, and LAN Client modes share the survivor-provider boundary; the host remains authoritative for LAN survivor CRUD.
- Offline startup and failed survivor reads leave the app/current view usable and provide consistent reconnect guidance.
- Settlement refreshes from host push events. Create/Edit and Showdown intentionally require explicit refreshes to protect active in-memory work.
- Automatic discovery is a convenience feature; manual host entry remains the supported fallback.

Future LAN changes are maintenance-driven rather than roadmap blockers. Repeat real Host/Client acceptance after substantial Electron, network, or provider changes.

## Recently Completed: Settlement Summary Loading
Status:
- Completed on 2026-04-18.
- Settlement refresh now uses `listPeopleSummaries`, which batches the read path and precomputes settlement-safe summary fields.

Relevant shipped work:
- Batch settlement loading in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:4621)
- Summary generation in [src/dataService.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/dataService.js:467)

## Recently Completed: Showdown Save Hardening
Status:
- Completed on 2026-04-19.
- Ending showdown now handles per-survivor save results explicitly, keeps the departed session intact on failure, and syncs successful saves back into showdown memory so retries do not immediately trip stale-revision conflicts.

Relevant shipped work:
- Hardened showdown save flow in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:3501)
- Renderer smoke coverage for recoverable partial-save behavior in [test/renderer.smoke.test.js](/Users/mikehodges/Documents/Kingdom Death Survivors/test/renderer.smoke.test.js:730)

## Recently Completed: Settlement Search Debounce
Status:
- Completed on 2026-04-19.
- Settlement name and trait search now wait briefly before rerendering the table, while sort and non-text filters remain immediate.

Relevant shipped work:
- Debounced settlement search inputs in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:2521)
- Renderer smoke coverage for delayed search rerendering in [test/renderer.smoke.test.js](/Users/mikehodges/Documents/Kingdom Death Survivors/test/renderer.smoke.test.js:685)

Remaining follow-up:
- If settlement still feels heavy with larger survivor folders, profile whether additional caching around sort/filter work is warranted.
- Only consider row virtualization if measured survivor counts justify the extra complexity.

## Recently Completed: Unsaved Changes Protection
Status:
- Completed on 2026-04-19.
- Create/Edit/default-template flows now track dirty form state, prompt before reset/back/navigation discards, and show a lightweight unsaved indicator near the main action rail.

Relevant shipped work:
- Dirty-state snapshot and discard confirmation flow in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:672)
- Create-view discard coverage in [test/renderer.smoke.test.js](/Users/mikehodges/Documents/Kingdom Death Survivors/test/renderer.smoke.test.js:736)

## Recently Completed: Renderer Workflow Coverage Expansion
Status:
- Completed on 2026-04-19.
- Renderer smoke coverage now exercises rename-without-duplicate behavior, departed slot locking, template-driven knowledge upgrades in both Create and Showdown, and key settlement sort/filter/assignment workflows.

Relevant shipped work:
- Added workflow smoke coverage in `test/renderer.smoke.test.js`

## Recently Completed: Knowledge Template Helper Extraction
Status:
- Completed on 2026-04-19.
- Reusable knowledge template and upgrade helper logic now lives in a browser-safe helper file loaded before `renderer.js`, preserving the live Electron boot path while creating a focused first renderer seam.

Relevant shipped work:
- Extracted helpers into `src/rendererKnowledgeTemplateHelpers.js`
- Loaded helper before renderer in `ui/components/index.html`
- Updated renderer smoke harness to mirror the browser load order in `test/renderer.smoke.test.js`

## Recently Completed: Settlement Helper Extraction
Status:
- Completed on 2026-04-19.
- Settlement filtering, sorting, timestamp ranking, derived totals, table rendering, and settlement-specific event wiring now live in a browser-safe helper file loaded before `renderer.js`.

Relevant shipped work:
- Extracted helpers into `src/rendererSettlementHelpers.js`
- Loaded helper before renderer in `ui/components/index.html`
- Updated renderer smoke harness to mirror the browser load order in `test/renderer.smoke.test.js`

## Priority 1: Renderer Decomposition
Why it matters:
- `src/renderer.js` is the biggest maintainability risk in the repo.
- It currently mixes page state, view rendering, event delegation, modal logic, showdown state, settlement behavior, and create/edit workflows in one large file.

Current pressure points:
- Main renderer entry in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:1)

Recommended change:
- Split renderer code by responsibility rather than by micro-helper count.
- Good first seams:
- showdown state/render/events
- create/default-template state/render/events
- knowledge-template modal state/render glue building on the extracted browser-safe helper file
- shared utilities and formatting helpers

Expected benefit:
- Cheaper future changes.
- Lower regression risk.
- Better readability for debugging and onboarding.

## Priority 2: Test Expansion
Why it matters:
- Data-service and IPC coverage are strong, but renderer coverage is still relatively thin compared with the amount of UI logic in the app.

Current pressure points:
- Renderer smoke suite in [test/renderer.smoke.test.js](/Users/mikehodges/Documents/Kingdom Death Survivors/test/renderer.smoke.test.js:1)

Recommended next tests:
- Additional view-transition cases only when new stateful views or navigation rules are introduced; the current Settlement/Create/Showdown departed-session path is covered.
- Per-survivor bulk-update failure details if the UI is expanded beyond its current aggregate completion summary.
- Settlement column-visibility toggles if that surface gets refactored.

Expected benefit:
- Safer refactors.
- Better confidence in renderer cleanup work.

## Secondary Improvements

### Markdown Library Performance
Why it matters:
- Markdown browsing already has caching, but collection listing and preview generation still depend on synchronous folder walking and file reads.

Current pressure points:
- Collection caching and listing in [src/dataService.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/dataService.js:486)
- Preview metadata loading in [src/dataService.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/dataService.js:572)
- Recursive markdown collection walk in [src/dataService.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/dataService.js:643)

Recommended change:
- Consider lazier preview generation or stronger folder-level cache invalidation if markdown libraries get much larger.

### Bulk Update Safety and Ergonomics
Why it matters:
- Bulk updates are already useful, but they currently summarize success/failure only at a high level.

Current pressure points:
- Bulk update workflow in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:2651)

Recommended change:
- Add per-survivor conflict/failure detail in the completion summary.
- Consider a preview summary before applying larger changes.

## Notes
- This roadmap intentionally favors changes that improve performance, safety, and maintainability without changing the product's core workflows.
- If a future pass focuses on UI polish, the safer path is still to address shared layout/style drift before adding more one-off treatments.
