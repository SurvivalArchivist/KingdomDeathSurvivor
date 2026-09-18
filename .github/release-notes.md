# KDM Survivors Console 3.6.2

Version 3.6.2 makes weapon proficiency selection and rules available consistently without relying on private reference files.

### Weapon Proficiencies

- Choose from the 17 built-in weapon proficiency types in Technical, Create/View Survivor, and Showdown instead of entering free text.
- Open the Showdown weapon proficiency popup to read the selected weapon's Specialization and Mastery rules.
- Specialization becomes active at rank 3 and Mastery becomes active at rank 8, with locked and active states shown in the popup.

### Compatibility

- Version 3.6.2 keeps survivor schema version `6`, settlement metadata schema version `1`, and LAN protocol version `2`.
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
