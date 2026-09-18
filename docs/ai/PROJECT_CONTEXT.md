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

3. Survivors View
- Sortable/filterable survivor table
- Survivors store their assigned `tags` directly. The settlement record keeps the shared tag catalog, survivor saves register newly used tags through the existing journal/recovery path, and the roster can filter by one settlement tag.
- Slot assignment controls for showdown (`1` and `2`)

4. Settlement
- Displays permanent unlocked knowledge definitions, settlement name, and settlement type.
- LAN Host can choose the type until the first Settlement settings save; that choice is then permanent while the name remains editable. The Host can use Vignette template actions; LAN Client is read-only; Local Development has a greyed-out tab.
- Campaign uses the normal settlement flow. Vignette can snapshot current survivor JSON records as a template and later restore survivor files back to that snapshot after creating a timestamped backup.
- Campaign stores a manually controlled, non-negative Lantern Year. The Host can enter a year or advance it by one and save the Settlement.
- Successful showdown returns through LAN Host or LAN Client append one settlement return record with survivor ID/name, Lantern Year, timestamp, and alive/dead state. Local Development does not create settlement return history.
- Settlement saves preserve identity/discoveries and reject stale revisions. Missing names/types in schema-1 records display as blank/Campaign and remain type-unlocked; existing Vignette records are treated as locked.

5. Showdown View
- Side-by-side survivors
- Editable combat/session values
- Depart/End Showdown session lifecycle
- Small danger controls on Insanity and each armor location open built-in Brain Trauma and severe injury tables. These tables do not depend on configured Markdown sources or private reference files.
- Every result whose severe-table text says it is permanent persists through normal Showdown saves as one `{ location, name, count }` entry in the survivor's `severeInjuries` array. Limits remain canonical built-in metadata rather than being duplicated into survivor JSON. The severe table and normal Create/View Survivor record display filled/empty pips for capped injuries and `×N` for unlimited injuries. At a once/twice cap, the table replaces `Apply`/`Record` with the bleeding symbol. Textual limit values and the overflow explanation stay hidden from the player-facing modal.
- Severe table rows show `Apply` only for fully deterministic app-owned effects. Permanent rows with additional unsafe/manual effects expose `Record` for the deterministic permanent portion and retain a separate bleeding-symbol action where appropriate; dice, random choices, Fighting Arts handling, other survivors, and unresolved board state remain manual. Create/View Survivor provides `Heal` per recorded injury occurrence. Healing decrements/removes the record and reverses that occurrence's deterministic permanent stat and restriction effects, but never removes bleeding tokens or other temporary/manual consequences.

## UI Direction
- The document shell is viewport-locked: the header/navbar never scrolls, while view content scrolls inside the main app shell below it.
- Header branding uses the small app icon; Settings uses a gear button. Settings independently selects a Classic, Zen, or Despair colour theme and a Standard/Modern style, allowing any palette to use either geometry. A header sun/moon button switches only brightness while retaining both saved selections. Despair provides a clean parchment/sage light palette and gritty iron/moss dark palette. Modern isolates structural overrides behind `theme-zen-layout`; the icon depicts the current mode (sun for light, moon for dark). Navbar hover styling must keep controls stationary to avoid scroll-container clipping.
- Prefer simple, efficient layouts over decorative nesting.
- Keep the rough position of existing tools/workflows, but reduce wrapper layers and visual ceremony.
- Do not default to rounded, pill-heavy, "safe" controls everywhere; squarer edges are acceptable and often preferred.
- Settings and utility surfaces should read as infrastructure, not showcase cards.

