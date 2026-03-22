## KDM Survivors Console 1.4.0

This release focuses on showdown usability, clearer information hierarchy, and a cleaner desktop app shell.

### Highlights
- Restored fullscreen support on Windows and added a top-nav fullscreen toggle for macOS, Windows, and Linux.
- Added inline `Saving...` / `Saved` / error feedback for template-save buttons.
- Reworked showdown knowledge, neurosis, and survivor card layout to be easier to scan in both light and dark themes.

### Showdown Improvements
- Merged `Armor` and `Stats` onto the same showdown page, with armor on top and stats underneath.
- Increased showdown survivor card height for a roomier desktop view.
- Widened ability and impairment boxes so long entries wrap more naturally.
- Increased showdown neurosis readability and restyled neurosis as a dedicated card with a unique skull-marked title.
- Rebuilt knowledge and tenet knowledge presentation with:
  - larger titles
  - clearer header controls
  - colored `Observation` and `Rules` sections with icons
  - smaller `Observations Required` / `Next` metadata at the bottom
  - improved padding, alignment, and spacing
- Removed extra showdown controls from the tenet knowledge/neurosis area so that section reads more cleanly.
- Smoothed out left-edge spacing and general breathing room across showdown boxes.
- Aligned light and dark mode showdown container styling more closely so the same components feel consistent across themes.

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
