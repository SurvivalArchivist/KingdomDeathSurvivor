## KDM Survivors Console 1.5.3

This patch release focuses on Showdown quality-of-life updates, more flexible bulk updates, and light-theme readability fixes.

### Patch Notes
- Added `Lifetime Reroll` to Showdown survivor cards so it can be toggled during a showdown alongside `Alive`.
- Simplified the Showdown session controls: removed the global/in-header departed pill, moved the action controls to the right, and changed the finalize action to `End Showdown`, which only appears after `Depart`.
- Bulk Updates now apply only to living survivors and support multiple stat changes in a single action, such as `+1 Strength`, `+1 Evasion`, and `-1 Luck`.
- Fixed the Showdown `Add New Disorder` filter/search field in light theme so it no longer renders as a dark unreadable control.

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
