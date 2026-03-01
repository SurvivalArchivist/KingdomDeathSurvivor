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
- Depart/Showdown Over session lifecycle

## Showdown Session Rules
- `Depart` locks survivor slots and keeps showdown state active across navigation.
- Button text becomes `Departed` when active.
- Global departed indicator is shown across app while active.
- `Showdown Over` confirms, then writes persistent survivor updates.
- Temporary combat modifiers, armor, and bleeding tokens are non-persistent.

## Multi-User Safety (Current)
- Optimistic concurrency is implemented for survivor saves:
  - each survivor stores `revision` and `updatedAt`
  - save operations reject stale data with conflict errors
- Saves are atomic (temp write + rename) to reduce partial-write risk.
- Rename during edit can pass expected source filename to detect stale-origin conflicts.
- This does not provide distributed locking; concurrent edits still require coordination, but stale overwrite risk is reduced.

## Knowledge / Tenet Knowledge Rules

## Schema Compatibility Policy
- Survivor records now include `schemaVersion` (current: `1`).
- `loadPerson` applies compatibility normalization:
  - missing/invalid `schemaVersion` is treated as legacy and normalized to current version
  - future unsupported versions are rejected with a validation error
- `savePerson` normalizes incoming records to current `schemaVersion` before validation/write.
- Migration stub exists in `src/dataService.js` for future schema upgrades.
- Philosophy metadata includes optional `philosophyNeurosisName` (template/source label) and `philosophyNeurosis` text.
- Tenet Knowledge max: 1
- Knowledge max: 2
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
- Backward compatibility: if `knowledges` is unset, Tenet template operations fall back to `tenetKnowledges` when present.
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
