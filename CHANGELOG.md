# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and the project generally follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Version `3.0.1` is an explicitly documented exception because it performs the planned campaign reset within the existing v3 release line.

## [Unreleased]

## [3.3.0] - 2026-09-06

### Added

- Added a dedicated Settlement tab with a saved settlement name and an expandable list of unlocked Knowledge and Tenet Knowledge definitions.
- Added a permanent Campaign or Vignette settlement type choice. Vignettes can snapshot all survivors as a template and restore that template later, with the displaced survivor files backed up first.
- Added a host-managed Lantern Year counter and LAN-only return history for Campaign settlements, recording the survivor, year, timestamp, and alive/dead state.
- Added a startup role choice for new or legacy Local configurations, with Local Development available only through `npm run dev`.

### Changed

- Renamed the former Settlement roster view to Survivors and made persistent settlement settings directly editable by the LAN Host only; LAN Clients retain read-only access.
- Production runs now require a LAN Host or LAN Client role. A Host can continue to use the app by itself with its selected Survivors folder.

### Fixed

- LAN Client survivor saves continue registering unlocked knowledge and return metadata in the host-owned settlement record without granting direct settlement edit access.

## [3.2.1] - 2026-09-06

### Changed
- Removed an obsolete engineering checkpoint from the contributor guidance while retaining the Create/View Survivor action-rail styling as a permanent UI guardrail.

### Fixed
- Updated transitive `fast-uri` from 3.1.5 to 3.1.7 to resolve the current npm security advisories.

## [3.2.0] - 2026-09-05

### Added
- Added a persistent settlement knowledge record and durable registration journal shared by Local Files, LAN Host, and LAN Client modes.
- Added settlement-first Knowledge and Tenet Knowledge pickers with stored-definition fallback when source templates are unavailable.

### Changed
- Decomposed Showdown state, rendering, interactions, and session lifecycle into focused browser-safe modules while preserving existing workflows.
- Updated GitHub-hosted CI workflows to Node 24-based releases of checkout, setup-node, upload-artifact, and download-artifact, removing the deprecated Node 20 action runtime dependency.
- Expanded automated verification to 246 tests and completed manual acceptance of the settlement and Showdown changes.

## [3.1.1] - 2026-09-04

### Changed
- Completed the LAN survivor-data roadmap and documented Settlement-only push refresh as an intentional safeguard for active Create/Edit and Showdown state.
- Expanded renderer regression coverage for departed Showdown navigation and partial bulk-update outcomes.

### Fixed
- LAN Client startup now remains usable when the host is offline, with consistent reconnect guidance for failed survivor reads while preserving the current list, editor, or Showdown state.
- Changed future Linux artifact filenames to a stable, space-free form so GitHub does not rewrite their names after checksum generation.

## [3.1.0] - 2026-09-04

### Added
- Added first-class Linux core release artifacts for x86_64 and ARM64: `tar.gz`, DEB, and RPM packages.
- Added native x64 and ARM64 CI packaging with package-architecture, ELF, checksum, and packaged Electron launch validation.
- Added separate SHA-256 checksum files for each Linux architecture's release artifacts.

### Changed
- Tagged releases now build and publish Linux core packages alongside macOS and Windows artifacts.
- Upgraded Electron Builder to 26.15.7 and declared Node.js `>=22.12.0` for development and packaging.
- Manual release publishing now requires an existing version tag and verifies that it matches `package.json`.

### Fixed
- Aligned the generated Linux desktop entry name with the packaged application executable.
- Verified the installed ARM64 RPM on Fedora Linux Asahi Remix under KDE Wayland with a 16 KiB-page kernel.

## [3.0.1] - 2026-08-10

> [!CAUTION]
> **BREAKING CAMPAIGN RESET:** Version 3.0.1 does not load survivor files from earlier app versions. Back up any survivor folder and app configuration you need before installing. Start with a new survivor folder and reselect all Data Sources in Settings.

### Changed
- Survivor records now require schema version `6`; missing, invalid, older, and future schema versions are rejected instead of migrated.
- Knowledge and Tenet Knowledge templates now both require the shared `knowledges` Data Source.
- App configuration now reads only the current `dataSources` structure and ignores the legacy single `dataPath` format.
- The app now shows an explicit campaign-reset message when incompatible survivor files are skipped.

### Removed
- Removed the deprecated Tenet Knowledges Data Source selector and `tenetKnowledges` configuration key.
- Removed the deprecated `philosophyTenet` survivor field.
- Removed legacy schema-version migration and dedicated Tenet Knowledge folder fallback behavior.

