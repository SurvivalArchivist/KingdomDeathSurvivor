## KDM Survivors Console Release

Thank you for using KDM Survivors Console.

### Downloads
- Windows: use the `.exe` installer asset in this release.
- macOS: use the `.dmg` asset first (recommended), or `.zip` if needed.
- Linux: use `.flatpak` for distro-agnostic install/update, or `.AppImage` / `.deb` / `.rpm` as needed.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.

### Linux AppImage First-Launch Note
If AppImage is downloaded without execute permission, run:

```bash
chmod +x "./KDM Survivors Console-<version>-linux-x64.AppImage"
```

Then launch the AppImage.
