## KDM Survivors Console 2.1.1

This patch release fixes a Settlement `Ponder` regression introduced in `2.1.0`. Survivors who already showed `Ready to Ponder` in the survivor edit view will now be reported the same way in the Settlement table summary.

### Highlights
- Settlement `Ponder` status now matches the survivor edit/detail view again.
- Survivors meeting `nextPhilosophyAgeThreshold` no longer disappear from the table’s ready state because of summary-path drift.
- Added regression coverage so the batch summary view stays aligned with the full survivor view.

### Detailed Patch Notes
- Fixed Settlement batch-summary `canPonder` logic so it now follows the same age-threshold rule used in survivor edit/detail views.
- Removed the unintended requirement for non-empty philosophy text from the table-summary ready-state calculation.
- Added an integration regression test covering threshold-ready survivors with blank philosophy fields.

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
