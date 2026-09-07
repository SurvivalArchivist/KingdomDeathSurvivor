# Knowledge Predecessor Link Plan

## Status

**Proposed — not started.**

This document records a possible redesign of Knowledge and Tenet Knowledge progression. It does not authorize implementation, schema changes, template rewrites, or data migration.

## Problem

Knowledge progression currently uses forward references:

- A knowledge entry declares `nextKnowledgeMode`.
- When the mode is `existingTemplate`, it also declares `nextKnowledgeTemplate`.
- The current knowledge therefore needs to identify its successor before that successor necessarily exists.

This makes authoring progression in natural order awkward. For example, Knowledge I cannot point to Knowledge II when Knowledge II has not been created yet.

## Proposed Direction

Reverse ownership of progression links:

- Remove the requirement for a knowledge template to declare its successor.
- Allow a successor template to identify the knowledge that precedes it.
- Treat a template with no predecessor as a base knowledge.
- Treat a template with a predecessor as a non-base knowledge.
- Discover successors by looking for templates whose predecessor matches the survivor's current knowledge.

Conceptual example:

```json
{
  "name": "Inner Lantern II",
  "knowledgeLevel": 2,
  "previousKnowledge": {
    "name": "Inner Lantern I",
    "knowledgeLevel": 1
  }
}
```

The base template would omit `previousKnowledge` or store it as `null`.

## Identity and References

Do not rely solely on a template filename for predecessor matching.

Survivor knowledge entries do not reliably retain their source filename, and filenames can change when a template is renamed. The initial pragmatic design should use the same logical identity already used by the settlement record:

- normalized knowledge name
- knowledge level

The persisted `previousKnowledge` value should retain the readable name and level. Runtime matching should normalize these values in exactly one shared helper so template progression and settlement discovery cannot drift into different identity rules.

A future stable template ID could replace name-and-level identity, but introducing template IDs is outside the initial scope unless implementation analysis demonstrates that they are necessary.

## Proposed Template Fields

### `previousKnowledge`

Optional predecessor identity:

```json
{
  "name": "Inner Lantern I",
  "knowledgeLevel": 1
}
```

Rules:

- Missing or `null` means the template is a base knowledge.
- A populated value means the template is a successor.
- A template cannot reference itself.
- The predecessor level must be lower than the successor level.
- The normal case should set the successor level to predecessor level + 1.

### `isFinalKnowledge`

Consider retaining an explicit boolean that identifies an intentionally terminal knowledge.

This avoids conflating two different states:

- no successor has been authored yet
- the current knowledge is intentionally the final level

Recommended behavior:

- `true`: the knowledge is terminal and cannot be upgraded.
- `false` or missing: a successor may exist now or be authored later.

This field describes the current knowledge's terminal status without requiring it to know the identity of a future successor.

The final name and default for this field should be confirmed before implementation.

## Authoring Behavior

When creating or editing a reusable knowledge template:

- Replace the current Next Mode and Next Template controls with an optional Previous Knowledge selector.
- Include a clear Base Knowledge option that leaves `previousKnowledge` empty.
- Populate the selector from existing Knowledge and Tenet Knowledge templates according to the product's shared-library rules.
- When a predecessor is selected, default the new template's level to predecessor level + 1.
- Prevent direct self-reference and invalid level ordering.
- Allow a successor to be authored after its predecessor without editing the predecessor.
- Expose an explicit Final Knowledge control if `isFinalKnowledge` is adopted.

Base/non-base status should be derived from `previousKnowledge`; do not store a second redundant `isBase` flag.

## Upgrade Behavior

When a survivor's current observations meet `observationRequirement`:

1. Normalize the current knowledge's name and level.
2. Search available definitions for templates whose `previousKnowledge` matches that identity.
3. Handle the result according to the number of matches:
   - One match: offer or perform the normal successor upgrade.
   - Multiple matches: present the matching successors as branches for the user to choose from.
   - No matches and the current knowledge is final: do not offer Upgrade.
   - No matches and the current knowledge is not final: report that no successor template is currently available.
4. Reset `currentObservations` when the successor is applied.
5. Preserve the current replacement, save, conflict, and Showdown recovery behavior.

