# AGENTS.md

## Purpose
This file is the repo-level working brief for future agents and contributors. Use it alongside `docs/ai/PROJECT_CONTEXT.md` and `docs/ai/MODEL_HANDOFF.md` to stay aligned with the product, the current UX direction, and the team's preferred way of changing the app.

## Product Snapshot
- Electron desktop app for Kingdom Death survivor management.
- Local-folder data model with JSON survivor records and markdown-backed reference content.
- Main workflows are Create/View Survivor, Settlement, Showdown, and supporting Settings/configuration.
- The app is utility software first: clarity, speed, and reliability matter more than decorative UI.

## Canonical Context
Before making significant changes, check:
- `docs/ai/PROJECT_CONTEXT.md` for stable product rules and current architecture.
- `docs/ai/MODEL_HANDOFF.md` for recent changes, known risks, and verification history.
- `ui/components/index.html` for shell/layout structure.
- `src/renderer.js` for view state, rendering, and interaction logic.
- `ui/components/styles/` for current styling layers and view-specific overrides.

## Working Principles
- Preserve existing workflows unless there is a strong reason to change them.
- Prefer simplification over invention. The app should feel deliberate, not over-designed.
- Reduce wrappers, duplicated shells, and visual ceremony before adding new layout chrome.
- Keep changes coherent across views; avoid one-off styling that makes one section feel like a different app.
- If a UI improvement is notable, update this file and the AI handoff docs so the direction stays sticky.

## UI Direction
- Favor simple, efficient layouts over decorative nesting.
- Keep the rough position of tools and workflows familiar, but strip out excessive layers and oversized containers.
- Header/navigation should remain thin, single-row, full-width, and consistent across sections.
- The header is for navigation and global controls only. It should stay clean, stable, and out of the way.
- Theme selection belongs in the header and should use a dropdown/switcher pattern that can scale to future themes.
- Do not let Showdown or any other view drift into a different navbar/header treatment without an explicit product decision.
- Settings and other utility surfaces should read as infrastructure, not showcase cards.
- Do not default to rounded, pill-heavy, "safe" styling. Squarer edges are welcome when they make the interface feel cleaner and more confident.
- Avoid making small controls look like large feature boxes when their job is simple form input or toggles.
- Use full width when it improves efficiency; do not add containment layers unless they solve a real layout problem.

## Current UX Expectations
- `Technical View` exists as functionality but should not drive the primary navigation layout unless explicitly requested.
- The top navigation should not grow taller between sections or modes.
- Showdown session behavior is important and should remain intact:
  - `Depart` locks survivor slots and keeps showdown state active across navigation.
  - `End Showdown` confirms and writes persistent survivor updates.
  - Lumi in Showdown is a persistent survivor stat and should save like Survival.
  - Temporary combat modifiers, armor, and bleeding tokens are non-persistent.
- The app should never create data folders automatically from Settings selections.

## Data and Domain Guardrails
- Survivor records use stable `id`, `createdAt`, and `schemaVersion` and are normalized on load/save.
- Survivor filenames are `{survivor-id}_{name-slug}.json`; the display name can change without changing identity, and history should key by `id`.
- Template-backed systems include knowledge, tenet knowledge, and neuroses; preserve current compatibility behavior when changing related UI.
- Multi-user safety is optimistic, not lock-based: avoid introducing save flows that silently overwrite stale data.

## Implementation Notes
- Prefer targeted edits over broad rewrites.
- When cleaning up UI, start by removing unnecessary containers and reducing special-case styling before introducing new components.
- Keep CSS responsibilities clear: shared shell/layout rules in base styles, view-specific differences only where truly necessary.
- When a view has drifted, first ask whether the fix belongs in shared styles rather than another local override.

## Verification
Use the standard verification baseline after meaningful changes:
- `node --check src/main.js src/preload.js src/dataService.js src/renderer.js`
- `npm test`

For docs-only updates, note that verification was not required.

## Documentation Discipline
- Record important product or UI direction changes in `docs/ai/MODEL_HANDOFF.md`.
- Keep `docs/ai/PROJECT_CONTEXT.md` focused on stable, canonical project facts.
- Keep this file opinionated and practical: it should tell future agents how to work in this repo, not just describe the repo abstractly.
