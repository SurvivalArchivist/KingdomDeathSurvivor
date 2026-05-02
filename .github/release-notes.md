## KDM Survivors Console 2.2.7

This patch release corrects the Settlement `Stats Total` calculation.

### Highlights
- Stats Total now sums only Movement, Speed, Accuracy, Strength, Luck, and Evasion.
- Courage and Understanding still appear as their own Settlement columns and can still be sorted independently.

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
