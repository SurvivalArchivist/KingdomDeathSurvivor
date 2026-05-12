# LAN Implementation Handoff

Last updated: 2026-05-12

## Purpose
This is the working progress file for the v3 LAN survivor-data effort. Use it with:
- `docs/ai/LAN_SURVIVOR_PLAN.md` for the full intended design
- `docs/ai/PROJECT_CONTEXT.md` for stable product/data rules
- `docs/ai/MODEL_HANDOFF.md` for recent repo-wide changes

## Current Phase
Phase 7 is underway: reliability, recovery, and live LAN refresh.

Completed so far:
- Added `src/survivorProvider.js`
- Routed survivor IPC handlers in `src/main.js` through `createSurvivorProvider`
- Kept renderer API unchanged (`window.api.listPeople`, `loadPerson`, `savePerson`, etc.)
- Added local provider implementation that wraps existing `dataService`
- Added settings persistence fields for future LAN work:
  - `survivorDataMode`: `local | lan-host | lan-client`
  - `lanDisplayName`
  - `lanHostAddress`
  - `lanPort`
  - `lanAutoReconnect`
  - `lanClientConnected`
  - `lanHostEnabled`
- Renderer app-settings normalization now preserves LAN fields when saving username/date format.
- Added `test/survivorProvider.test.js` and included it in `npm test`.
- Added Settings `Survivor Data` controls for `Local Files`, `LAN Host`, and `LAN Client`.
- Settings now persist LAN display name, host address, port, auto-reconnect, and host-enabled fields from the UI.
- The Survivors folder picker stays visible for `Local Files` and `LAN Host`, and hides for `LAN Client`.
- `LAN Host` survivor provider now uses local `dataService` as authoritative storage for the host machine.
- Added `src/lanSurvivorHost.js`, a main-process HTTP JSON API for host health and survivor CRUD.
- `src/main.js` starts/stops the LAN host service when saved settings are `lan-host` plus `lanHostEnabled`.
- Added `test/lanSurvivorHost.test.js` and included it in `npm test`.
- Added LAN Client survivor provider routing through the host HTTP API.
- LAN Client provider maps host conflict and validation responses back to existing `dataService` error classes.
- Survivor IPC handlers now await provider methods so async LAN client errors preserve the existing renderer payload contract.
- Renderer survivor workflow enablement now treats a configured LAN host address as valid survivor data access, even without a local Survivors folder.
- Added compact navbar status indicator for `Local`, `Hosting`, `Connected`, `Offline`, and `Error`.
- Added main/preload `getLanConnectionStatus` status path; client status checks the host `/health` endpoint with a short timeout.
- Clicking the navbar status indicator routes to Settings; connection setup actions remain in Settings.
- Renderer now refreshes LAN status after survivor list/load/save/delete operations in client mode.
- LAN Client write actions are disabled when the latest status is `Offline` or `Error`.
- Save/delete/bulk/showdown write flows guard against offline client writes and show a recovery-oriented message.
- Added explicit Settings actions for `Start Host`, `Stop Host`, `Connect`, and `Disconnect`.
- Added persisted `lanClientConnected` state so Disconnect is reversible without clearing the saved host address.
- LAN Client writes now perform a fresh status check before saving/deleting/bulk/showdown persistence.
- LAN Client provider now marks unreachable-host failures with `errorType: host-unavailable` and clearer host-address messages.
- Save-result messages now distinguish validation failure, stale revision conflict, host unavailable/disconnected, and generic LAN host server errors.
- Auto Reconnect now surfaces a `Reconnecting` navbar state and uses a shorter retry interval while client mode is offline/error.
- Showdown partial-save messaging now distinguishes stale conflicts, validation, unavailable host, and generic server errors.
- LAN Host now exposes an SSE event stream at `GET /events` and broadcasts survivor-data changes after successful save/delete operations.
- LAN Client main process subscribes to the host SSE stream, reconnects it when Auto Reconnect is enabled, and forwards survivor-data changes through preload without changing the existing renderer survivor API contract.
- Settlement automatically refreshes in LAN Client mode when the host pushes a survivor-data change event.
- Client connection status now reports `Reconnecting` when health is reachable but the live update stream is being restored.
- SSE reliability pass added stale-callback generation guards, response close handling, host keepalive comments, and cleanup after failed host starts.
- Delete failures now use the same structured survivor error payload/messaging path as saves, so LAN host-unavailable errors are surfaced clearly instead of falling through as generic IPC failures.
- Settings now shows LAN Host URLs derived from local IPv4 addresses so clients know what to enter.
- Settings includes `Export Backup` for copying the configured survivor data folder to a timestamped backup folder before real LAN sessions.
- If LAN host startup fails after saving settings, main rolls `lanHostEnabled` back to false and the renderer reverts the checkbox to the last known good state.
- Automatic LAN discovery is implemented with best-effort UDP host advertisements; LAN Client Settings can scan, select a discovered host, and fill the host address/port automatically.

