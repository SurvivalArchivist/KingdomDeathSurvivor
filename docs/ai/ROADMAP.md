# Engineering Roadmap

Last updated: 2026-09-07

## Purpose

This document tracks active proposals and worthwhile follow-up work. Completed implementation history belongs in `docs/ai/MODEL_HANDOFF.md`; stable product and architecture rules belong in `docs/ai/PROJECT_CONTEXT.md`.

Roadmap entries are directions to investigate or implement deliberately, not authorization to change data formats or user workflows without confirming their open product decisions.

## Current Baseline

- Version 3.3.1 is prepared for tagged release.
- The standard preflight passes 276/276 tests.
- Production and full npm audits report zero vulnerabilities after updating transitive `fast-uri` to 3.1.7.
- Windows setup and portable builds passed user acceptance with Electron 41.10.4 and Electron Builder 26.15.7.
- Production is Host/Client only; Local Development is exposed only through `npm run dev`. New/default and legacy Local configurations are gated at startup until a role is selected.
- The settlement knowledge record, durable registration journal, and unlock-first Knowledge/Tenet Knowledge picker shipped in 3.2.0.
- Showdown state, view, card interactions, and session lifecycle are separated into focused modules and have passed automated and manual acceptance.
- Linux x64/ARM64 core packaging and tagged publishing are operational; AppImage and Flatpak remain experimental.
- Individual survivor JSON files remain the authoritative survivor records. Multi-user safety is optimistic and revision-based, not lock-based.

## Recommended Order

1. Continue the selected Host/Client production direction by making Host readiness and Client connection mandatory before normal workflows, if required by the next product decision.
2. Consolidate remaining mode/capability checks after the startup role gate has settled.
3. Confirm the open product decisions in the Knowledge predecessor-link proposal, then implement it on top of the selected capability foundation.
4. Keep the survivor index deferred until authority rules are proven and profiling or operational experience demonstrates a need.
5. Split Settlement renderer responsibilities only when meaningful Settlement work makes that boundary useful.
6. Continue renderer/test/performance work when driven by a concrete feature, measured bottleneck, or regression risk.

## Selected: Host/Client Production with Development-only Local Mode

Status: **selected and partially implemented**.

The options and their delivery implications are in `docs/FEATURE_CAPABILITY_AND_SETTLEMENT_AUTHORITY_PLAN.md`.

Shared direction:

- Give every feature an explicit mode/capability classification.
- Make LAN Host the sole authority for persistent settlement state and LAN Client a transport to that authority.
- Resolve capabilities centrally and enforce them below the renderer as well as in the UI.
- Require each future feature to document ownership, supported modes, offline behavior, UI treatment, compatibility, and test coverage.

Option A retains Local Files for per-survivor features and derived queries, but disables persistent settlement-wide features such as settlement knowledge in Local mode. Existing settlement files are preserved, while Local survivor saves stop creating or updating settlement knowledge and journal state.

Option B removes Local Files from the main app. First launch requires choosing Host or Client; a Host must configure and start its authoritative storage, while a Client must join a Host before the rest of the app becomes available. Local-only operation may later continue as a separately maintained app or fork, but that is not part of this decision or plan.

The implemented first step requires Host or Client in production and retains Local solely as a developer workflow. Mandatory Host startup and successful Client connection before entering every normal workflow remain separate follow-up decisions.

## Deferred: Settlement Survivor Index

Status: **deferred — do not implement yet**.

Individual survivor JSON and `listPeopleSummaries` remain the query source for survivor totals, alive/dead state, and Settlement rows.

Revisit a rebuildable `survivor-index.json` only after the capability/authority model is delivered and one of these triggers exists:

- profiling demonstrates that survivor-file summaries are a material bottleneck
- operational experience demonstrates a recurring need for index/file reconciliation diagnostics
- a future coordinated-settlement feature needs a materialized summary boundary

If revived, survivor JSON must remain authoritative, paths must be relative, LAN Clients must not receive host paths, and index discrepancies must never silently recreate or overwrite survivor files.

## Proposed: Knowledge Predecessor Links

Status: **proposed — not started**.

The full proposal is in `docs/KNOWLEDGE_PREDECESSOR_LINK_PLAN.md`.

Direction:

- Replace forward `nextKnowledgeMode` / `nextKnowledgeTemplate` ownership with an optional predecessor identity on the successor template.
- Treat an empty predecessor as a base knowledge.
- Discover upgrades by reverse lookup from the survivor's current knowledge.
- Preserve schema-6 and legacy-template compatibility without silently rewriting the external template library.
- Keep settlement discovery, Local/LAN ownership, observation gating, and save-conflict behavior intact.

Open decisions:

