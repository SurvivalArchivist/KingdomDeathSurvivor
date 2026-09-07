# KDM Survivors Console 3.3.3

Version 3.3.3 compacts the navigation and simplifies theme controls.

### Navigation and Themes

- The small app icon replaces the title, and a clean Settings gear replaces the text button.
- Select Classic or Zen in Settings. The header sun/moon button switches between that theme's light and dark versions.
- The icon reflects the current mode: sun for light, moon for dark. Existing theme preferences are preserved.
- Navbar controls remain stationary on hover, fixing clipped top edges.

Includes the 3.3.2 fixes for independent new-survivor identities and blank default-template names.

### Compatibility

- Version 3.3.3 keeps survivor schema version `6` and settlement metadata schema version `1`.
- Existing schema-1 settlement records remain supported; new fields are optional and normalized when loaded.
- Upgrade the LAN host and clients together. Back up the entire Survivors folder, including `settlement.json`, `settlement-journal.json`, and any `settlement-backups/`, before changing versions.
- Survivor files from before the 3.0.1 campaign reset remain unsupported.
- Linux RPM and DEB packages are currently unsigned. Download them from this repository's GitHub Release page and verify their checksums when possible.

### Downloads

- Windows: use the `setup.exe` asset for installation, or `portable.exe` for the portable build.
- macOS: use the `.dmg` asset first, or `.zip` if needed.
- Fedora Linux: use the `.rpm` matching `x86_64` or `aarch64`.
- Ubuntu/Debian Linux: use the `.deb` matching `amd64` or `arm64`.
- Other Linux distributions: use the `.tar.gz` matching `x64` or `arm64`.
- Linux SHA-256 checksum files are provided separately for x64 and ARM64 assets.

### Linux Installation

Fedora/RPM-based systems:

```bash
sudo dnf install ./kingdom-death-survivors-3.3.3-linux-arm64.rpm
```

Ubuntu/Debian-based systems:

```bash
sudo apt install ./kingdom-death-survivors-3.3.3-linux-x64.deb
```

Replace the architecture suffix with the one appropriate for the device.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
