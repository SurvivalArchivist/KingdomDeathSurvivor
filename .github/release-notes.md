## KDM Survivors Console 2.2.0

This minor release focuses on safer editing and safer session completion. It reduces accidental data loss while editing survivors, smooths Settlement filtering, and hardens Showdown save completion so partial-save failures are much clearer and easier to recover from.

### Highlights
- Create, Edit, and default-template flows now warn before discarding unsaved work and show a lightweight `Unsaved changes` indicator while the form is dirty.
- Settlement name and trait search now wait briefly before rerendering, which cuts down unnecessary table churn while typing.
- `End Showdown` now reports per-survivor save outcomes and keeps the departed session recoverable if only one survivor save succeeds.

### Detailed Release Notes
- Added dirty-state protection for Create, Edit, and default-template flows, including prompts before reset, back, or page navigation that would discard form changes.
- Added a small `Unsaved changes` indicator to the create action rail so edit state is visible before leaving the page.
- Debounced Settlement name and trait search inputs so the table is no longer rebuilt on every keystroke.
- Reworked showdown completion save handling to process each survivor result explicitly instead of assuming both saves succeed together.
- Successful showdown saves are now synchronized back into in-memory showdown state so retrying after a partial failure does not immediately hit a stale-revision conflict on the survivor that already saved.
- Conflict and generic showdown save failures now produce clearer survivor-specific recovery messaging while leaving the showdown session departed and retryable.

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
