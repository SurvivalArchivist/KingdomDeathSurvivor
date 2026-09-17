# LAN Implementation Handoff

Last updated: 2026-09-15

## Purpose
This is the working progress file for the v3 LAN survivor-data effort. Use it with:
- `docs/ai/LAN_SURVIVOR_PLAN.md` for the full intended design
- `docs/ai/PROJECT_CONTEXT.md` for stable product/data rules
- `docs/ai/MODEL_HANDOFF.md` for recent repo-wide changes

## Current Phase
Phases 1–7 are complete. LAN survivor data is a maintained feature. The original Host/Client implementation passed a real-world trial; shared Showdown readiness, Host-confirmed reconnect registration, and event-only LAN refresh were added afterward and need repeat multi-device acceptance.

Completed so far:
- Added `src/survivorProvider.js`
- Routed survivor IPC handlers in `src/main.js` through `createSurvivorProvider`
- Kept renderer API unchanged (`window.api.listPeople`, `loadPerson`, `savePerson`, etc.)
- Added local provider implementation that wraps existing `dataService`
- Added persisted LAN settings fields:
  - `survivorDataMode`: `local | lan-host | lan-client`
  - `lanDisplayName`
  - `lanHostAddress`
  - `lanPort`
  - `lanAutoReconnect`
  - `lanClientConnected`
  - `lanHostEnabled`
- Renderer app-settings normalization now preserves LAN fields when saving username/date format.
- Added `test/survivorProvider.test.js` and included it in `npm test`.
- Added Settings `Survivor Data` controls for development-only Local, `LAN Host`, and `LAN Client`; production startup requires Host or Client.
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
- Settlement refresh is event-driven in both LAN roles: Client writes notify the Host and connected Clients, while Host survivor and direct Settlement writes notify connected Clients. LAN interval polling is disabled; manual refresh remains available.
- Client connection status now reports `Reconnecting` when health is reachable but the live update stream is being restored.
- SSE reliability pass added stale-callback generation guards, response close handling, host keepalive comments, and cleanup after failed host starts.
- Delete failures now use the same structured survivor error payload/messaging path as saves, so LAN host-unavailable errors are surfaced clearly instead of falling through as generic IPC failures.
- Settings now shows LAN Host URLs derived from local IPv4 addresses so clients know what to enter.
- Settings includes `Export Backup` for copying the configured survivor data folder to a timestamped backup folder before real LAN sessions.
- If LAN host startup fails after saving settings, main rolls `lanHostEnabled` back to false and the renderer reverts the checkbox to the last known good state.
- Automatic LAN discovery is implemented with best-effort UDP host advertisements; LAN Client Settings can scan, select a discovered host, and fill the host address/port automatically.
- The Host owns shared Showdown readiness for Depart, Campaign End, and Vignette Reset; votes are identity-based, unanimous, idempotent, and delivered over the existing SSE channel.
- Automatic SSE reconnect now completes an explicit registration handshake containing the Client player ID and authoritative Showdown roster. Client status does not become Connected until the Host confirms that identity.
- Client stream registration now times out after eight seconds instead of remaining indefinitely in `Connecting`, and an intentional Host stop emits a final `host-shutdown` event so connected Clients transition offline promptly.
- Automatic stream retries now use bounded exponential backoff with jitter (roughly one second through 30 seconds), reset after valid Host registration or an explicit settings action so manual Connect remains immediate.
- After a known disconnect, system resume, application activation, or window focus cancels pending backoff and retries immediately. Connected and currently connecting streams are not restarted.
- A real-socket loopback lifecycle regression now stops the Host, advances its data revision while the Client is absent, restarts it, waits through automatic SSE reconnect, acknowledges the renderer reconciliation, and verifies the restored two-player Showdown barrier (`1/2` after the Host votes Depart).
- The default new-survivor template lives under the Host's authoritative Survivors folder and is loaded/saved remotely by Clients.
- Direct Settlement edits and Vignette template operations are Host-only; Client survivor saves still register settlement discoveries through the Host journal/recovery flow.
- Shared reference collections are Host-authoritative for LAN Clients. Fighting Arts, Secret Fighting Arts, Disorders, Knowledge/Tenet Knowledge templates, and Neurosis templates use Host API routes; the relevant Client-side source pickers are hidden. Picker listings refresh on every open so Host collection changes appear without reconnecting, while markdown bodies load on demand.
- Settings includes a compact compatibility table separating LAN generations from survivor-file schemas. LAN rows are 3.0.0–3.3.3 legacy/unversioned, 3.4.0–3.5.0 protocol 1, and 3.5.1+ protocol 2 until the next protocol bump; pre-v3 releases have no LAN multiplayer.

