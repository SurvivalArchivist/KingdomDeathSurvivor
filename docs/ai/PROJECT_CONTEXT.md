# Project Context (Canonical)

## Product Goal
Electron desktop companion app for Kingdom Death survivor management with:
- Local-folder data storage
- JSON survivor records
- Markdown-backed content references (fighting arts, disorders, etc.)
- Multi-view UX for technical editing, creation, settlement overview, and showdown play

## Current Views
1. Technical View
- Raw JSON + visual editor
- Full CRUD on survivor data

2. Create Survivor / View Survivor
- Friendly structured editor
- Used for both create and edit flows
- Editing existing survivor should replace original record on rename (no duplicates)

3. Settlement View
- Sortable/filterable survivor table
- Slot assignment controls for showdown (`1` and `2`)

4. Showdown View
- Side-by-side survivors
- Editable combat/session values
- Depart/End Showdown session lifecycle

## UI Direction
- Prefer simple, efficient layouts over decorative nesting.
- Keep the rough position of existing tools/workflows, but reduce wrapper layers and visual ceremony.
- Do not default to rounded, pill-heavy, "safe" controls everywhere; squarer edges are acceptable and often preferred.
- Settings and utility surfaces should read as infrastructure, not showcase cards.

## Showdown Session Rules
- `Depart` locks survivor slots and keeps showdown state active across navigation.
- After `Depart`, the `Depart` button hides and `End Showdown` appears in the showdown session bar.
- There is no global departed indicator pill.
- `End Showdown` confirms, then writes persistent survivor updates.
- Showdown Lumi is a persistent survivor stat and saves through the same base-stat path as Survival.
- Temporary combat modifiers, armor, `Tokens (+)`, `Tokens (-)`, bleeding tokens, and weapon proficiency reminder controls are non-persistent.

## Multi-User Safety (Current)
- Optimistic concurrency is implemented for survivor saves:
  - each survivor stores a stable `id` that remains fixed when `name` changes
  - each survivor stores `createdAt`, `revision`, and `updatedAt`
  - save operations reject stale data with conflict errors
- Saves are atomic (temp write + rename) to reduce partial-write risk.
- Survivor filenames use `{survivor-id}_{name-slug}.json`; name-only legacy files still load and migrate on save.
- Existing survivor saves write a best-effort pre-save snapshot under `history/survivors/{survivor-id}/` inside the configured survivor data folder before replacing the current survivor file.
- Rename during edit can pass expected source filename to detect stale-origin conflicts.
- Saves can also discover an existing survivor file by `id`, which keeps raw/technical name edits from leaving duplicate old-name files.
- This does not provide distributed locking; concurrent edits still require coordination, but stale overwrite risk is reduced.

## LAN Survivor Data Direction
- LAN Host / LAN Client has been exercised in a real-world trial and behaved as expected.
- v3 LAN work is tracked in `docs/ai/LAN_SURVIVOR_PLAN.md` and `docs/ai/LAN_IMPLEMENTATION_HANDOFF.md`.
- Survivor IPC should route through a survivor-provider layer so `Local Files`, future `LAN Host`, and future `LAN Client` modes can share the existing renderer API.
- `Local Files` remains the default provider mode.
- `LAN Host` uses the selected local survivor folder as authoritative storage and exposes a main-process HTTP JSON API for survivor health/list/load/save/delete operations when enabled in Settings.
- `LAN Host` also exposes a Server-Sent Events stream for survivor-data changes; LAN Client uses those events as refresh triggers and still reloads authoritative data through the existing survivor APIs.
- `LAN Client` routes survivor list/load/save/delete calls to the configured host HTTP API and does not require a local Survivors folder for survivor CRUD.
- The navbar includes a compact survivor-data status indicator (`Local`, `Hosting`, `Connected`, `Offline`, or `Error`) that opens Settings when clicked; connection controls stay in Settings.
- Settings includes explicit `Start Host`, `Stop Host`, `Connect`, and `Disconnect` actions; client disconnect uses `lanClientConnected` so the host address can remain saved.
- Settings shows LAN Host URLs from local IPv4 addresses and includes a manual `Export Backup` action for copying the configured survivor folder before a session.
- LAN Host advertises itself with best-effort UDP broadcast; LAN Client Settings can scan/select discovered hosts while retaining manual host address entry as the fallback.
- In LAN Client mode, survivor write controls are disabled when the latest status is `Offline` or `Error`, survivor operations refresh the navbar status, and writes perform a fresh pre-save status check.
- LAN Client recovery messaging distinguishes unreachable host, validation failure, stale revision conflict, and generic server error; Auto Reconnect surfaces `Reconnecting` status while checking host health or restoring the live update stream.
- Markdown/reference content remains local/cloud-backed for the first LAN phase; only survivor records are intended to become host-authoritative.

