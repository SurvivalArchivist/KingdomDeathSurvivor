## KDM Survivors Console 1.5.1

This is a small patch release focused on polish in Showdown and light-theme form readability.

### Patch Notes
- Swapped the Showdown armor order so the flow is now `Head`, `Arms`, `Body`, `Waist`, `Legs`.
- Fixed light-mode dropdown styling issues so template and other select menus are easier to read on light backgrounds, including in the knowledge template popup on macOS.

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
