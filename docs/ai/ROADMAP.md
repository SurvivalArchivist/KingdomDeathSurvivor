# Engineering Roadmap

Last updated: 2026-04-19

## Purpose
This document captures high-leverage follow-up work identified after reviewing the current app, codebase structure, and recent delivery history. It is meant to be a practical roadmap we can revisit, not a commitment to implement every item immediately.

## Current Read
- The app baseline is healthy: standard verification passed cleanly at the time this roadmap was written.
- The highest-value work now is less about fixing obvious breakage and more about improving scale, safety, and maintainability.
- Settlement summary loading has already landed, which removes the biggest recent data-fetch cost from settlement refreshes.
- Settlement name/trait search is now debounced, which removes the most obvious interactive rerender churn while typing.
- Showdown end-save handling is now hardened against partial-save outcomes and keeps the departed session recoverable when only one survivor save succeeds.
- Create/Edit/default-template flows now prompt before reset/back/navigation when the current form has unsaved changes, and the create action rail shows a lightweight unsaved indicator while the form is dirty.
- Further settlement optimization should now be driven by profiling and real survivor counts rather than assumed hot spots.
- The largest structural pressure point remains renderer complexity.

## Recommended Order
1. Split renderer responsibilities into smaller modules.
2. Expand renderer workflow coverage with targeted tests.
3. Revisit deeper settlement filtering/render optimization only if profiling still shows pressure.
4. Revisit secondary markdown and bulk-update ergonomics only if they become a clearer bottleneck.

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

## Priority 1: Renderer Decomposition
Why it matters:
- `src/renderer.js` is the biggest maintainability risk in the repo.
- It currently mixes page state, view rendering, event delegation, modal logic, showdown state, settlement behavior, and create/edit workflows in one large file.

Current pressure points:
- Main renderer entry in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:1)

Recommended change:
- Split renderer code by responsibility rather than by micro-helper count.
- Good first seams:
- settlement state/render/events
- showdown state/render/events
- create/default-template state/render/events
- markdown and knowledge-template modal flows
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
- Departed showdown locks settlement slot reassignment.
- Settlement filter and sort behavior for the newer columns and derived values.
- Knowledge upgrade flows in Create and Showdown.
- Regression test for "rename existing survivor does not duplicate" if not already covered at the desired level.

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