Operational boundary:
- Discovery is best-effort on local networks; manual host URL entry remains the supported fallback when routers/firewalls block UDP broadcast.
- Settlement accepts host-pushed refreshes. Create/Edit and Showdown deliberately retain in-memory state and use explicit reload/refresh actions so remote changes cannot silently discard active work.

## Important Design Decisions
- Local mode is development-only. Production startup requires a persisted LAN Host or LAN Client role.
- `LAN Host` uses the existing local survivor folder and existing `dataService` validation/conflict/history behavior.
- `LAN Client` routes survivor CRUD to `http://{lanHostAddress}:{lanPort}` and does not require a local Survivors folder.
- LAN Host and Local Development read reference content from their configured folders. LAN Clients route supported shared reference list/load/template operations through the Host and never expose or depend on Host filesystem paths.
- The renderer should continue calling the existing `window.api` survivor methods; avoid LAN-specific renderer rewrites.
- The HTTP API covers Host-authoritative survivor CRUD, Settlement/default-template operations, Showdown coordination, shared reference list/load/template operations, health, and events.
- The navbar indicator is status-only; do not add connection controls there.
- LAN Client write hardening is renderer-side UX protection; host/API errors still remain the authority.
- Existing LAN Client configs default `lanClientConnected` to true for backward-compatible behavior.
- Auto Reconnect restores status/health checks and the SSE live-update stream; it does not replay failed writes.
- SSE push updates are refresh triggers, not authoritative payload replacements. The renderer reloads authoritative data through the existing `window.api` list/summary calls.
- LAN Settlement refresh is event-only. The Host supplies a session/revision cursor; reconnecting Clients enter `Synchronizing`, request an authoritative reload when that cursor changed, and acknowledge it only after the renderer reload succeeds.
- Backup export is manual and local to the current machine; it copies the configured survivor folder to a user-selected destination and does not run automatically.
- LAN discovery uses UDP broadcast as a convenience layer only. It is not required for LAN Client operation and should not replace manual host entry.

## Key Files
- `src/survivorProvider.js`: provider contract, local/LAN Host provider, and LAN Client HTTP provider
- `src/lanSurvivorHost.js`: LAN Host HTTP JSON API and SSE survivor-data change stream
- `src/lanReconnectBackoff.js`: deterministic bounded retry-delay state used by the LAN Client stream
- `src/main.js`: survivor IPC routing through provider, LAN host lifecycle, and LAN client SSE subscription
- `src/preload.js`: exposes app settings, LAN status, survivor APIs, and LAN change notifications to renderer
- `src/dataService.js`: persisted settings normalization
- `src/renderer.js`: Settings LAN controls, persistence, status, and event-triggered Settlement refresh
- `test/survivorProvider.test.js`: provider abstraction tests
- `test/lanSurvivorHost.test.js`: host HTTP API behavior tests
- `docs/ai/LAN_SURVIVOR_PLAN.md`: full staged plan

## Next Recommended Step

Validate the completed stream recovery work before adding broader LAN features:

1. Repeat the automated lifecycle acceptance on two physical machines, including system sleep/resume and application refocus, confirming a connected stream is not duplicated.
2. Add exportable, non-sensitive LAN diagnostics and a compact pre-session readiness check if physical acceptance exposes no higher-priority issue.

Registration timeout, bounded reconnect backoff, wake/focus recovery, explicit Host-shutdown signaling, Host-side player/version/last-seen visibility, and protocol compatibility diagnostics are complete. See `docs/ai/LAN_SURVIVOR_PLAN.md` for the prioritized stability/QoL roadmap.

## Verification From This Slice

Current working-tree baseline: 292 tests passing, including explicit Host-shutdown signaling, deterministic reconnect backoff bounds/reset coverage, immediate focus/resume recovery, and full real-socket reconnect/reconciliation/Showdown lifecycle coverage.

- `node --check src/survivorProvider.js`
- `node --check src/lanSurvivorHost.js`
- `node --check src/lanReconnectBackoff.js`
- `node --check src/main.js`
- `node --check src/preload.js`
- `node --check src/dataService.js`
- `node --check src/renderer.js`
- `node --test test/lanSurvivorHost.test.js test/renderer.smoke.test.js`
- `npm test`

Run full baseline before handing off or committing:
- `node --check src/main.js src/preload.js src/dataService.js src/lanSurvivorHost.js src/survivorProvider.js src/rendererKnowledgeTemplateHelpers.js src/rendererSettlementHelpers.js src/renderer.js`
- `npm test`
