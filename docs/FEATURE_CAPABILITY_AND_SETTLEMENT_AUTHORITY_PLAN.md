# Feature Capability and Settlement Authority Options

## Status

**Modified Option B selected; startup role gate implemented.**

This document preserves both product options that were considered:

- **Option A:** retain Local Files, but gate persistent settlement features by capability.
- **Option B:** require production installations to operate as LAN Host or LAN Client.

The selected direction follows Option B for production while retaining Local Development only behind `npm run dev`. New/default and legacy Local configurations are blocked by a startup role gate until Host or Client is selected. Mandatory Host readiness and successful Client connection before all normal workflows remain possible follow-up work.

## Problem

The app currently supports Local Files, LAN Host, and LAN Client. Per-survivor JSON works reasonably well with optimistic revision checks, but persistent settlement-wide state introduces shared mutable files:

- `settlement.json`
- `settlement-journal.json`

LAN Host/Client gives these files one authoritative writer. Two parties using Local Files against the same synchronized or shared folder can both perform read-modify-write operations on the shared settlement files, allowing last-write-wins races even when they edit different survivor files.

Any future feature therefore needs an explicit answer to:

- where its source of truth lives
- which process owns writes
- which modes may read or write it
- what happens when a client is disconnected
- how the UI communicates unavailable functionality
- how data and compatibility are preserved when modes change

## Shared Direction: Capability-Based Features

Both options should introduce one central capability model rather than scattering mode checks through the renderer.

Conceptual result:

```js
{
  mode: 'lan-client',
  features: {
    survivorRead: { allowed: true, available: true, reason: '' },
    survivorWrite: { allowed: true, available: true, reason: '' },
    settlementKnowledgeRead: { allowed: true, available: true, reason: '' },
    settlementKnowledgeRegister: { allowed: true, available: true, reason: '' }
  }
}
```

Rules:

- `allowed` represents static product policy for a mode/role.
- `available` represents current runtime state, such as whether a Client is connected.
- Unavailable capabilities have deterministic reason codes and consistent user-facing messages.
- A pure central resolver owns the matrix.
- Renderer controls use capabilities for visibility, enabled state, and explanations.
- Main/provider/domain boundaries enforce the same capabilities independently of the renderer.
- LAN Host validates remote operations; UI gating alone is never authoritative.
- Capabilities describe product behavior. They are not authentication, roles, or a hostile-client security boundary.

## Shared Feature Classification

Every feature should be classified before implementation.

### Per-survivor state

Examples: Create/Edit, survivor fields, Showdown persistence, revision metadata, and survivor history.

Source of truth: one survivor JSON file owned by Local storage or LAN Host, depending on the chosen option and active role.

### Derived queries

Examples: survivor list, total survivors, alive/dead counts, sorting, and filtering.

Source of truth: authoritative survivor JSON, queried locally by the owning process or remotely through LAN Host summaries. A persistent survivor index remains deferred.

### Persistent settlement-wide state

Examples: permanent knowledge discoveries and future data that must survive removal from an individual survivor.

Source of truth: the settlement record owned by exactly one authority. Concurrent independent writers are not supported by the current persistence design.

### Coordination features

Examples: starting/stopping a Host, joining/disconnecting a Client, discovery, status, and live refresh.

Availability depends on the selected role and current connection state.

## Shared Implementation Architecture

Avoid separate business-logic implementations for each mode.

- Keep one survivor storage operation that validates and atomically writes survivor JSON.
- Keep settlement-aware save orchestration as a wrapper around that survivor operation.
- Select the wrapper at the trusted provider/application-service boundary, never through a renderer-supplied flag.
- LAN Host invokes authoritative local domain services.
- LAN Client remains a transport adapter to LAN Host.
- Preserve revision conflicts, expected-filename rename checks, history snapshots, structured errors, and Showdown partial-save recovery.

## Option A: Retain Local Files With Gated Settlement Features

### Status

**Selected for production, with a development-only Local exception.**

### Product Model

Keep all three modes:

- Local Files
- LAN Host
- LAN Client

Local Files remains a simple survivor-file workflow. Persistent settlement knowledge is unavailable there because it requires coordinated authority.

### Option A Matrix

