## KDM Survivors Console 3.1.1

Version 3.1.1 completes the LAN survivor-data reliability roadmap and hardens Linux release filenames. It is a compatible patch release for the existing macOS, Windows, Linux x86_64, and Linux ARM64 builds.

### LAN Reliability
- LAN Client startup remains usable when the configured host is offline.
- Failed survivor reads keep the current Settlement list, editor content, or Showdown state intact and provide clear reconnect/retry guidance.
- Settlement continues to accept live host-pushed refreshes; Create/Edit and Showdown require explicit refreshes so active work cannot be replaced silently.
- Added regression coverage for offline startup, failed Settlement refreshes, failed Showdown reads, departed-session navigation, and partial bulk-update outcomes.

### Linux Highlights
- Native x64 and ARM64 builds run the full test suite and launch the real packaged Electron application before publication.
- RPM and DEB architecture metadata and the packaged executable's ELF architecture are checked automatically.
- Separate SHA-256 checksum files are included for Linux x64 and ARM64 downloads.
- The ARM64 RPM has passed installed-package acceptance on Fedora Linux Asahi Remix under KDE Wayland with a 16 KiB-page kernel.
- Linux artifact filenames are now stable and space-free so their checksum manifests match the published files.
- AppImage and Flatpak remain experimental and are not included in the core tagged release.

### Compatibility
- Version 3.1.1 keeps survivor schema version `6` from 3.0.1; there is no new data migration in this release.
- Survivor files from before the 3.0.1 campaign reset remain unsupported. Back up older data before changing folders or versions.
- Linux RPM and DEB packages are currently unsigned. Download them only from this repository's GitHub Release page and verify their checksums when possible.

### Downloads
- Windows: use the `setup.exe` asset for installation, or `portable.exe` if you specifically want the portable build.
- macOS: use the `.dmg` asset first (recommended), or `.zip` if needed.
- Fedora Linux: use the `.rpm` matching `x86_64` or `aarch64`.
- Ubuntu/Debian Linux: use the `.deb` matching `amd64` or `arm64`.
- Other Linux distributions: use the `.tar.gz` matching `x64` or `arm64`.
- Linux SHA-256 checksum files are provided separately for x64 and ARM64 assets.

### Linux Installation

Fedora/RPM-based systems:

```bash
sudo dnf install ./kingdom-death-survivors-3.1.1-linux-arm64.rpm
```

Ubuntu/Debian-based systems:

```bash
sudo apt install ./kingdom-death-survivors-3.1.1-linux-x64.deb
```

Replace the architecture suffix with the one appropriate for the device.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
