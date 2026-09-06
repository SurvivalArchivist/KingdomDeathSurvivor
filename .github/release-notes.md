# KDM Survivors Console 3.3.0

Version 3.3.0 adds host-owned settlement management, reusable Vignette survivor templates, Campaign year and return tracking, and an explicit Host/Client startup choice.

### Settlement Management

- The survivor roster is now called **Survivors**, with a separate **Settlement** tab for the settlement name, type, and unlocked knowledge.
- LAN Hosts can edit settlement settings. LAN Clients can view and refresh the page while continuing to update settlement knowledge through normal survivor saves.
- Settlement Type is a permanent choice after the first save: **Campaign** keeps the normal play flow, while **Vignette** enables reusable survivor templates.
- Unlocked Knowledge and Tenet Knowledge definitions are listed alphabetically and can be expanded for details.

### Vignette Templates

- **Set Template** captures every current survivor exactly as saved.
- **Restore to Template** resets the survivor roster to that snapshot.
- Before a restore, the app copies the displaced survivor records to a timestamped folder under `settlement-backups/`.
- Template operations are available to the LAN Host only.

### Campaign Tracking

- LAN Hosts can set the current Lantern Year manually or advance it one year at a time.
- Returning survivors recorded during LAN play add a durable settlement-history entry containing their ID and name, Lantern Year, return timestamp, and alive/dead state.
- Client returns are written by the host. Development-only Local Files mode does not create settlement return-history entries.

### Startup Roles

- Production launches now require choosing **Host** or **Client** when no production role has been saved. Existing Local configurations are prompted once after upgrading.
- A Host can run the app by itself and uses its selected Survivors folder as authoritative storage.
- Local Files mode is reserved for development and is available through `npm run dev`.

### Compatibility

- Version 3.3.0 keeps survivor schema version `6` and settlement metadata schema version `1`.
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
sudo dnf install ./kingdom-death-survivors-3.3.0-linux-arm64.rpm
```

Ubuntu/Debian-based systems:

```bash
sudo apt install ./kingdom-death-survivors-3.3.0-linux-x64.deb
```

Replace the architecture suffix with the one appropriate for the device.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
