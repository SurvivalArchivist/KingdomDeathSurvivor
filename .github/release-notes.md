# KDM Survivors Console 3.5.1

Version 3.5.1 improves permanent-injury management and makes the LAN Host authoritative for shared reference libraries.

### Permanent Injury Tracking And Healing

- Every severe injury described as permanent is now recorded with its exact occurrence count.
- Injuries limited to one or two occurrences retain their filled/empty pip display. Unlimited injuries display `×N`.
- Create/View Survivor records provide a `Heal` action for each permanent injury. Healing removes one occurrence and reverses its deterministic permanent stat or restriction effect.
- Healing does not remove bleeding tokens, temporary combat effects, random outcomes, or other consequences unrelated to the permanent wound.
- Permanent results with manual or random consequences use a separate `Record` action for the deterministic permanent portion; their remaining instructions stay manual.
- Existing legacy capped injury entries are migrated when they are applied or healed.

### Host-Authoritative Reference Libraries

- LAN Clients now use the Host's Fighting Arts, Secret Fighting Arts, Disorders, Knowledges, Tenet Knowledges, and Neuroses.
- Client reference-folder controls are hidden because the Host is the sole authority during LAN play.
- Reference pickers fetch current Host listings whenever opened, so newly added Host files appear without reconnecting.
- Markdown bodies load from the Host on demand, and Host filesystem paths are never exposed to Clients.

### Compatibility

- Version 3.5.1 keeps survivor schema version `6` and settlement metadata schema version `1`.
- The LAN protocol is now version `2`. Upgrade the Host and every Client together; 3.5.1 intentionally rejects older protocol-1 peers.
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
sudo dnf install ./kingdom-death-survivors-3.5.1-linux-arm64.rpm
```

Ubuntu/Debian-based systems:

```bash
sudo apt install ./kingdom-death-survivors-3.5.1-linux-x64.deb
```

Replace the architecture suffix with the one appropriate for the device.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
