# Update Checklist (Mandatory for Agents)

Use this checklist for every non-trivial code update.

## Pre-Change
1. Read:
   - `docs/ai/PROJECT_CONTEXT.md`
   - `docs/ai/MODEL_HANDOFF.md`
2. Confirm current constraints and expected behavior.

## During Change
1. Keep modifications scoped.
2. Preserve existing app invariants (schema rules, showdown session rules, template rules).

## Post-Change
1. Run:
   - `node --check src/main.js src/preload.js src/dataService.js src/renderer.js`
   - `npm test`
2. Update `docs/ai/MODEL_HANDOFF.md`:
   - Current State Snapshot (if behavior changed)
   - Recent Changes
   - Open Risks / Follow-ups
3. If you added new architecture behavior, update `docs/ai/PROJECT_CONTEXT.md`.

## Handoff Entry Format
Use this compact entry format under "Recent Changes":
- `YYYY-MM-DD`: `<what changed>`; files: `<file1>, <file2>, ...`; verification: `<commands/results>`


## Additional Gate for Schema Changes
If you changed survivor JSON structure or `src/validation/person.schema.json`, you must also:
1. State whether the change is backward-compatible.
2. Implement/update `schemaVersion` compatibility behavior in `src/dataService.js`.
3. Add or update tests for:
   - legacy record load behavior
   - unsupported future schema version behavior
4. Add a clear warning in `docs/ai/MODEL_HANDOFF.md` if any migration risk remains.
