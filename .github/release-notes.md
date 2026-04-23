## KDM Survivors Console 2.2.3

This patch release fixes the Settlement `Lifetime Reroll` extra filter and removes a stray macOS metadata file from tracked release output.

### Highlights
- Settlement `Lifetime Reroll` filtering now follows the survivor checkbox-backed field.
- Release output no longer tracks `release/mac-arm64/.DS_Store`.

### Detailed Release Notes
- Added `lifetimeReroll` to the settlement-safe survivor summary payload used by the Settlement table.
- Updated data-service and renderer smoke coverage so future summary extraction changes keep the filter wired correctly.
- Kept `.DS_Store` ignored and removed the previously tracked copy from release artifacts.

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
