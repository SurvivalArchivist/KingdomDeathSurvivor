## KDM Survivors Console 3.1.0

Version 3.1.0 adds first-class Linux x86_64 and ARM64 releases. The core Linux formats are RPM, DEB, and `tar.gz`, built and tested natively on both architectures alongside the existing macOS and Windows releases.

### Linux Highlights
- Native x64 and ARM64 builds run the full test suite and launch the real packaged Electron application before publication.
- RPM and DEB architecture metadata and the packaged executable's ELF architecture are checked automatically.
- Separate SHA-256 checksum files are included for Linux x64 and ARM64 downloads.
- The ARM64 RPM has passed installed-package acceptance on Fedora Linux Asahi Remix under KDE Wayland with a 16 KiB-page kernel.
- AppImage and Flatpak remain experimental and are not included in the core tagged release.

### Compatibility
- Version 3.1.0 keeps survivor schema version `6` from 3.0.1; there is no new data migration in this release.
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
sudo dnf install ./KDM.Survivors.Console-3.1.0-linux-aarch64.rpm
```

Ubuntu/Debian-based systems:

```bash
sudo apt install ./KDM.Survivors.Console-3.1.0-linux-amd64.deb
```

Replace the architecture suffix with the one appropriate for the device.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
