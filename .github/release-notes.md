## KDM Survivors Console 2.0.0

This release marks a full UI-era shift for the app. The underlying workflows stay familiar, but the overall presentation is cleaner, calmer, and more deliberate across Showdown, Settlement, and the broader shell.

### Highlights
- Added two new themes, `Zen Day` and `Zen Night`, with a bamboo-and-shoji inspired palette tuned for calmer contrast and softer surfaces.
- Simplified the app’s visual structure by removing unnecessary outer shells and reducing nested container chrome across key views.
- Refined Showdown into a cleaner two-survivor workspace with clearer separation, tighter controls, and less visual clutter.
- Flattened Settlement so the table view feels more direct and less boxed-in.
- Restored stronger visual distinction inside knowledge content so important sections are easier to scan again.

### Detailed Patch Notes
- Added `Zen Day` and `Zen Night` theme support to the global theme switcher.
- Fixed Zen Day theme issues where some utility surfaces still rendered with dark inherited backgrounds.
- Moved Showdown session actions into the main navigation for a cleaner, more consistent control location.
- Tightened Showdown weapon proficiency controls to reduce wasted vertical space in the vitals area.
- Reworked Showdown survivor shells and spacing to keep the two survivors visually distinct without over-constraining the workspace.
- Removed the outer shell from Settlement while preserving the existing table, filters, and assignment workflow.
- Tuned knowledge/tinted content blocks so `Observation`, `Rules`, and related meta sections read more clearly across themes.

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
