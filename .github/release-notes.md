## KDM Survivors Console 2.2.6

This patch release fixes the Windows startup regression seen in 2.2.5.

### Highlights
- Restores the Windows packaged runtime/build chain to the known-good 2.2.4 versions.
- Publishes separate Windows setup and portable artifacts so one build cannot overwrite the other.

### Detailed Release Notes
- 2.2.5 changed only the Electron/runtime dependency tree, not app renderer code.
- The Windows release output also used the same `.exe` filename for NSIS setup and portable builds, allowing the portable target to overwrite the installer.
- 2.2.6 pins Electron/electron-builder/AJV back to the 2.2.4 versions and names Windows artifacts as `setup` or `portable` explicitly.

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
