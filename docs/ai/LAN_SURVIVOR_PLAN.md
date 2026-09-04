# LAN Survivor Plan

Last updated: 2026-09-04

## Purpose
This document records the completed plan for moving survivor data from the local/cloud-shared file model to a LAN-based host/client model, while leaving markdown/reference content on the existing local/cloud-backed approach.

The goal is to reduce the collaboration issues caused by cloud-sync timing, stale local copies, and partial file visibility, without breaking single-user local workflows.

## Product Goal
Support three survivor data modes controlled from `Settings`:
- `Local Files`
- `LAN Host`
- `LAN Client`

Survivor data becomes host-authoritative in LAN modes.

Reference content remains unchanged in phase 1:
- Fighting Arts
- Secret Fighting Arts
- Knowledges
- Tenet Knowledges
- Neuroses
- Disorders
- Other markdown-backed libraries

## UX Direction

### Settings As Control Surface
All LAN setup and connection actions should live in `Settings`.

Add a new `Survivor Data` section in Settings with:
- mode selector
- host/client configuration inputs
- start/stop or connect/disconnect actions
- read-only status text

Do not move connection controls into the top nav.

### Navbar As Status Only
Add one compact LAN status indicator to the top nav.

Examples:
- `Local`
- `Hosting`
- `Connected`
- `Connecting`
- `Offline`
- `Error`

Rules:
- keep it small and single-line
- no extra nav row
- no oversized pills or feature-box styling
- clicking it can route to `Settings`

## Core Architecture Principle
Survivor reads and writes should go through one survivor-provider layer.

In `Local Files` mode:
- the provider uses existing local `dataService`

In `LAN Host` mode:
- the host machine uses local `dataService` as persistence
- remote clients access survivors through a LAN API

In `LAN Client` mode:
- survivor calls route to the LAN host
- clients do not read or write survivor JSON files directly

This allows the renderer to keep calling the same `window.api` survivor methods regardless of mode.

## Scope For Phase 1
LAN-host only for survivor records.

Included:
- list survivors
- settlement summaries
- load survivor
- save survivor
- delete survivor
- showdown and create/edit flows over LAN

Not included in phase 1:
- automatic LAN discovery
- internet/WAN support
- user accounts/authentication
- markdown/reference hosting over LAN
- peer-to-peer sync
- multi-host merge logic

## Proposed Modes

### Local Files
Use the current local file workflow.

Behavior:
- user selects a local survivors folder
- app reads/writes survivors locally
- no network dependency

### LAN Host
This machine becomes the authoritative survivor host.

Behavior:
- host uses a local survivors folder as backing storage
- host exposes survivor CRUD endpoints on the LAN
- host remains the only writer to its survivor files
- local user on host machine also works against the same host-owned survivor data

### LAN Client
This machine connects to a LAN host.

Behavior:
- clients load settlement data from the host
- clients load/save/delete survivors through the host
- local survivor folder is not used for survivor CRUD in client mode

## Recommended Delivery Phases

## Phase 1: Survivor Provider Abstraction
Status: implemented for Local Files, LAN Host, and LAN Client.

Current implementation notes:
- `src/survivorProvider.js` now exists with a local provider wrapping existing `dataService`.
- Survivor IPC handlers in `src/main.js` route through the provider.
- `local` and `lan-host` use local `dataService`; `lan-client` routes survivor CRUD through the host HTTP API.
- Ongoing implementation progress is tracked in `docs/ai/LAN_IMPLEMENTATION_HANDOFF.md`.

Create a survivor provider layer so renderer code is not tightly coupled to local file access.

Provider contract should cover:
- `listPeople`
- `listPeopleSummaries`
- `loadPerson`
- `savePerson`
- `deletePerson`

Initial implementation:
- local provider wraps existing `dataService`

Why first:
- keeps renderer stable
- makes LAN support a backend swap rather than a renderer rewrite

Likely touchpoints:
- `src/main.js`
- `src/preload.js`
- `src/dataService.js`
- `src/renderer.js`

## Phase 2: Settings Model And Persistence
Status: complete. Persisted mode-specific controls and explicit Start/Stop/Connect/Disconnect actions are implemented.

Extend app settings/config to store survivor mode and LAN state.

Suggested settings fields:
- `survivorDataMode`: `local | lan-host | lan-client`
- `lanDisplayName`
- `lanHostAddress`
- `lanPort`
- `lanAutoReconnect`
- `lanClientConnected`
- `lanHostEnabled`

UX requirements:
- survivor mode selector in Settings
- mode-specific controls shown conditionally
- current survivor folder picker shown only in `Local Files` and likely `LAN Host`

## Phase 3: Host API In Main Process
Status: complete. The HTTP JSON host service provides health, survivor CRUD, summaries, and the SSE change stream.

Build a host service in the Electron main process.

Recommended MVP transport:
- local HTTP JSON API

Why:
- simple to debug
- easier first step than full push-based networking

Suggested endpoints:
- `GET /health`
- `GET /survivors`
- `GET /survivors/summaries`
- `GET /survivors/:fileName`
- `POST /survivors`
- `PUT /survivors/:fileName`
- `DELETE /survivors/:fileName`

Important rules:
- host persists to its local survivor folder only
- host reuses current validation/conflict logic
- host remains the single authority for writes

## Phase 4: Client Routing
Status: implemented for survivor CRUD over the host HTTP API.

