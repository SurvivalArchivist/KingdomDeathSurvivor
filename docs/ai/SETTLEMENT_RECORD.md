# Settlement Record and Knowledge Registration

## Ownership and storage

One configured Survivors folder represents one settlement. `settlement.json` stores its stable ID, independent schema version (1), revision, timestamps, and `knowledges`. The survivor schema remains 6. No year/return-history fields or UI have been added yet.

`settlement-journal.json` stores durable pending operations and numbered audit events. Both filenames are reserved: excluded from survivor listing and rejected by survivor load/delete/expected-filename save operations. They are included in existing whole-folder backups. Back up and restore the whole folder together, not only survivor JSON files.

`settlementService.js` owns registration and journal recovery. `dataService.savePerson` prepares the journal after validation/conflict checks, commits the survivor, then registers its knowledge. Local Files and LAN Host share this path. LAN Clients use host-authoritative `GET /settlement` through the provider and IPC; they do not create a local settlement record. Use one authoritative app process per folder; independent apps or cloud-sync writers concurrently editing the same files are not coordinated by a distributed transaction/lock service.

Settlement reads initialize a missing record and index valid saved survivors. Startup/refresh summary loading invokes this path. A nonexistent Survivors folder is not created by a settlement lookup. Malformed records/journals are reported, never silently replaced. Invalid survivor files remain skipped/reported by the existing summary behavior.

## Discovery identity

Knowledge and Tenet Knowledge are one discovery pool. Identity is trimmed, lowercased name plus knowledge level, without a type discriminator. Existing survivor slot limits remain unchanged. Each unlock receives a stable UUID and stores its definition snapshot, discovery timestamp and first survivor ID. Available source `file` references are retained; survivor-specific `currentObservations` and legacy `observations` progress are excluded.

Only committed survivor data counts. Registration checks all knowledge on each successful save, adds missing definitions, and leaves existing unlocks unchanged. Blank-name entries are not discoveries. Removing knowledge, upgrading it, or deleting a survivor does not remove historical unlocks. Different levels are different discoveries. Renaming a knowledge currently creates a different discovery; explicit identity reconciliation is future work.

## Queue and audit behavior

Operations have UUIDs, a survivor ID, intended saved filename/content digest, definition snapshots, state, attempts, and any latest error. Audit events have monotonically increasing sequence numbers, operation/survivor IDs, action, outcome, timestamp and details. Initial indexing of already-saved survivors is also journaled.

1. Write a `prepared` operation before the survivor write. If the journal cannot be written, do not save the survivor.
2. Commit the survivor using existing validation/revision checks and atomic file replacement.
3. Mark the operation `committed`, then idempotently ensure each knowledge exists in the settlement.
4. Mark it `complete`; retain the operation and events as audit history rather than deleting them. Failed survivor writes are recorded as cancelled and never replayed.

If registration fails after the survivor saves, retain the pending operation and log the failure. The save response remains successful but includes `settlementWarning`, displayed to the user. Recovery runs on subsequent saves, before deletion, and on settlement reads (including startup/summary refresh/picker opening); there is no background polling timer. Fix persistent filesystem/corruption problems before expecting retries to succeed.

For interrupted `prepared` operations, recovery compares the actual survivor JSON with the intended content digest. A match proves that save reached disk; a mismatch cancels the operation rather than replaying a stale survivor write. Recovery decisions must be persisted before subsequent app writes replace that evidence. Repeating settlement registration after an interrupted completion acknowledgement cannot duplicate an unlock. This is process-interruption recovery, not a multi-file database transaction or a distributed exactly-once guarantee.

The journal currently retains all history without rotation. Never clear it to dismiss a pending warning: that discards recovery evidence. Long-running campaign audit compaction/inspection UI can be added separately.

## Picker behavior

The add/upgrade template picker fetches the authoritative settlement record on opening, then merges both local Knowledge and Tenet Knowledge template libraries. Settlement unlocks appear first, alphabetically, followed by a disabled `-----` option and remaining unique templates. The separator only appears when both groups have visible entries, including during search.

Unlocked items use the settlement definition snapshot, so missing local templates do not prevent selection. Applying a definition starts observation progress at zero. Duplicate identities are removed from the remaining templates. The Neurosis picker is unchanged. If the settlement cannot be read, show an explicit error and retain local template choices without pretending the unlock list is complete.

## Verification and release acceptance

Final `npm run verify`: **246/246 passed** (1 syntax, 159 integration, 42 main-process, 44 renderer). `git diff --check` passed.

Automated tests cover shared identity, levels, persistent history, bootstrap, metadata protection, corruption, failed saves, failed registration/retry, interrupted receipts/completion, journal write failure, host/client access, IPC, picker grouping/search/fallback, missing templates, and save warnings.

Before release, manually check with disposable Local Files and LAN Host/Client data:

- Save a knowledge and reopen both Knowledge/Tenet pickers: it appears above the separator once.
- Add without saving: it does not become unlocked. Save, then remove it and save again: the unlock remains.
- Confirm a stored unlock is selectable on a client without its original local template.
- Inspect both JSON records after a save and verify journal operations complete. Restore the previous data-source setting afterward.

Manual acceptance was subsequently confirmed by the user ("All looks good"), who authorized the combined v3.2.0 release. Per-platform/per-item results were not supplied; the checklist is retained as a repeatable test guide.