| Feature/capability | Local Files | LAN Host | LAN Client connected | LAN Client offline/disconnected |
| --- | --- | --- | --- | --- |
| Survivor read/query | Available locally | Available from host folder | Available through Host | Temporarily unavailable; preserve current view where safe |
| Survivor create/edit/delete | Available locally | Available authoritatively | Available through Host | Unavailable; never queue/replay writes |
| Settlement survivor table and derived counts | Available from survivor files | Available from host files | Available through Host summaries | Temporarily unavailable |
| Settlement knowledge read/register | Not allowed | Available | Available through Host | Unavailable; no fallback |
| Unlock-first Knowledge/Tenet picker | Not allowed; use ordinary templates | Available | Available through Host | Unavailable with reconnect guidance |
| Local Survivors folder picker | Available | Required | Hidden/not allowed | Hidden/not allowed |
| Host controls | Not allowed | Available | Not allowed | Not allowed |
| Client connection/discovery controls | Not allowed | Not allowed | Available | Available |
| Settlement live refresh | Not available | Host publishes | Client subscribes | Reconnecting/unavailable |

### Local Files Requirements

- Survivor saves do not create or update settlement registration operations.
- Survivor saves do not mutate `settlement.json` or `settlement-journal.json`.
- Existing settlement files remain untouched and are never deleted when Local Files is active.
- Ordinary Knowledge and Tenet Knowledge templates remain usable.
- Add/upgrade flows use the ordinary local template library without unlock-first settlement grouping.
- The Settlement survivor table, alive/dead queries, filters, and bulk operations remain available.
- The UI explains that permanent settlement discoveries require LAN Host or LAN Client.
- Local Files is documented as unsuitable for simultaneous shared-folder settlement writes.

### Host/Client Requirements

- LAN Host remains the only settlement authority.
- Successful Host saves retain settlement prepare/commit/recovery behavior.
- LAN Client reads and mutates survivor/settlement state only through Host.
- Offline/disconnected Clients never fall back to local data writes.
- Client disconnect preserves the configured address.
- Settlement receives Host push refreshes; Create/Edit and Showdown retain their existing explicit-refresh safeguards.

### Existing Data and Transitions

- No campaign reset is required.
- Existing settlement files remain valid.
- Switching Local → Host with the same folder makes its settlement state available again.
- Host bootstrap may register knowledge currently present on saved survivors, as it does today.
- Knowledge added and then removed entirely while Local settlement discovery was disabled is not retroactively discoverable.
- Pending settlement operations recover under Host authority, not during ordinary Local use.

### Option A Benefits

- Preserves the familiar offline/single-user workflow.
- Limits behavioral disruption for existing Local users.
- Keeps simple survivor editing available without starting a network service.
- Establishes a capability model that can gate future shared features independently.

### Option A Costs and Risks

- Maintains three user-facing modes and a larger behavior matrix.
- Local and Host remain similar storage paths with deliberately different feature sets.
- Users may be confused when settlement knowledge disappears in Local mode but the underlying files still exist.
- Every new feature must decide whether Local can support it safely.
- More mode-specific UI testing remains necessary.

### Option A Delivery Phases

1. Finalize capability names, Local explanations, Host stopped-state behavior, and settlement read policy.
2. Implement and test the central capability resolver without behavior changes.
3. Expose capabilities through main/preload and centralize renderer gating.
4. Separate survivor-only saves from settlement-aware Host saves.
5. Gate settlement knowledge reads, registration, and unlock-first pickers in Local mode.
6. Harden Local/Host/Client transitions and pending-operation recovery.
7. Update contributor rules and canonical docs.
8. Run automated and manual Local/Host/Client acceptance.

## Option B: Main App Becomes Host/Client Only

### Status

**Candidate direction — not selected.**

### Product Model

Remove Local Files from the main app. Every installation must choose one role:

- **Host / Store data on this computer**
- **Client / Join another Host**

Host becomes both the coordinated authority and the normal solo-user path. A Host does not require a Client to use the app.

The current Local Files product can fork from a defined release/commit into a separately maintained app if continued demand justifies it. The main app should not retain hidden Local compatibility branches after the transition merely to simulate that fork.

### Option B Matrix

| Feature/capability | Host ready | Client connected | Client not connected/offline |
| --- | --- | --- | --- |
| Enter main application | Yes | Yes | No; remain in connection gate |
| Survivor read/query/write | Available authoritatively | Available through Host | Unavailable |
| Settlement table and derived counts | Available | Available through Host | Unavailable |
| Settlement knowledge read/register | Available | Available through Host | Unavailable |
| Unlock-first Knowledge/Tenet picker | Available | Available through Host | Unavailable |
| Survivors folder picker | Required during Host setup | Never shown | Never shown |
| Host controls/status | Available | Not allowed | Not allowed |
| Client connection/discovery | Not allowed | Available | Required in setup gate |
| Live refresh | Host publishes | Client subscribes | Reconnecting/unavailable |

