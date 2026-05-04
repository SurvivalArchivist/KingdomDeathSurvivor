## KDM Survivors Console 2.2.9

This patch release fixes Showdown combat temporary stat modifiers.

### Highlights
- Showdown combat `Temp` modifiers can now be negative as well as positive.
- `Tokens (+)` and `Tokens (-)` still clamp at zero.
- Temporary combat modifiers and tokens remain showdown-only and are not saved to survivor files.

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
