# KDM Survivors Console 3.5.0

Version 3.5.0 adds built-in severe-injury reference and tracking tools to Showdown.

### Severe Injury Tables

- Small danger controls beside Insanity and every armor location open the matching Brain Trauma or severe injury table.
- Tables are built into the application and remain available during a departed Showdown without relying on external reference files.
- Supported deterministic results offer an immediate `Apply` action for survivor stats, death, proficiency, combat tokens, bleeding, and persistent reminders.
- Results requiring dice, random choices, Fighting Arts decisions, other survivors, or unresolved board state remain manual. Where safe, a bleeding-only action remains available.

### Permanent Injury Tracking

- Permanent injuries that can be recorded once or twice are stored as count-based survivor data.
- Filled and empty pips appear beside capped injury names in the severe table and in the normal Create/View Survivor record.
- Once an injury reaches its limit, its action becomes a bleeding-token action instead of applying the permanent effect again.
- Injuries that can occur indefinitely apply their concrete effects without creating repeated injury-name entries.
- Existing survivor files are normalized automatically, and duplicate injury names from the earlier representation remain recognised for compatibility.

### Compatibility

- Version 3.5.0 keeps survivor schema version `6` and settlement metadata schema version `1`.
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
sudo dnf install ./kingdom-death-survivors-3.5.0-linux-arm64.rpm
```

Ubuntu/Debian-based systems:

```bash
sudo apt install ./kingdom-death-survivors-3.5.0-linux-x64.deb
```

Replace the architecture suffix with the one appropriate for the device.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