## Showdown Session Rules
- Showdown supports 1–6 selected survivors per player. Positions reveal progressively: Position 1 is required, Position 2 is initially available, and each filled position reveals the next; clearing Position 2 or later clears and hides all subsequent positions. Clicking another occupied position number for an already-selected survivor swaps the two position occupants. The active view paginates the party into pairs, with a single centred card on an odd final page. All selected slots remain live in memory and participate in Depart, save/reset, and LAN roster synchronization regardless of which party page is visible.
- LAN Showdown is coordinated by the Host. The action buttons show ready/total player counts (Host plus connected clients). A player's Depart vote locks their cards/slots; the session departs only when every player votes. End Showdown and Vignette Reset Showdown likewise wait for unanimous confirmation.
- The Host tracks connection identities, round IDs, votes, and completion acknowledgements in memory. Duplicate votes are idempotent; disconnected participants block an active vote until they reconnect. Clients joining after departure wait for the next session. Campaign completion retains existing per-survivor conflict/partial-save handling and only acknowledges successful saves; Vignette resets acknowledge in-memory restoration without writes.
- Local Development retains the standalone Showdown lifecycle. LAN requires a running Host and matching updated Host/Client versions. Readiness and survivor departure snapshots do not survive app/Host restarts.
- After `Depart`, the `Depart` button hides and `End Showdown` appears in the showdown session bar.
- There is no global departed indicator pill.
- `End Showdown` confirms, then writes persistent survivor updates.
- In Vignette mode, `Reset Showdown` restores both survivors and all temporary combat state from a deep snapshot captured at Depart, keeps the session departed and slots locked, and writes no survivor records. Depart resolves the settlement type from the authoritative provider; Campaign retains End Showdown.
- Showdown Lumi is a persistent survivor stat and saves through the same base-stat path as Survival.
- Temporary combat modifiers, armor, `Tokens (+)`, `Tokens (-)`, bleeding tokens, and weapon proficiency reminder controls are non-persistent.
- Weapon proficiency type is selected from an app-owned catalog rather than free text or private reference files. Rank 3 grants Specialization and rank 8 grants Mastery; Showdown's proficiency popover displays both built-in rules and their active/locked state.
- Each Depart vote registers a sanitized, display-only combat summary of that player's two survivors (name, Survival, Insanity, armour, and Light/Heavy states). During the departed Showdown, relevant local changes are sent back to the Host and rebroadcast so every LAN player can inspect the live roster from the Showdown navigation. The roster can remain open as a modal or a detached, automatically updating window. Private survivor fields and temporary state outside that summary are never shared in the roster.

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
- Survivor IPC routes through a survivor-provider layer shared by LAN Host, LAN Client, and development-only Local mode.
- Production requires LAN Host or LAN Client. A startup role gate catches new/default and legacy Local configurations before survivor workflows initialize. `npm run dev` adds `--dev` and is the only supported way to expose Local Development; packaged builds and ordinary `npm start` reject Local mode in the main process and provider layer.
- `LAN Host` uses the selected local survivor folder as authoritative storage and exposes a main-process HTTP JSON API for survivor health/list/load/save/delete operations when enabled in Settings.
- `LAN Host` also exposes a Server-Sent Events stream for survivor-data changes; LAN Client uses those events as refresh triggers and still reloads authoritative data through the existing survivor APIs.
- In both LAN Host and LAN Client modes, Settlement refresh is event-driven rather than interval-driven. Host survivor and Settlement writes notify connected Clients, and Client survivor writes notify both the Host renderer and connected Clients; each receiver reloads authoritative data when the change event arrives. Manual refresh remains available. Local Development retains interval refresh.
- `LAN Client` routes survivor list/load/save/delete calls to the configured host HTTP API and does not require a local Survivors folder for survivor CRUD.
- The default new-survivor template lives at `default_survivor_template/default-new-survivor.json` inside the authoritative Survivors folder. There is no separate template Data Source; LAN Clients load and save the Host's copy through the survivor provider/API.
- Every new survivor form gets fresh identity and history metadata; reusable templates supply starting values only. Keep each draft ID stable through edits/retries, and preserve identity when editing existing survivors.
- The navbar includes a compact survivor-data status indicator (`Hosting`, `Connected`, `Offline`, or `Error`, plus `Local` in development) that opens Settings when clicked; connection controls stay in Settings.
- Settings includes explicit `Start Host`, `Stop Host`, `Connect`, and `Disconnect` actions; client disconnect uses `lanClientConnected` so the host address can remain saved.
- Settings shows LAN Host URLs from local IPv4 addresses and includes a manual `Export Backup` action for copying the configured survivor folder before a session.
- LAN Host advertises itself with best-effort UDP broadcast; LAN Client Settings can scan/select discovered hosts while retaining manual host address entry as the fallback.
- In LAN Client mode, survivor write controls are disabled when the latest status is `Offline` or `Error`, survivor operations refresh the navbar status, and writes perform a fresh pre-save status check.
- LAN Client recovery messaging distinguishes unreachable host, validation failure, stale revision conflict, and generic server error; Auto Reconnect surfaces `Reconnecting` status while checking host health or restoring the live update stream. Stream registration has an eight-second acknowledgement timeout, automatic retries use jittered exponential backoff capped at 30 seconds and reset after registration/manual connection actions, and a deliberate Host stop sends a best-effort shutdown event so Clients transition offline promptly. After a known disconnect, system resume, app activation, or window focus retries immediately without duplicating healthy/currently connecting streams.
- In LAN Client mode, shared reference content is Host-authoritative alongside survivor data: Fighting Arts, Secret Fighting Arts, Knowledges/Tenet Knowledges, Neuroses, and Disorders list/load/save through the Host API. Client Settings hide the corresponding local folder selectors. Pickers fetch current Host listings whenever they open, so files added to Host collections mid-session become available without reconnecting; markdown bodies load on demand. Built-in severe-injury tables remain app-owned and do not use these folders.
- Settings and README expose two distinct compatibility boundaries. LAN: 1.x–2.x has no LAN; 3.0.0–3.3.3 is legacy unversioned and should use matching app versions; 3.4.0–3.5.0 uses protocol 1; 3.5.1+ uses protocol 2 until the next explicit bump. Survivor files: through 3.0.0 is legacy, while 3.0.1+ uses schema version 6.