Build LAN client support in main/preload.

Behavior:
- renderer continues using the same survivor API surface
- main/preload route survivor requests to the host in client mode
- error payloads should remain compatible with existing UI flows where possible

Expected renderer impact:
- minimal if provider/routing layer is done first

## Phase 5: Navbar Connection Indicator
Status: implemented for compact status display and Settings navigation.

Add a compact nav status element that reflects survivor data mode and connection state.

Suggested states:
- `Local`
- `Hosting`
- `Connecting`
- `Connected`
- `Reconnecting`
- `Offline`
- `Error`

Interaction:
- clicking indicator opens `Settings`

Placement:
- right side of the current nav, near `Full Screen` and `Theme`

## Phase 6: LAN Refresh Behavior
Status: implemented for operation/status refreshes and host-pushed Settlement refresh. The host exposes an SSE stream, the client main process subscribes/reconnects, and Settlement refreshes automatically when host survivor data changes.

Polling remains a fallback and explicit/manual refresh remains available.

Behavior:
- Settlement can continue using explicit/manual refresh and timed polling
- client periodically refreshes status from host
- host pushes survivor-data change events over Server-Sent Events
- LAN Client refreshes Settlement automatically when host data changes

Closeout decisions:
- Push refresh intentionally targets Settlement, where replacing the visible list is safe and useful.
- Create/Edit and Showdown retain their in-memory state instead of accepting automatic push replacements that could discard active work; their existing explicit load/refresh actions remain authoritative.
- Failed LAN reads preserve the current view/list and show consistent reconnect/retry guidance. Offline startup remains usable even when remote survivor data cannot be loaded.

## Phase 7: Reliability And Recovery
Status: complete. Host-unavailable recovery, reconnecting status, disconnected write protection, differentiated operation messages, non-fatal offline startup/read failures, host lifecycle controls, discovery, and backup export are implemented and covered by automated tests. A real LAN Host/Client trial passed with no blocking issue.

Harden the LAN experience for real sessions.

Add:
- clear host unavailable errors
- reconnect handling
- disabled save actions while disconnected
- status messages that distinguish:
- cannot reach host
- validation failure
- stale revision conflict
- generic server error
- host start/stop confirmation
- optional host backup/export workflow later

Implemented operational additions:
- manual `Export Backup` action in Settings copies the configured survivor folder to a timestamped destination
- LAN Host mode displays local `http://address:port` URLs clients can enter
- LAN Client mode can scan and select discovered LAN hosts advertised by host machines
- failed host startup rolls `lanHostEnabled` back to false so Settings does not imply a host is running

## Settings UX Plan

### Survivor Data Section
Add a dedicated section in `Settings` above or near data sources.

Contents:
- mode selector
- mode-specific controls
- current mode summary text
- current connection status text

### Local Files View
Show:
- survivors folder picker

Hide:
- host/client network controls

### LAN Host View
Show:
- local survivor folder picker
- host port
- start hosting / stop hosting
- local LAN address display
- current hosting status
- manual backup/export action

Possible later addition:
- connected client count

### LAN Client View
Show:
- host address input
- port input
- discovered host selector
- connect / disconnect button
- connection status

## Navbar Indicator Plan
Add one compact indicator only.

Visual behavior:
- text plus subtle dot or state accent
- no large card styling
- no second row in nav

Click behavior:
- open `Settings`

Messaging examples:
- `Local`
- `Hosting`
- `Connected`
- `Offline`

## Data Ownership Rules

### In Local Mode
- survivors are local
- markdown/reference content is local/cloud
- settings are local per machine

### In LAN Host Mode
- survivors are host-owned and persisted on host machine
- host local user and LAN clients use the same host-owned survivor source
- markdown/reference content remains local/cloud for now
- settings remain local to each machine

### In LAN Client Mode
- survivors come only from the host
- client does not directly edit local survivor files
- markdown/reference content remains local/cloud for now

## Expected Benefits
This model should eliminate many of the current shared-cloud survivor problems:
- stale local survivor copies
- cloud-sync lag for survivor collaboration
- partial survivor file visibility across machines
- survivor read timeouts caused by cloud-drive behavior
- awkward multi-user survivor save conflicts caused by delayed sync

It also creates a path for future collaboration features:
- live settlement updates
- presence/status
- edit locks or activity hints
- client notifications when host data changes

## Tradeoffs
This replaces sync-related problems with networking/service complexity.

New concerns:
- host availability
- reconnect behavior
- firewall/network permissions
- clearer mode messaging
- host backup and recovery

This is still a better fit if shared multi-user survivor editing is a core workflow.

## Recommended First MVP
The first meaningful milestone should be:
- working `Local Files`, `LAN Host`, `LAN Client` modes in Settings
- manual host address entry
- survivor CRUD routed correctly by mode
- settlement summaries loaded from host in client mode
- compact nav connection indicator
- single-user mode preserved unchanged

## Definition Of Done For V1
- one machine can host survivor data from its local folder
- another machine can connect by host address and port from `Settings`
- settlement, create/edit, showdown, and bulk updates use host-owned survivor data in client mode
- save conflicts remain safe
- header shows clear connection status in one compact indicator
- local single-user mode still works as before

## Suggested Future Follow-ups
- host-side session/client list
- optional reference-content hosting or caching strategy
- authentication only if the feature scope expands beyond trusted local networks