## Knowledge / Tenet Knowledge Rules

## Schema Compatibility Policy
- Version `3.0.1` is an explicit new-campaign reset; pre-reset survivor/config compatibility is not supported.
- Survivor records require an explicit `schemaVersion` of `6`.
- Missing, invalid, older, and future `schemaVersion` values are rejected with a validation error rather than migrated.
- `savePerson` and `loadPerson` both enforce the current schema version before validation/write.
- Survivor JSON no longer supports the deprecated `philosophyTenet` property.
- Philosophy metadata includes optional `philosophyNeurosisName` (template/source label) and `philosophyNeurosis` text.
- Tenet Knowledge max: 1
- Knowledge max: 5
- Both support:
  - `observationRequirement`
  - `currentObservations`
  - `knowledgeLevel` (>= 1)
  - `nextKnowledgeMode`: `existingTemplate | noTemplate | maxLevel`
  - `nextKnowledgeTemplate` (used when mode is `existingTemplate`)
- Upgrade logic in showdown:
  - Upgrade appears when `currentObservations >= observationRequirement` and mode != `maxLevel`
  - `existingTemplate`: replace with selected next template
  - `noTemplate`: create blank next-level entry
  - `maxLevel`: no upgrade

## Template Library
- Knowledge templates are sourced from the configured `knowledges` data source path for both `Knowledge` and `Tenet Knowledge`.
- There is no dedicated or fallback `tenetKnowledges` data source.
- Neurosis templates are sourced from the configured `neuroses` data source path.
- Templates exclude runtime `currentObservations`
- Template selection UI supports search filtering

## Key Runtime Files
- `src/main.js`: Electron app + IPC handlers
- `src/preload.js`: secure API bridge
- `src/dataService.js`: file I/O, validation, template persistence
- `src/renderer.js`: UI state/events/rendering
- `src/validation/person.schema.json`: survivor schema
- `ui/components/index.html`, `ui/components/styles.css`: UI structure/styles

## Validation & Tests
- Schema validation via AJV in `dataService`
- Tests use Node test runner in `test/`
- Standard verification:
  - `node --check src/main.js src/preload.js src/dataService.js src/renderer.js`
  - `npm test`

## Packaging & Release
- Electron Builder packaging targets now include:
  - macOS: `dmg`, `zip`
  - Windows: `nsis`, `portable`
  - Linux: `flatpak`, `AppImage`, `deb`, `rpm`, `tar.gz`
- Release automation (`.github/workflows/release-publish.yml`) currently builds/publishes macOS + Windows artifacts for `v*` tags.
- Linux packaging is currently handled by manual workflows (`Linux Package`, `Linux Flatpak Debug`) while Linux release packaging is stabilized.
- `Linux Package` uses native pinned GitHub runners for x64 (`ubuntu-24.04`) and ARM64 (`ubuntu-24.04-arm`). Each matrix job runs full verification, builds the explicitly selected tarball/DEB/RPM architecture, validates package architecture metadata and the executable ELF machine, launches the packaged app under Xvfb to verify renderer/preload readiness, logs ELF segments/checksums, and uploads a separate architecture artifact set.
- Flatpak remains isolated in `Linux Flatpak Debug`; that workflow configures the `flathub` remote and installs `org.freedesktop.Platform//24.08`, `org.freedesktop.Sdk//24.08`, and `org.electronjs.Electron2.BaseApp//24.08` before packaging.