1. Whether one predecessor may have multiple successor branches.
2. How an intentionally final knowledge is represented.
3. Whether scratch successors remain available.
4. Whether predecessor links can cross Knowledge and Tenet Knowledge types.
5. Whether normalized name + level is sufficient or stable template IDs should be introduced.

## Renderer Maintainability

### Current Boundaries

- `rendererShowdownState.js`: Showdown constants, normalization, factories, and state-only operations.
- `rendererShowdownView.js`: Showdown card markup, DOM assignment, and page/accordion restoration.
- `rendererShowdownController.js`: delegated card interactions and mutation coordination.
- `rendererShowdownSession.js`: selection, refresh, Depart/completion lifecycle, saves, and partial-save recovery.
- `rendererKnowledgeTemplateHelpers.js`: cohesive knowledge normalization, labels, upgrade eligibility, and construction helpers.
- `rendererSettlementHelpers.js`: filtering, sorting, derived data, table rendering, timers, column visibility, and Settlement event binding.
- `renderer.js`: application state, composition, Create/Edit, modal coordination, and cross-view behavior.

### Planned Direction

- Keep the Showdown modules cohesive; do not split them by line count or move responsibilities back into `renderer.js`.
- When Settlement next receives meaningful feature work, consider splitting `rendererSettlementHelpers.js` into `rendererSettlementData.js`, `rendererSettlementView.js`, and `rendererSettlementController.js`.
- Consider extracting Create/default-template state and interaction handling when that workflow next changes materially.
- Consider separating knowledge-template modal coordination from `renderer.js` as part of the predecessor-link work if it produces a clear, testable boundary.
- Pass state, DOM nodes, APIs, and cross-view callbacks explicitly. Avoid hidden cross-module state.

## Test Expansion

Add tests with the feature or refactor that creates the risk. Current priority candidates are:

- capability resolution and enforcement across every role and runtime state retained by the selected option
- authority, save, onboarding, connection, and role/mode-transition behavior required by the selected option
- predecessor-link identity, branching, terminal/unavailable state, legacy compatibility, and Create/Showdown parity
- Settlement column visibility if the Settlement helper is split
- per-survivor bulk-update errors if detailed results are added
- real Electron end-to-end transitions only where the browser-safe smoke harness cannot cover the behavior adequately

Previously planned rename, departed Showdown, partial-save, knowledge-upgrade, view-transition, settlement sort/filter, and bulk continuation coverage has been completed.

## Conditional Improvements

### Settlement Performance

- Profile realistic survivor counts before adding virtualization or deeper caching.
- Do not resume survivor-index design until the authority model is proven and measurements or recurring integrity issues justify it.
- Keep `listPeopleSummaries` as a safe fallback.

### Markdown Library Performance

- Consider lazy preview generation or stronger folder-level cache invalidation only if large markdown libraries show measurable delay.

### Bulk Update Safety and Ergonomics

- Add per-survivor conflict/failure details if aggregate results prove insufficient.
- Consider a preview step before applying large bulk changes.

### Settlement Journal Operations

- Consider journal history inspection or compaction for long-running campaigns.
- Never clear journal history merely to dismiss a pending recovery warning.

### LAN Maintenance

- Repeat Host/Client acceptance after substantial Electron, provider, network, capability, or settlement-authority changes.
- Consider host-side client visibility only if operational experience demonstrates a need.
- Consider authentication or reference-content hosting only if scope expands beyond trusted local survivor-data sharing.

### Packaging and Distribution

- Continue monitoring x86_64 Linux installation feedback.
- Stabilize AppImage and Flatpak in independent workflows if they become supported formats.
- Consider signing/notarization per platform if distribution trust requirements increase.
- Repeat physical Fedora Asahi acceptance after substantial Electron or Electron Builder changes.

## Completed Milestones

Detailed history is retained in `docs/ai/MODEL_HANDOFF.md` and feature-specific documents. Major completed work includes:

- Local/LAN Host/LAN Client survivor-provider architecture, discovery, reconnect behavior, SSE Settlement refresh, and backup export
- optimistic survivor revisions, atomic writes, stable IDs, rename safety, and history snapshots
- settlement summary loading and debounced search
- durable settlement knowledge discovery and recovery journal
- Showdown save hardening and full Showdown module decomposition
- Create/Edit unsaved-change protection
- expanded browser-safe renderer regression coverage
- Windows, macOS, and native Linux x64/ARM64 tagged packaging
- Fedora Asahi ARM64 installed-package acceptance

## Guardrails

- Preserve existing workflows unless a product decision explicitly changes them.
- Require every new feature to declare its source of truth, supported modes, offline behavior, and capability tests.
- Do not introduce another authoritative copy of survivor state.
- Do not silently overwrite stale survivor data or replay survivor writes during recovery.
- Avoid schema resets when compatibility can be preserved safely.
- Keep performance work measurement-driven.
- Prefer cohesive module boundaries over broad rewrites or one-function files.
