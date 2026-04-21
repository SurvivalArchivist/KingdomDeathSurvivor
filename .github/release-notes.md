## KDM Survivors Console 2.2.2

This patch release polishes the latest Showdown and packaging work: Lumi is now available directly in Showdown, light themes handle the weapon proficiency field correctly, and the packaged app icons no longer carry the baked outer shadow/fringe.

### Highlights
- Showdown now has a persistent Lumi counter beside Bleeding Tokens.
- The Showdown weapon proficiency type box is readable again in Light and Zen Day themes.
- Packaged app icons have been regenerated without the baked outer shadow/fringe.

### Detailed Release Notes
- Added Lumi to the Showdown vitals area using the existing base-stat stepper behavior, so `End Showdown` saves Lumi like Survival.
- Kept Bleeding Tokens temporary while documenting the persistence difference for future Showdown changes.
- Fixed the newer Showdown weapon proficiency input class in light theme layers so the dark base field surface no longer leaks through.
- Cleaned the runtime icon master and regenerated macOS, Windows, Linux, and iconset outputs from the shadowless master.
- Added renderer smoke coverage that increments Showdown Lumi and verifies it persists through the Showdown save path.

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