Only matching successors should appear in an upgrade picker. The general template library should remain available for adding unrelated knowledge, but it should not permit an arbitrary unrelated template to masquerade as a successor.

## Scratch Successors

The current `noTemplate` mode permits an upgrade to a blank next-level entry. Removing the forward-link modes requires an explicit decision about this workflow.

Recommended behavior:

- Retain a `Create Successor` path when observations are sufficient but no saved successor exists.
- Seed the new entry's `previousKnowledge` from the current knowledge.
- Default its level to the current level + 1.
- Allow the completed successor to be saved as a reusable template.
- Do not describe a missing successor as MAX LEVEL unless the current knowledge is explicitly final.

## Branching

Reverse links naturally allow more than one successor to reference the same predecessor.

Recommended initial behavior is to support this as an intentional branch:

- show only matching successors
- label each choice with its name and level
- apply the user's selected branch

If the domain requires strictly linear progression, validation can instead reject multiple successors for one predecessor. That product rule should be confirmed before implementation.

## Settlement Knowledge Interaction

Knowledge and Tenet Knowledge currently share settlement discovery identity while retaining separate survivor slot limits. The redesign must preserve those rules.

- Settlement definitions should retain `previousKnowledge` and terminal-status metadata so an unlocked definition remains useful if its source template disappears.
- Successor matching should consider the intended combination of local templates and settlement-stored definitions.
- Stored definitions must remain selectable when source templates are missing.
- Cross-type deduplication must continue using normalized name + level identity.
- A successor relationship must not itself unlock knowledge; only the existing successful-survivor-save flow may register settlement discoveries.
- Journal recovery must continue to register settlement definitions without replaying survivor writes.

## Compatibility Strategy

Existing survivor records and template files may contain:

- `nextKnowledgeMode`
- `nextKnowledgeTemplate`

Removing these properties abruptly would invalidate existing schema-6 survivors because knowledge entries currently use strict property validation. Avoid an unnecessary campaign reset.

Recommended transition:

1. Continue accepting legacy forward-link fields during loading.
2. Stop presenting the legacy fields in the UI after the new behavior is ready.
3. Build an in-memory reverse index from legacy forward links where both referenced templates exist.
4. Prefer explicit `previousKnowledge` metadata when both formats are present.
5. Preserve legacy data long enough for schema-6 survivors to load safely.
6. Do not silently rewrite the user's entire external template library.
7. Write the new predecessor format for newly created or explicitly resaved templates.
8. Decide separately whether later cleanup warrants a survivor schema increment or a documented migration.

Legacy mode mapping needs an explicit implementation rule:

- `existingTemplate`: infer a reverse relationship on the referenced successor when resolvable.
- `noTemplate`: preserve access to the scratch-successor workflow during transition.
- `maxLevel`: treat as terminal compatibility metadata until `isFinalKnowledge` is explicitly stored.

Unresolvable legacy references should remain visible as warnings and must not cause survivor or template loading to fail.

## Validation Rules

Implementation should cover at least the following:

- `previousKnowledge` is absent/null or contains a non-empty name and integer level of at least 1.
- A template cannot reference its own normalized identity.
- A predecessor cannot have the same or a higher level than its successor.
- Automatically authored successors default to exactly current level + 1.
- Cycles are rejected or made impossible by strict increasing levels.
- Duplicate template identities are detected and reported deterministically.
- Missing predecessor templates do not make the successor template unreadable.
- Missing successor templates do not imply terminal status unless explicitly configured.
- Knowledge and Tenet Knowledge limits remain unchanged.

## Likely Implementation Areas

This is a planning inventory, not an instruction to edit these files.

- `src/dataService.js`
  - template sanitization, persistence, listing, and legacy compatibility
- `src/validation/person.schema.json`
  - survivor knowledge compatibility and any new persisted metadata
- `src/rendererKnowledgeTemplateHelpers.js`
  - identity normalization, successor matching, upgrade eligibility, and scratch successor creation
- `src/renderer.js`
  - Create/Edit/template authoring controls and upgrade picker coordination
- `src/rendererShowdownView.js`
  - successor/final-state presentation and Upgrade visibility
- `src/rendererShowdownController.js`
  - Showdown successor resolution and application
- `src/settlementService.js`
  - stored-definition metadata and shared identity behavior