### First-Run Role Gate

The normal navigation and survivor workflows do not load until setup succeeds.

Initial screen:

- `Host — Store survivor and settlement data on this computer`
- `Client — Join a Host that stores the data`

Host setup requirements:

1. Select an existing Survivors folder; never create one automatically.
2. Configure display name/port as needed.
3. Validate the folder and current schemas.
4. Start the Host service successfully.
5. Only then initialize the rest of the application.

Client setup requirements:

1. Discover a Host or enter its address manually.
2. Join through a versioned compatibility handshake, not only a generic health check.
3. Verify app protocol, survivor schema, settlement schema, and required Host capabilities.
4. Persist the selected address and connection intent.
5. Only after a successful join initialize the rest of the application.

If either setup fails, remain in the role/setup gate with recovery instructions. Settings required to fix the connection remain accessible there; normal app navigation does not.

### Subsequent Startup

- A saved Host role attempts to validate storage and start the Host service before loading the app.
- A saved Client role attempts to rejoin the configured Host before loading the app.
- Failed Host startup returns to Host setup/recovery.
- Failed Client connection returns to Client connection/recovery.
- A Client never loads survivor workflows from stale local files.

### Runtime Disconnection

Do not discard an already loaded Create/Edit or Showdown session if a Client connection drops.

- Freeze authoritative reads/writes that require Host.
- Preserve in-memory work.
- Show a blocking reconnect state or overlay appropriate to the active workflow.
- Resume only after revalidating the Host session/capabilities.
- Never replay writes automatically.
- On a fresh app launch, require connection before loading normal workflows.

### Changing Role

- Provide an explicit `Change Role` action in Settings/setup infrastructure.
- Warn that changing from Host to Client does not upload or transfer the Host's local folder.
- Preserve configured addresses/folder selections unless the user explicitly clears them.
- Stop/disconnect the current role cleanly before entering the setup gate.
- Consider requiring an app restart if that materially simplifies teardown correctness.

### Existing Local User Transition

- Treat existing `survivorDataMode: local` configuration as incomplete setup after upgrade.
- Offer Host as the natural continuation and prefill the previously selected Survivors folder where safe.
- Do not move, rename, delete, or rewrite survivor/settlement files during onboarding.
- A user choosing Client must connect to a Host; existing local files are not silently uploaded.
- Pending settlement operations are recovered only after the folder is opened successfully as Host.
- Keep a clear backup/campaign warning throughout the breaking transition.

### Local App Fork Requirements

Before removing Local Files from mainline:

- Choose and record the exact fork point, preferably a known-good tagged release.
- Decide whether the fork is a branch, separate repository, or separately packaged product.
- Give the fork a distinct product/application identity if both apps may coexist.
- Decide who maintains dependency/security updates for the fork.
- State clearly whether new Host/Client features will be backported; default should be no automatic parity promise.
- Do not share mutable configuration directories if both apps can be installed together.

Creating the fork is a separate authorized operation and is not performed by this plan.

### Option B Benefits

- One authoritative data topology for all supported users.
- Persistent settlement features work consistently everywhere after setup.
- No Local-versus-network feature ambiguity in the main application.
- Smaller long-term product matrix: authority or remote client.
- Solo use still works by choosing Host.
- Future settlement-wide features have a clear owner from the outset.

### Option B Costs and Risks

- Breaking onboarding change for every Local user.
- The app cannot be used as a Client without a reachable Host.
- Host startup/network configuration becomes mandatory even for solo play.
- Firewalls, port conflicts, discovery failures, and service startup become first-run blockers.
- The current offline-client startup behavior would intentionally change.
- Maintaining a separate Local app creates release, branding, security-update, and support overhead.
- This likely warrants a major application release even if survivor schema remains unchanged.

### Option B Delivery Phases

1. Confirm role terminology, Host-without-clients behavior, runtime disconnect UX, role switching, and fork strategy.
2. Define the Host/Client capability resolver and versioned join handshake.
3. Build the first-run/subsequent-startup role gate without removing Local yet.
4. Make Host readiness and Client join mandatory before normal initialization.
5. Migrate existing Local configuration into the role gate with Host folder prefill.
6. Remove Local Files UI/provider paths and obsolete mode branches from mainline.
7. Create the Local product fork only after separate explicit authorization.
8. Update canonical docs, contributor rules, setup guidance, and release warnings.
9. Run automated and manual Host/Client, upgrade, connection-loss, and cross-platform acceptance.