## Knowledge / Tenet Knowledge Rules

- `settlement.json` in the authoritative Survivors folder records permanent knowledge discoveries. Knowledge and Tenet Knowledge share identity by normalized name + level, while survivor slot limits stay distinct.
- Successful survivor saves journal settlement metadata updates through `settlementService.js`; failed/unsaved changes do not unlock knowledge or create return history. `settlement-journal.json` retains pending work and numbered audit history. Recovery retries metadata registration, never survivor writes.
- Development-only Local mode and LAN Host use the same storage path; LAN Clients read the host settlement. Missing records are seeded from valid saved survivors on settlement lookup/summary refresh. Both metadata filenames are reserved from survivor CRUD.
- Knowledge pickers show stored settlement definitions first, a disabled separator, then remaining unique templates from both knowledge libraries. Definitions remain available without their source templates. See `docs/ai/SETTLEMENT_RECORD.md` for recovery and release checks.

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
  - When a valid next template is already selected, apply it directly. Otherwise offer both creating a new next-level entry and upgrading from an existing template.
  - `maxLevel`: no upgrade

## Template Library
- Knowledge templates are sourced from the configured `knowledges` data source path for both `Knowledge` and `Tenet Knowledge`.
- There is no dedicated or fallback `tenetKnowledges` data source.
- Neurosis templates are sourced from the configured `neuroses` data source path.
- Templates exclude runtime `currentObservations`
- Template selection UI supports search filtering

## Key Runtime Files
- `src/showdownReadiness.js`: Host-owned LAN Showdown readiness/round state machine, delivered over the existing SSE stream and dedicated Showdown IPC/HTTP endpoints.
- `src/main.js`: Electron app + IPC handlers
- `src/preload.js`: secure API bridge
- `src/dataService.js`: file I/O, validation, template persistence
- `src/renderer.js`: UI state/events/rendering
- Showdown is composed in `renderer.js` with explicit dependencies: `rendererShowdownState.js` owns state-only operations; `rendererShowdownView.js` owns card markup/DOM restoration; `rendererShowdownController.js` owns card interactions; `rendererShowdownSession.js` owns selection, lifecycle, persistence, and partial-save recovery. Renderer remains the state owner; session accessors and fresh state snapshots prevent stale references after resets.
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
- Release automation (`.github/workflows/release-publish.yml`) builds/publishes macOS, Windows, Linux x64, and Linux ARM64 artifacts for `v*` tags. It verifies that the tag matches `package.json` and includes separate Linux checksum files; the complete four-platform path passed for v3.1.0 in run `33918417489`.
- The core Linux release formats are `tar.gz`, DEB, and RPM. AppImage and Flatpak remain separate experimental/manual formats while their runtime behavior is stabilized.
- `Linux Package` uses native pinned GitHub runners for x64 (`ubuntu-24.04`) and ARM64 (`ubuntu-24.04-arm`). Each matrix job runs full verification, builds the explicitly selected tarball/DEB/RPM architecture, validates package architecture metadata and the executable ELF machine, launches the packaged app under Xvfb to verify renderer/preload readiness, logs ELF segments/checksums, and uploads a separate architecture artifact set.
- The ARM64 RPM from merged-`main` workflow run `33914931154` passed installed-package acceptance on Fedora Linux Asahi Remix under KDE Wayland with a 16 KiB-page kernel; future Electron/Builder upgrades should repeat this physical-device gate.
- Flatpak remains isolated in `Linux Flatpak Debug`; that workflow configures the `flathub` remote and installs `org.freedesktop.Platform//24.08`, `org.freedesktop.Sdk//24.08`, and `org.electronjs.Electron2.BaseApp//24.08` before packaging.

Client survivor saves still register unlocked knowledge in the host settlement record through the existing journal/recovery flow. Host-only editing applies to direct Settlement tab edits, not automatic knowledge registration from saved survivors.