Not implemented yet:
- Discovery is best-effort on local networks; manual host URL entry remains the fallback when routers/firewalls block UDP broadcast.

## Important Design Decisions
- `Local Files` remains the default provider mode.
- `LAN Host` uses the existing local survivor folder and existing `dataService` validation/conflict/history behavior.
- `LAN Client` routes survivor CRUD to `http://{lanHostAddress}:{lanPort}` and does not require a local Survivors folder.
- Markdown/reference content remains local/cloud-backed. Only survivor CRUD moves through the survivor-provider abstraction.
- The renderer should continue calling the existing `window.api` survivor methods; avoid LAN-specific renderer rewrites.
- The HTTP API is intentionally scoped to survivor CRUD and health; markdown/reference APIs remain local.
- The navbar indicator is status-only; do not add connection controls there.
- LAN Client write hardening is renderer-side UX protection; host/API errors still remain the authority.
- Existing LAN Client configs default `lanClientConnected` to true for backward-compatible behavior.
- Auto Reconnect restores status/health checks and the SSE live-update stream; it does not replay failed writes.
- SSE push updates are used only as refresh triggers. The renderer still reloads authoritative data through the existing `window.api` list/summary calls.
- Backup export is manual and local to the current machine; it copies the configured survivor folder to a user-selected destination and does not run automatically.
- LAN discovery uses UDP broadcast as a convenience layer only. It is not required for LAN Client operation and should not replace manual host entry.

## Key Files
- `src/survivorProvider.js`: provider contract, local/LAN Host provider, and LAN Client HTTP provider
- `src/lanSurvivorHost.js`: LAN Host HTTP JSON API and SSE survivor-data change stream
- `src/main.js`: survivor IPC routing through provider, LAN host lifecycle, and LAN client SSE subscription
- `src/preload.js`: exposes app settings, LAN status, survivor APIs, and LAN change notifications to renderer
- `src/dataService.js`: persisted settings normalization
- `src/renderer.js`: Settings LAN controls and persistence
- `test/survivorProvider.test.js`: provider abstraction tests
- `test/lanSurvivorHost.test.js`: host HTTP API behavior tests
- `docs/ai/LAN_SURVIVOR_PLAN.md`: full staged plan

## Next Recommended Step
Continue Phase 6 / Phase 7 reliability:
- Improve in-view recovery copy for failed reads while offline.
- Trial LAN Host / LAN Client on two physical machines and note OS firewall prompts or network broadcast behavior.

## Verification From This Slice
- `node --check src/survivorProvider.js`
- `node --check src/lanSurvivorHost.js`
- `node --check src/main.js`
- `node --check src/preload.js`
- `node --check src/dataService.js`
- `node --check src/renderer.js`
- `node --test test/lanSurvivorHost.test.js test/renderer.smoke.test.js`
- `npm test`

Run full baseline before handing off or committing:
- `node --check src/main.js src/preload.js src/dataService.js src/lanSurvivorHost.js src/survivorProvider.js src/rendererKnowledgeTemplateHelpers.js src/rendererSettlementHelpers.js src/renderer.js`
- `npm test`
