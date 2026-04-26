## KDM Survivors Console 2.2.4

This patch release raises the survivor Knowledge entry limit from 2 to 5.

### Highlights
- Survivors can now carry up to 5 Knowledge entries.
- Create/View Survivor, Showdown, and template insertion flows all use the same updated limit.

### Detailed Release Notes
- Updated survivor schema validation so records with up to 5 Knowledge entries save and load normally.
- Updated renderer add guards for Create Survivor, View/Edit Survivor, Showdown, and markdown/template insertion.
- Added validation coverage for accepting exactly 5 Knowledge entries and rejecting more than 5.

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
