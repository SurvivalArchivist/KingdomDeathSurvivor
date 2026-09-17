# KDM Survivors Console 3.5.2

Version 3.5.2 adds settlement-scoped survivor tags and delivers a focused usability pass across Survivors, Settlement, and Showdown.

### Survivor Tags

- Add tags directly to survivor records using existing settlement options or the inline Add New Tag flow.
- Manage the shared tag catalog from Settlement without making survivor display depend on a join.
- Filter the Survivors roster by settlement tags and optionally display a compact Tags column from Extra Filters.
- New tags discovered through Host or Client survivor saves are registered through the existing durable settlement journal.

### Showdown Usability

- Showdown survivor cards now fill the available window height while the navigation bar remains fixed.
- Vital controls are compact, centred, and grouped into clearer rows; Survival and Insanity receive restrained theme-aware emphasis.
- Weapon Proficiency is available from a shield popover instead of occupying permanent card space.
- Bleeding uses a compact theme-aware red pill, and severe-injury Apply actions visibly change to Applied after succeeding.

### Settlement And Survivors Polish

- Returning Survivors and unlocked Knowledges now live in collapsible tables.
- Survivor search and filter controls use less horizontal space, with refresh status kept on the same row.
- Tag filtering and optional column controls live under Extra Filters, with checkbox clipping corrected.

### Compatibility

- Version 3.5.2 keeps survivor schema version `6` and settlement metadata schema version `1`.
- The LAN protocol remains version `2`. Upgrade the Host and every Client together; protocol-2 builds intentionally reject older protocol-1 peers.
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
sudo dnf install ./kingdom-death-survivors-3.5.2-linux-arm64.rpm
```

Ubuntu/Debian-based systems:

```bash
sudo apt install ./kingdom-death-survivors-3.5.2-linux-x64.deb
```

Replace the architecture suffix with the one appropriate for the device.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
