# KDM Survivors Console 3.6.3

Version 3.6.3 focuses on safer configuration storage, bounded LAN failures, and corrected Twilight Sword progression.

### Reliability

- Configuration saves now use durable atomic replacement and retain a last-known-good backup.
- Corrupt configuration files are preserved for diagnosis, valid backups are restored automatically, and the app reports recovery instead of silently resetting settings.
- LAN Client reads now time out after 8 seconds and writes after 15 seconds, preventing unavailable Hosts from leaving workflows indefinitely busy.
- Timed-out writes are reported as uncertain outcomes so players can refresh before retrying and avoid accidental duplicate changes.

### Weapon Proficiencies

- Twilight Sword now displays its distinct rank 2, 4, and 6 abilities before rank 8 Mastery.
- Other weapon proficiencies continue to unlock Specialization at rank 3 and Mastery at rank 8.

### Compatibility

- Version 3.6.3 keeps survivor schema version `6`, settlement metadata schema version `1`, and LAN protocol version `2`.
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
