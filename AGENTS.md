# Agent Operating Instructions

These instructions apply to any coding agent working in this repository.

## Required Context (Read First)
Before making any code change, read:
1. `docs/ai/PROJECT_CONTEXT.md`
2. `docs/ai/MODEL_HANDOFF.md`
3. `docs/ai/UPDATE_CHECKLIST.md`

## Required Update Steps (After Changes)
If you modify code, you must also:
1. Update `docs/ai/MODEL_HANDOFF.md`
2. Add a short entry under "Recent Changes"
3. Update "Current State Snapshot" if behavior changed
4. Update "Open Risks / Follow-ups" if applicable

## Quality Gates
Run these before finishing:
1. `node --check src/main.js src/preload.js src/dataService.js src/renderer.js`
2. `npm test`

If a gate cannot run, explicitly document why in `docs/ai/MODEL_HANDOFF.md`.

## Scope Rules
- Do not remove or rename files in `docs/ai/` unless explicitly requested.
- Keep entries factual, concise, and implementation-specific.
- Preserve cross-model continuity over stylistic preference.


## JSON Schema Change Guardrail (Required)
Any change to survivor JSON structure or `src/validation/person.schema.json` is potentially breaking for deployed data.

Before implementing such a change, agents must:
1. Explicitly flag it as a potential breaking change.
2. Describe impact on existing survivor files.
3. Propose a compatibility strategy (`schemaVersion` migration, defaults, or explicit rejection policy).
4. Add/update tests that cover legacy record loading and incompatible-version handling.
5. Record the change and risk in `docs/ai/MODEL_HANDOFF.md` under both:
   - `Recent Changes`
   - `Open Risks / Follow-ups` (if any unresolved migration risk remains)

Agents must not silently merge schema-breaking changes without the above.
