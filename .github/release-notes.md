## KDM Survivors Console 2.2.8

This patch release adds Lumi to Settlement Bulk Updates.

### Highlights
- Bulk Updates can now apply Lumi changes to all living survivors.
- Lumi bulk updates clamp at zero, matching the existing nonnegative stat behavior.
- Dead survivors are still skipped by the bulk update flow.

### Downloads
- Windows: use the `setup.exe` asset for installation, or `portable.exe` if you specifically want the portable build.
- macOS: use the `.dmg` asset first (recommended), or `.zip` if needed.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
