## KDM Survivors Console 1.5.5

This patch release focuses on Showdown knowledge upgrade quality-of-life so blank next-level knowledge upgrades are easier to fill out and reuse.

### Patch Notes
- Upgrading a Showdown `Knowledge` or `Tenet Knowledge` with `No Template` now opens a write-in modal instead of replacing the entry with a blank card.
- The new Showdown upgrade modal lets you fill in the upgraded knowledge immediately, including observation text, rules, requirement, level, and next-upgrade behavior.
- Added an `Also save as reusable template` option to that modal so newly written upgraded knowledge can be stored in the template library during the same save.
- Fixed the modal checkbox interaction so the new save-as-template toggle can actually be clicked reliably.

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
