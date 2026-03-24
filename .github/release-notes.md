## KDM Survivors Console 1.5.0

This release expands survivor tracking, improves settlement workflow, and continues the showdown readability pass with a much cleaner information layout.

### Highlights
- Added a new searchable `Notes` section for survivors across create, edit, showdown, and settlement filtering.
- Added survivor metadata tracking for `Last Updated`, `Last Returned`, and `Edited By`, with a new Settings username field used when saving.
- Added optional settlement columns for `Last Updated`, `Last Returned`, and `Stats Total`.
- Reworked settlement filters into a compact main row with a `Show Extra Filters` tray for the less-used filters and column toggles.
- Continued the showdown UX overhaul with cleaner knowledge cards, improved neurosis presentation, fuller arts/disorder text display, and more consistent light/dark theme styling.

### Survivor Data and Settings
- Added `Notes` alongside abilities and impairments.
- Added a `Username` setting that records who last saved a survivor.
- Standard saves now update `Last Updated` and `Edited By`.
- `End Showdown` now updates `Last Returned`.
- Existing survivors are backfilled with safe defaults in the current build.

### Settlement and Create View
- Added optional settlement table columns for `Last Updated`, `Last Returned`, and `Stats Total`.
- `Stats Total` is calculated from `Strength + Speed + Evasion + Luck + Accuracy`.
- Moved the less-used settlement filters and column toggles into an expandable extra-filters panel so the main page stays compact.
- Moved courage/understanding ability selectors into the create-view `Courage / Understanding` section.
- Improved the create-view `Age / Survival / Insanity` layout so it uses desktop width more effectively.

### Showdown Improvements
- Restored fullscreen support on Windows and added a top-nav fullscreen toggle for macOS, Windows, and Linux.
- Added inline `Saving...` / `Saved` / error feedback for template-save buttons.
- Merged `Armor` and `Stats` onto the same showdown page, with armor on top and stats underneath.
- Increased showdown survivor card height and improved internal spacing for a roomier layout.
- Widened ability and impairment boxes so longer entries wrap more naturally.
- Increased neurosis readability and restyled neurosis as a dedicated card that visually matches the newer showdown sections.
- Rebuilt knowledge and tenet knowledge presentation with larger titles, clearer controls, colored `Observation` and `Rules` sections, icons, and cleaner bottom metadata.
- Reworked fighting arts, secret fighting arts, and disorders to use the same card treatment as knowledge, and they now display the full linked markdown text instead of a shortened preview.
- Removed extra showdown clutter from the neurosis / tenet knowledge area so those sections read more cleanly.
- Aligned light and dark mode showdown containers and surfaces more closely so the same components feel consistent across themes.

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
