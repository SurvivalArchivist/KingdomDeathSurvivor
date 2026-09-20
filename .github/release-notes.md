# KDM Survivors Console 3.6.5

Version 3.6.5 adds permanent severe-injury management to Create/View Survivor and dates Campaign injury reminders from the settlement Lantern Year.

### Severe Injuries

- Create/View Survivor now has an Add picker for every built-in permanent severe injury.
- Adding an injury records one occurrence and applies its deterministic persistent stat or restriction effects without adding Showdown-only bleeding or temporary effects.
- Canonically capped injuries display their existing pips and become unavailable at the limit; unlimited injuries remain repeatable.
- Campaign reminders now include their relevant Lantern Year. An injury suffered in LY 5 that skips the next hunt records LY 6, while a retirement triggered in LY 10 records LY 10.
- Healing removes dated retirement reminders as well as reminder text created by earlier versions.

### Compatibility

- Version 3.6.5 keeps survivor schema version `6`, settlement metadata schema version `1`, and LAN protocol version `2`.
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
