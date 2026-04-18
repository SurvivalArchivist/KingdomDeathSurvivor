# Engineering Roadmap

Last updated: 2026-04-18

## Purpose
This document captures high-leverage follow-up work identified after reviewing the current app, codebase structure, and recent delivery history. It is meant to be a practical roadmap we can revisit, not a commitment to implement every item immediately.

## Current Read
- The app baseline is healthy: standard verification passed cleanly at the time this roadmap was written.
- The highest-value work now is less about fixing obvious breakage and more about improving scale, safety, and maintainability.
- The largest pressure point is renderer complexity, followed by settlement data-loading/render cost as survivor counts grow.

## Recommended Order
1. Add a batch settlement summary loading path.
2. Harden showdown save completion against partial-save outcomes.
3. Add dirty-state / unsaved-changes protection for Create and template editing.
4. Split renderer responsibilities into smaller modules.
5. Expand renderer workflow coverage with targeted tests.

## Priority 1: Settlement Summary Loading
Why it matters:
- Settlement refresh currently lists filenames, then loads every survivor individually.
- This creates extra IPC chatter and repeated file reads for the most frequently visited screen.
- As the survivor folder grows, this will likely become the most visible performance bottleneck.

Current pressure points:
- Settlement refresh flow in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:4579)
- Per-file settlement loading in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:2722)
- Sync file-system access in [src/dataService.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/dataService.js:364) and [src/dataService.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/dataService.js:382)

Recommended change:
- Add a `listPeopleSummaries` IPC/data-service path that returns only settlement-needed fields in one pass.
- Keep full `loadPerson` for editor/showdown entry, but stop using it for every settlement refresh.
- Precompute lightweight summary data during the batch read so settlement sorting/filtering works without repeated deep object traversal.

Expected benefit:
- Faster settlement refresh.
- Lower IPC overhead.
- Better scaling for auto-refresh and larger survivor folders.

## Priority 2: Showdown Save Hardening
Why it matters:
- Ending showdown is treated like one logical action, but today it saves two survivors in parallel and then proceeds.
- If one save succeeds and the other fails, the app can land in an awkward partial-persist state.

Current pressure points:
- Parallel showdown save in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:3454)
- End-showdown flow in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:3620)

Recommended change:
- Replace the current all-or-nothing assumption with explicit `Promise.allSettled()` handling.
- Surface per-survivor save results in the status/error flow.
- Keep showdown state intact if either save fails so the user can retry safely.
- Consider a dedicated recovery path for conflict errors versus generic save errors.

Expected benefit:
- Safer showdown completion.
- Better user trust when saves fail.
- Clearer recovery behavior in multi-user or stale-data scenarios.

## Priority 3: Unsaved Changes Protection
Why it matters:
- Create, edit, and default-template flows now contain enough data entry that accidental navigation/reset can be costly.
- The current UX allows back/reset/navigation without a dirty-form confirmation layer.

Current pressure points:
- Create navigation in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:5092) and [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:5128)
- Reset and back actions in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:5806) and [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:5819)

Recommended change:
- Track dirty state for Create/Edit and default-template modes.
- Prompt before reset, back, or page navigation when there are unsaved changes.
- Optionally add a lightweight "unsaved" status indicator near the save action.

Expected benefit:
- Less accidental data loss.
- Better confidence when editing larger survivor records or templates.

## Priority 4: Settlement Render Optimization
Why it matters:
- Settlement filtering and sorting are recomputed on every relevant input event.
- Search inputs trigger a full table rerender on each keystroke.
- Derived values like trait-search text and stats totals are recalculated repeatedly.

Current pressure points:
- Filter/sort work in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:2498)
- Table rebuild in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:2553)
- Immediate input rerenders in [src/renderer.js](/Users/mikehodges/Documents/Kingdom Death Survivors/src/renderer.js:4875)

Recommended change:
- Debounce settlement name/trait search inputs.
- Cache derived settlement values when records are refreshed.
- Avoid recalculating trait-search strings and sort values during every render pass.
- Only consider row virtualization if survivor counts become large enough to justify the complexity.

Expected benefit:
- Smoother filtering on larger datasets.
- Lower unnecessary work during active typing.

## Priority 5: Renderer Decomposition
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

## Priority 6: Test Expansion
Why it matters:
- Data-service and IPC coverage are strong, but renderer coverage is still relatively thin compared with the amount of UI logic in the app.

Current pressure points:
- Renderer smoke suite in [test/renderer.smoke.test.js](/Users/mikehodges/Documents/Kingdom Death Survivors/test/renderer.smoke.test.js:1)

Recommended next tests:
- Departed showdown locks settlement slot reassignment.
- End-showdown failure keeps session state recoverable.
- Settlement filter and sort behavior for the newer columns and derived values.
- Knowledge upgrade flows in Create and Showdown.
- Dirty-state prompts on navigation/reset.
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
