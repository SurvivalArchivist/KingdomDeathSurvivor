## KDM Survivors Console 1.5.6

This patch release tightens a couple of Showdown quality-of-life edges and fixes a survivor-loading compatibility regression.

### Patch Notes
- Fixed survivor loading for older records whose `Tenet Knowledge` / `Knowledge` entries still carried legacy metadata fields such as `familyID`.
- Added an `All +/-` armor control in Showdown so you can adjust every armor location together with one click.
- Cleaned up the bulk armor control styling so it sits more quietly in the header.
- Fixed the bulk armor buttons in light theme so they no longer keep a dark background.
- Added a `Heavy` toggle alongside Showdown `Insanity` so that state can be tracked from the main vitals card.
- Combined Showdown weapon proficiency type and rank into a tighter shared control to reduce header clutter.

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
