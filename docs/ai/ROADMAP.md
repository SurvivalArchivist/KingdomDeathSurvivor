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
- Showdown refactor coverage now verifies successful two-survivor completion/reset, persisted-data refresh boundaries, temporary combat-state reset, inline Abilities/Impairments/Notes persistence, and page/accordion preservation across slot rerenders.
- Showdown constants, state construction, page stepping, modifier/armor mutations, and inline text-draft operations now live behind a browser-safe helper boundary loaded before the main renderer.
- Bulk-update coverage now verifies processing continues after per-survivor save failures and reports accurate updated/unchanged/failed totals.
- Knowledge template and upgrade helper logic now has a browser-safe module boundary, loaded ahead of `renderer.js` from `index.html` without changing Electron security settings or adding a bundler.
- Settlement filtering, sorting, derived values, table rendering, and settlement-specific event wiring now share a browser-safe helper boundary, leaving the renderer responsible mainly for state ownership and cross-surface callbacks.
- Further settlement optimization should now be driven by profiling and real survivor counts rather than assumed hot spots.
- The largest structural pressure point remains renderer complexity.

## Recommended Order
1. Continue the active Showdown renderer decomposition from Step 6 below using the explicit State/View/Controller boundaries now defined.
2. After Showdown is complete, split the existing Settlement helper when Settlement next needs meaningful feature or maintenance work; do not interrupt the active refactor solely to reorganize it.
3. Revisit deeper settlement filtering/render optimization only if profiling still shows pressure.
4. Revisit secondary markdown and bulk-update ergonomics only if they become a clearer bottleneck.

## Renderer Module Boundary Strategy

Split renderer code by responsibility and reason to change, not by line count or individual function. Prefer a small set of cohesive browser-safe modules over either a single broad `Helpers` file or many one-function files. Modules must receive state, DOM elements, APIs, and cross-view callbacks explicitly rather than reaching into another module's hidden state.

Target Showdown ownership:

- `rendererShowdownState.js`: constants, normalization, state factories, and state-only operations.
- `rendererShowdownView.js`: survivor-card markup, DOM assignment, and page/accordion snapshot and restoration behavior. Async markdown content remains supplied through explicit callbacks.
- `rendererShowdownController.js`: Showdown-specific delegated events, mutation coordination, selection/refresh/depart/completion lifecycle, and partial-save recovery. Cross-view navigation, global busy/status presentation, and application initialization remain in `renderer.js` and are passed in as callbacks.
- `renderer.js`: application composition and cross-view coordination. It should not regain view-specific markup or state transition details once they move behind a module boundary.

Current helper audit (2026-09-04):

| Module | Assessment | Direction |
| --- | --- | --- |
| `rendererKnowledgeTemplateHelpers.js` (85 lines) | Healthy and cohesive. Its exported functions all cover knowledge-template normalization, labels, eligibility, and upgrade construction without DOM or event ownership. | Keep as one module; rename only if a broader renderer naming cleanup becomes worthwhile. |
| `rendererShowdownState.js` (240 lines) | Healthy and cohesive. It contains only constants, factories, normalization, and state-only operations. | Keep as the State module; do not add markup, DOM, async I/O, or lifecycle coordination. |
| `rendererShowdownView.js` (561 lines) | Large but cohesive: its public card-render operation owns markup generation, DOM assignment, and accordion preservation while receiving card data and formatting/content dependencies explicitly. | Keep as the View module. Split further only if independently changing card subviews emerge; do not split by line count alone. |
| `rendererSettlementHelpers.js` (400 lines) | A moderate mini-monolith. It combines pure filtering/sorting/derived-data logic with table rendering, search-timer ownership, column visibility, and all Settlement event binding. | Defer until after Showdown, then split into `rendererSettlementData.js`, `rendererSettlementView.js`, and `rendererSettlementController.js` as part of the next meaningful Settlement change. Preserve current behavior and avoid a reorganization-only detour now. |

The 5,881-line `renderer.js` remains the primary structural pressure point. Completing controller-level ownership boundaries there has higher value than splitting already-cohesive modules.

## Active: Showdown Renderer Decomposition

Status:

- The full refactor is being developed on branch `refactor/showdown-renderer-decomposition`; each numbered step is a checkpoint on this branch.
- Step 1 completed on 2026-09-04.
- Step 2 completed on 2026-09-04.
- Step 3 completed on 2026-09-04.
- Step 4 completed on 2026-09-04.
- Step 5 completed on 2026-09-04.
- No production behavior changed in Step 1. Five regression tests were added to lock down the current Showdown behavior before extraction.
- Step 2 added the browser-safe `src/rendererShowdownHelpers.js` boundary and moved only Showdown constants, fresh-state factories, and page-key normalization into it. DOM rendering, event wiring, mutations, and session persistence remain in `renderer.js`.
- Step 3 moved page stepping, modifier validation/clamping, armor counter/check handling, and inline text-draft synchronization/edit/commit operations behind explicit state arguments in the helper. Renderer wrappers still own rendering, user feedback, delegated events, and lifecycle persistence.
- Step 4 renamed the state-only module to `rendererShowdownState.js`, added `rendererShowdownView.js`, and moved the complete survivor-card markup builder behind explicit card data and formatting/content callbacks. `renderer.js` still normalizes card inputs, synchronizes drafts, assigns `innerHTML`, preserves accordion state, coordinates markdown loading, and owns events/lifecycle.
- Step 5 completed View ownership of card rendering by moving the `innerHTML` assignment and accordion snapshot/restoration behavior into `rendererShowdownView.js`. `renderer.js` still selects and normalizes each slot, supplies explicit render inputs, coordinates markdown loading, and owns all Showdown events and lifecycle behavior.
- Focused verification: `node test/renderer.smoke.test.js` passes 41/41 tests. Full verification: `npm run verify` passes 229/229 tests.

Completed Step 1 coverage:

- Successful End Showdown saves both survivors, clears the completed session, and requires fresh slot selection.
- Refresh Survivors replaces in-memory survivor data before departure and is blocked after departure.
- Temporary armor, bleeding tokens, combat modifiers, proficiency reminders, and armor checkboxes reset for a new session.
- Inline Abilities, Impairments, and Notes edits persist through successful Showdown completion.
- Each slot's selected page and expanded/collapsed accordion state survive slot-level rerenders.

Resume directly here:

1. **Next — Step 6:** create `rendererShowdownController.js` and move inline text-entry/card mutation coordination plus Showdown-specific delegated events behind a small initializer boundary.
2. Inject renderer-owned state access, rendering, markdown/template actions, and status/busy services through explicit callbacks. Do not move selection, refresh, depart, completion, or partial-save lifecycle coordination in the same step.
3. Run the focused renderer suite, then the standard repository verification before considering Step 6 complete.

Planned sequence after Step 6:

7. Move selection, refresh, depart, completion, and partial-save lifecycle coordination into the Controller while keeping application navigation and global UI services injected from `renderer.js`.
8. Remove superseded renderer code, tighten module exports/dependencies, and document the final ownership boundary.
9. Run full automated verification and a short manual Showdown acceptance pass before merging.

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
