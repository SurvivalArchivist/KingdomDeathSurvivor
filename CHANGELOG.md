# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.2] - 2026-04-19

### Changed
- Split Showdown combat `Tokens` into separate showdown-only `Tokens (+)` and `Tokens (-)` buckets, with the top row now showing `Base` and `Tokens (+)` and the second row showing `Temp` and `Tokens (-)`.
- Added a temporary Showdown weapon proficiency reminder control beside the proficiency type field and kept it in showdown-only slot state.

### Fixed
- Fixed Showdown weapon proficiency type editing so the text input no longer rerenders away after a single character.
- Fixed the Showdown knowledge-upgrade scratch flow so the reusable-template option becomes available correctly after jumping straight into `Create From Scratch`.
- Replaced the broken reusable-template checkbox interaction in the Showdown knowledge-upgrade editor with a reliable explicit toggle button and added clearer `ON` / `OFF` visual states.

## [2.1.1] - 2026-04-19

### Fixed
- Fixed a Settlement `Ponder` regression introduced in `2.1.0` where survivors who met `nextPhilosophyAgeThreshold` could appear as `Ready to Ponder` in the survivor edit view but not in the Settlement table summary.
- Aligned Settlement batch-summary `canPonder` logic with the survivor detail/edit view so threshold-qualified survivors are reported consistently across both surfaces.

## [2.1.0] - 2026-04-18

### Changed
- Reworked Settlement refresh to use batch survivor summaries instead of loading every survivor record individually for the table view.
- Kept Create/Edit, Showdown, and other full survivor flows on full-record loads so existing save and conflict behavior remains intact.

### Fixed
- Improved behavior for cloud-synced survivor folders by skipping temporarily unreadable survivor files during Settlement refresh instead of failing the whole refresh.
- Reduced the amount of survivor read churn required for Settlement refreshes, which should make the view more dependable in multi-machine shared-folder setups.

## [2.0.0] - 2026-04-16

### Added
- Introduced two new themes, `Zen Day` and `Zen Night`, built around a softer bamboo-and-shoji inspired palette.
- Added a scalable theme-switcher flow in the header so the app can support multiple visual systems cleanly.

### Changed
- Reframed the app’s visual direction around flatter, cleaner working surfaces with less decorative nesting and less unnecessary shell chrome.
- Reworked the Showdown layout to use clearer survivor shells, roomier spacing, tighter vitals/proficiency controls, and header-based session actions.
- Flattened the Settlement view by removing the outer page shell while keeping the table and filtering workflow intact.
- Restored stronger in-panel color separation for knowledge content so sections are easier to scan at a glance across themes.

### Fixed
- Fixed Zen Day parity issues where some inherited dark surfaces, including parts of the Settlement table and modal-related utility areas, remained too dark against the light palette.
- Corrected Showdown input and section presentation issues uncovered during the shell-reduction pass, including over-wrapped containers and inconsistent section readability.

## [1.5.5] - 2026-04-12

### Added
- Showdown blank-template knowledge upgrades now open a write-in modal so the upgraded knowledge can be completed immediately.
- The Showdown knowledge upgrade modal now includes an option to also save the new knowledge as a reusable template.

### Fixed
- Fixed the Showdown knowledge upgrade flow where choosing a blank next level could leave the upgraded entry looking empty with no immediate way to write it.
- Fixed checkbox interaction in the Showdown knowledge upgrade modal so the reusable-template toggle can be selected normally.

## [1.5.2] - 2026-03-29

### Added
- **Comprehensive test suite expansion** - Added 158 tests covering:
  - Schema compatibility and migration (v0, v1, v2 → v3)
  - Utility functions and public API
  - Template validation for knowledge and neurosis templates
  - File system error handling (corrupted JSON, permission errors, atomic writes)
  - IPC handlers for all main process operations
  - Validation constraints (limits on fighting arts, disorders, knowledge entries)

### Changed
- **Performance optimization** - Added markdown collection caching with 5-second TTL to reduce repeated directory scans

### Fixed
- Test infrastructure now properly includes all test files in CI pipeline

## [1.5.1] - 2025-01-01

### Added
- Initial release of KDM Survivors Console
- Survivor management (create, edit, delete)
- Schema migration support for legacy data
- Markdown-based content for fighting arts, disorders, and knowledge
- Knowledge progression tracking
- Neurosis management
- Cross-platform desktop support (macOS, Windows, Linux)