## [3.0.0] - 2026-05-12

### Added
- Added LAN survivor-data support with `Local Files`, `LAN Host`, and `LAN Client` modes in Settings.
- Added a local LAN Host HTTP API for survivor list, summary, load, save, delete, health, and live survivor-data change events.
- Added LAN Client survivor routing that preserves the existing Create, Settlement, Showdown, and survivor edit workflows while reading and writing through the host.
- Added a compact navbar LAN status indicator for Local, Hosting, Connected, Reconnecting, Offline, and Error states.
- Added explicit Settings actions for starting/stopping a host and connecting/disconnecting a client.
- Added automatic LAN host discovery with scan/select controls, while keeping manual host entry as a fallback.
- Added LAN Host URL display and a manual survivor-data backup export action.

### Changed
- Settlement now refreshes automatically on LAN Clients when the host broadcasts survivor-data changes.
- LAN Client save/delete flows now run pre-save health checks and disable write actions while disconnected.
- LAN reliability messages now distinguish unreachable host, validation failures, stale revision conflicts, and generic server errors.

### Fixed
- Hardened LAN Host start/stop recovery, host-start rollback, client reconnect handling, event-stream cleanup, and offline save behavior for real table sessions.

## [2.2.9] - 2026-05-04

### Fixed
- Fixed Showdown combat `Temp` modifiers so they can go positive or negative, while `Tokens (+)` and `Tokens (-)` remain clamped at zero.

## [2.2.8] - 2026-05-02

### Added
- Added `Lumi` to Settlement Bulk Updates so it can be adjusted for all living survivors alongside the existing stat fields.

## [2.2.7] - 2026-05-02

### Fixed
- Fixed the Settlement `Stats Total` column so it sums only Movement, Speed, Accuracy, Strength, Luck, and Evasion. Courage and Understanding remain visible/sortable separately but no longer contribute to the total.

## [2.2.6] - 2026-04-30

### Fixed
- Restored the Windows packaged runtime/build chain to the known-good 2.2.4 versions after the 2.2.5 Electron/toolchain refresh caused Windows white-screen startup failures.
- Gave Windows setup and portable builds distinct artifact names so the portable executable can no longer overwrite the installer in release output.

## [2.2.5] - 2026-04-26

### Changed
- Updated the packaged Electron runtime to 40.9.2 and refreshed the build toolchain with electron-builder 26.8.1.
- Refreshed the locked dependency tree and cleared npm audit advisories.

## [2.2.4] - 2026-04-26

### Changed
- Raised the survivor Knowledge entry limit from 2 to 5 across Create/View Survivor, Showdown, template insertion, and survivor schema validation.

## [2.2.3] - 2026-04-23

### Fixed
- Fixed the Settlement `Lifetime Reroll` extra filter so it uses the survivor field saved by the Lifetime Reroll checkbox.

### Removed
- Removed a tracked macOS `.DS_Store` file from release output.

## [2.2.2] - 2026-04-21

### Added
- Added a persistent Showdown Lumi counter beside Bleeding Tokens, using the same saved base-stat behavior as Survival.

### Changed
- Removed the baked outer shadow/fringe from the packaged application icons across macOS, Windows, and Linux.

### Fixed
- Fixed the Showdown weapon proficiency type input so it no longer appears blacked out in Light or Zen light themes.

## [2.2.1] - 2026-04-19

### Added
- Expanded renderer smoke coverage around rename/edit, departed Showdown slot locking, knowledge upgrades, settlement sorting/filtering, showdown assignment swapping, and settlement-to-showdown resume behavior.

### Changed
- Extracted browser-safe renderer helper seams for knowledge-template flows and settlement filtering/rendering/event wiring so the next renderer cleanup pass can move more safely.
- Refreshed the packaged application icons for macOS, Windows, and Linux with a rounded-corner treatment for a more modern platform fit.

## [2.2.0] - 2026-04-19

### Added
- Added unsaved-change protection to Create, Edit, and default-template flows, including discard confirmations on reset/back/navigation and a lightweight `Unsaved changes` indicator in the create action rail.

### Changed
- Debounced Settlement name and trait search so active typing no longer rebuilds the full table on every keystroke.

### Fixed
- Hardened `End Showdown` so partial-save outcomes are handled explicitly, successful survivor saves are synchronized back into showdown memory, and failed saves leave the session recoverable for a safe retry.

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
