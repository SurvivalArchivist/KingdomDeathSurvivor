# Future Patch: Remove Backward Compatibility (New Campaign Reset)

Use this only when you explicitly declare a **new campaign reset** and confirm old survivor/config files are no longer needed.

## Purpose
- Remove legacy compatibility branches that add maintenance cost.
- Make data model and config behavior strict and simpler.

## Breaking Change Warning
This patch is intentionally breaking for older data/config.
- Old survivor JSON may fail validation after this patch.
- Old config using legacy `dataPath` (single path) will no longer auto-load.
- Tenet template fallback to `tenetKnowledges` will be removed.

## Preconditions (Required)
1. Back up or delete old survivor files.
2. Back up or delete old app config (`config.json` in Electron `userData` path).
3. Confirm campaign reset decision in writing (issue/commit message).

## Patch Scope

### 1) Remove legacy config fallback
File: `src/dataService.js`
- In `getSavedDataSources`, remove support for legacy `config.dataPath`.
- Keep only `config.dataSources` parsing.

### 2) Remove tenet knowledge folder fallback
File: `src/main.js`
- In `resolveKnowledgeTemplatePath`, remove fallback from `knowledges` to `tenetKnowledges`.
- Always use `dataSources.knowledges` for both `knowledge` and `tenetKnowledge`.

### 3) Remove deprecated data source key
Files: `src/dataService.js`, `src/renderer.js`, `ui/components/index.html`
- Remove `tenetKnowledges` from source-key handling and UI wiring.
- Remove Tenet Knowledge data-source selector row from Data Sources UI.

### 4) Remove `philosophyTenet` field completely
Potentially breaking; only do this after campaign reset.

Files:
- `src/validation/person.schema.json`
- `src/dataService.js` (template defaults / normalization)
- `src/renderer.js` (if any remaining references)
- `test/dataService.test.js` (fixtures/assertions)

Actions:
- Remove `philosophyTenet` property from schema.
- Remove any default/template assignment for `philosophyTenet`.
- Ensure no renderer code reads/writes it.

### 5) Make schema loading strict (optional but recommended during reset)
File: `src/dataService.js`
- Remove auto-normalization for missing/invalid legacy `schemaVersion`.
- Require explicit current `schemaVersion`.
- Keep future-version rejection.

## Required Test Updates
File: `test/dataService.test.js`
- Remove tests that assert legacy compatibility behavior:
  - legacy `dataPath` config fallback
  - auto-populate missing `schemaVersion`
  - tenet folder fallback behavior (if covered)
- Add strict-mode tests:
  - missing `schemaVersion` is rejected
  - unknown/legacy config format is rejected or ignored as designed
  - tenet templates require `knowledges` path

## Execution Checklist
1. Apply the code removals above.
2. Run:
   - `node --check src/main.js src/preload.js src/dataService.js src/renderer.js`
   - `npm test`
3. Update docs:
   - `docs/ai/PROJECT_CONTEXT.md` (remove fallback notes)
   - `docs/ai/MODEL_HANDOFF.md` (`Current State Snapshot`, `Recent Changes`, `Open Risks / Follow-ups`)

## Suggested Commit Message
`breaking: drop legacy config/schema/template compatibility for new campaign reset`
