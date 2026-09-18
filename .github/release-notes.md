# KDM Survivors Console 3.6.0

Version 3.6.0 expands Showdown parties, adds live shared combat visibility, and introduces independently selectable layout and colour systems.

### Expanded Showdown Parties

- Take one to six survivors into a Showdown instead of requiring exactly two.
- Positions appear progressively as the party grows and collapse cleanly when later positions are removed.
- Reassign an occupied position to swap its survivor with the previous occupant.
- Parties display across two-card pages, with a centred final card for odd-sized groups.

### Live Shared Combat Roster

- Open the armour button beside Depart to see every departed survivor across the LAN session.
- View live Survival, Insanity, armour values, and Light/Heavy injury state for each survivor.
- Pop the roster into its own auto-updating window for persistent visibility during play.

### Themes And Layout

- Choose colour and layout independently in Settings.
- The new Modern layout provides compact, full-height Showdown cards, cleaned raster icons, a scrolling lower content region, and denser survivor controls.
- The new Despair colour family offers light and dark variants built from monochromatic clamshell, ash, and slate surfaces, with restrained warning and danger accents.
- Existing Standard layouts and Classic/Zen colour families remain available.

### Compatibility

- Version 3.6.0 keeps survivor schema version `6` and settlement metadata schema version `1`.
- The LAN protocol remains version `2`. Upgrade the Host and every Client together; protocol-2 builds intentionally reject older protocol-1 peers.
- Existing schema-1 settlement records remain supported; new fields are optional and normalized when loaded.
- Back up the entire Survivors folder, including `settlement.json`, `settlement-journal.json`, and any `settlement-backups/`, before changing versions.
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
sudo dnf install ./kingdom-death-survivors-3.6.0-linux-arm64.rpm
```

Ubuntu/Debian-based systems:

```bash
sudo apt install ./kingdom-death-survivors-3.6.0-linux-x64.deb
```

Replace the architecture suffix with the one appropriate for the device.

### macOS First-Launch Note

Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
