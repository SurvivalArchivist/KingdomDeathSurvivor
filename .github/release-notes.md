## KDM Survivors Console 2.1.0

This release focuses on survivor data refresh behavior for shared-folder setups. Settlement now builds from batch survivor summaries instead of reloading full survivor records for the table, which reduces read churn while keeping create/edit and showdown flows on the existing full-record path.

### Highlights
- Settlement refresh now uses batch survivor summaries for the table view.
- Shared-folder sessions are more resilient when one or more survivor files are temporarily unreadable.
- Full survivor editing and showdown save flows keep the existing validation and conflict protections.

### Detailed Patch Notes
- Added a batch `listPeopleSummaries` read path for Settlement so the table can load from summary data instead of loading every survivor record individually.
- Preserved full `loadPerson` behavior for edit, save, showdown, and other survivor workflows that require full records.
- Settlement refresh now skips temporarily unreadable survivor files and reports them in the refresh result instead of failing the entire table load.
- Added tests covering the new summary path across data service, IPC, and renderer smoke flows.

### Downloads
- Windows: use the `.exe` installer asset in this release.
- macOS: use the `.dmg` asset first (recommended), or `.zip` if needed.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