- `ui/components/index.html`
  - scratch/template editor fields
- `test/`
  - compatibility, authoring, branching, settlement, Create/Edit, and Showdown coverage
- `docs/ai/PROJECT_CONTEXT.md`
  - canonical rules after the design is implemented and accepted
- `docs/ai/MODEL_HANDOFF.md`
  - implementation and verification history

## Suggested Implementation Phases

### Phase 1: confirm product rules

- Confirm whether progression may branch.
- Confirm whether terminal knowledge needs `isFinalKnowledge`.
- Confirm whether scratch successors remain supported.
- Confirm whether predecessor references may cross Knowledge/Tenet Knowledge types.

### Phase 2: pure model helpers

- Define canonical predecessor identity normalization.
- Define successor lookup and deterministic ordering.
- Define final, unavailable, single-successor, and branched-successor states.
- Add focused unit coverage before changing UI behavior.

### Phase 3: template persistence and compatibility

- Add predecessor metadata to template sanitization and persistence.
- Interpret legacy forward links in memory.
- Preserve schema-6 survivor loading.
- Add malformed, missing, duplicate, and cyclic-reference coverage.

### Phase 4: authoring UI

- Replace Next Mode/Next Template controls.
- Add Base/Previous Knowledge behavior.
- Add terminal-state control if approved.
- Automatically suggest the successor level.

### Phase 5: Create/Edit upgrades

- Resolve successors through reverse lookup.
- Support a single successor, branches, unavailable successors, and scratch creation.
- Preserve observation gating and reset behavior.

### Phase 6: Showdown upgrades

- Apply the same resolution rules through the Showdown controller/view boundaries.
- Preserve session state, Depart locking, save recovery, and non-persistent combat state.

### Phase 7: settlement integration

- Retain predecessor metadata in settlement snapshots.
- Verify local and LAN-host-authoritative lookup.
- Verify stored-definition fallback and journal recovery behavior.

### Phase 8: documentation and acceptance

- Update canonical context only after behavior is implemented.
- Run the full automated verification baseline.
- Complete manual Create/Edit, Settlement, Showdown, Local Files, LAN Host, and LAN Client acceptance.
- Record any remaining legacy-field cleanup as separate future work.

## Acceptance Scenarios

At minimum, verify:

1. Create Knowledge I with no predecessor; it is treated as base.
2. Later create Knowledge II and select Knowledge I as its predecessor without editing Knowledge I.
3. A survivor holding Knowledge I can upgrade to Knowledge II after meeting its observation requirement.
4. A final knowledge never presents an Upgrade action.
5. A non-final knowledge with no authored successor explains that no successor is available.
6. Two templates referencing the same predecessor produce an explicit branch choice.
7. A scratch successor receives the correct predecessor identity and level and can be saved as a template.
8. Renaming or deleting a source template produces deterministic fallback/warning behavior.
9. Legacy `existingTemplate`, `noTemplate`, and `maxLevel` records continue to load and behave safely.
10. Settlement-stored definitions remain usable when their original template files are absent.
11. Knowledge and Tenet Knowledge continue sharing discovery identity without changing their survivor slot limits.
12. Create/Edit and Showdown produce the same successor choices and results.
13. LAN clients resolve progression from host-authoritative settlement data without rewriting survivor records unexpectedly.
14. Stale survivor saves still fail through optimistic concurrency rather than overwriting newer data.

## Out of Scope for the Initial Change

- Replacing all template identities with newly generated stable IDs unless required by implementation analysis.
- Automatically rewriting every existing template file.
- Changing Knowledge or Tenet Knowledge survivor slot limits.
- Changing settlement unlock rules.
- Changing survivor schema version solely to remove legacy fields.
- Redesigning unrelated template libraries or Showdown controls.

## Open Decisions

Before implementation begins, confirm:

1. Are multiple successors from one predecessor valid branches?
2. Should terminal state use `isFinalKnowledge`, another explicit field, or no terminal marker?
3. Should users be able to create a scratch successor when no saved successor exists?
4. Can a Knowledge successor reference a Tenet Knowledge predecessor, or must progression stay within its entry type?
5. Is normalized name + level sufficient for the first version, or should stable template IDs be introduced now?