## Comparison

| Consideration | Option A: gated Local | Option B: Host/Client only |
| --- | --- | --- |
| Existing-user disruption | Lower | High |
| First-run complexity | Low for Local; existing LAN setup retained | Higher; role setup always required |
| Long-term mode matrix | Three modes | Two roles plus connection state |
| Solo/offline operation | Direct Local Files | Host must initialize successfully |
| Persistent settlement authority | Host only; feature absent in Local | Host only; all normal sessions have authority |
| Client without Host | Existing shell can load with offline guidance | Normal app is gated until connection |
| Network/firewall dependency | Only LAN users | Every main-app user must be a Host or Client |
| Mainline code simplification | Moderate | Greater after Local removal |
| Separate product maintenance | None | Required if Local fork is maintained |
| Release compatibility | Can be incremental | Likely a breaking major release |

## Decision Criteria

Choose Option A if:

- frictionless offline/single-user startup remains important
- Local users should retain survivor workflows without running a Host
- maintaining a three-mode capability matrix is acceptable
- settlement knowledge being unavailable locally is understandable product behavior

Choose Option B if:

- one authoritative topology is more important than first-run simplicity
- mandatory Host setup is acceptable even for solo use
- Client use should be impossible without an active Host
- the project is willing to carry a separate Local product or formally freeze it
- a breaking major release and migration/onboarding effort are acceptable

Before choosing, validate both options against the actual primary use cases: solo offline play, one-table LAN play, and two remote parties using synchronized folders.

## Feature Delivery Contract

Whichever option is selected, every feature must document:

1. Feature ID and user-visible purpose.
2. State class: per-survivor, derived, persistent settlement-wide, or coordination-only.
3. Source of truth and owning process.
4. Allowed modes/roles.
5. Dynamic offline/disconnected behavior.
6. Required read/write capabilities.
7. UI treatment when unavailable: shown, disabled with explanation, or hidden.
8. Provider/IPC/LAN API requirements.
9. Compatibility and migration behavior.
10. Automated matrix tests and manual acceptance.

Add this contract to `AGENTS.md` and contributor guidance only after the option and capability vocabulary are confirmed.

## Shared Automated Acceptance

At minimum:

1. Capability resolution is deterministic for every supported role and connection state.
2. Renderer controls and provider/main enforcement agree.
3. Direct IPC/API calls cannot bypass unavailable UI controls.
4. Host is the only process that mutates persistent settlement state.
5. Client never falls back to local writes.
6. Survivor revision/conflict/history/rename behavior remains intact.
7. Settlement prepare/commit/recovery behavior remains durable under Host authority.
8. Existing survivor and settlement files are never deleted by mode/role transitions.
9. Unlock-first picker behavior remains consistent between Host and connected Client.
10. Knowledge and Tenet Knowledge retain shared discovery identity and separate slot limits.

Option-specific tests must cover the complete matrix described under the selected option.

## Shared Manual Acceptance

- Use disposable current-schema data.
- Exercise survivor creation, edit, rename, delete, Settlement, bulk updates, and Showdown under every supported role.
- Verify settlement discovery, stored-definition fallback, pending warnings, and recovery under Host authority.
- Verify connected Client parity and connection-loss behavior.
- Verify no role transition deletes or silently moves data.
- Repeat Windows/macOS and real Host/Client checks in proportion to the startup/provider changes.
- If Option A is selected, verify Local survivor workflows and confirm settlement files remain untouched.
- If Option B is selected, verify first-run gates, upgrade from Local configuration, startup failures, role switching, and the inability to enter the main app as an unconnected Client.

## Deferred Regardless of Option

- Survivor index/materialized survivor summaries. Continue querying authoritative survivor JSON until measured need justifies an index.
- Conflict-resistant concurrent Local settlement writes. Option A avoids them by gating persistent settlement state; Option B removes Local from mainline.
- Authentication and authorization for untrusted networks.
- Knowledge predecessor implementation until the capability/authority decision is complete.
- AppImage/Flatpak stabilization and unrelated renderer decomposition.

## Open Decision

Select one direction before implementation:

- **Option A:** retain Local Files and gate persistent settlement features.
- **Option B:** make the main app Host/Client-only and preserve Local as a separately scoped product/fork.
