# KDM Survivors Console 3.6.4

Version 3.6.4 fixes a Modern Showdown layout regression affecting two-survivor parties.

### Showdown

- Both survivor cards can now display and independently scroll Knowledge, Fighting Arts, Disorders, or AI at the same time in the Modern layout.
- Switching both cards away from Armour no longer collapses their lower content areas.
- One-page and paginated parties now allocate the correct height to the survivor-card grid.

### Compatibility

- Version 3.6.4 keeps survivor schema version `6`, settlement metadata schema version `1`, and LAN protocol version `2`.
- Upgrade the Host and every Client together. Back up the entire Survivors folder before changing versions.
- Survivor files from before the 3.0.1 campaign reset remain unsupported.

### Downloads

- Windows: use the `setup.exe` asset for installation, or `portable.exe` for the portable build.
- macOS: use the `.dmg` asset first, or `.zip` if needed.
- Fedora Linux: use the `.rpm` matching `x86_64` or `aarch64`.
- Ubuntu/Debian Linux: use the `.deb` matching `amd64` or `arm64`.
- Other Linux distributions: use the `.tar.gz` matching `x64` or `arm64`.
- Linux SHA-256 checksum files are provided separately for x64 and ARM64 assets.

### macOS First Launch

Unsigned builds may be blocked by Gatekeeper. If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
