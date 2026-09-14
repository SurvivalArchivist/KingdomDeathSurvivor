# KDM Survivors Console 3.4.0

Version 3.4.0 focuses on LAN stability, synchronization, and visibility.

### LAN Reconnect and Synchronization

- Automatic reconnect now confirms the Client is registered in the Host-owned Showdown roster before reporting Connected, keeping Depart and End/Reset player counts accurate.
- Host and Client Settlement refreshes are event-driven instead of relying on periodic LAN polling.
- Reconnecting Clients compare the Host session/revision cursor, reload authoritative data after missed changes, and remain `Synchronizing` until that refresh succeeds.
- Burst notifications are coalesced, including one guaranteed follow-up refresh when a change arrives during an active reload.
- Stream registration times out cleanly, deliberate Host shutdown is reported immediately, and automatic retries use bounded jittered backoff.
- Disconnected Clients retry immediately after system resume, application activation, or window focus.

### Visibility and Showdown QoL

- Host Settings now lists LAN players with connection state, display name, app version, and last-seen time.
- Incompatible LAN protocol versions are rejected before player registration and shown clearly to Clients.
- Settings displays the running application version.
- Showdown Knowledge upgrades without a preselected next template now offer `Create New` or `Use Existing Template`.

### Compatibility

- Version 3.4.0 keeps survivor schema version `6` and settlement metadata schema version `1`.
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
sudo dnf install ./kingdom-death-survivors-3.4.0-linux-arm64.rpm
```

Ubuntu/Debian-based systems:

```bash
sudo apt install ./kingdom-death-survivors-3.4.0-linux-x64.deb
```

Replace the architecture suffix with the one appropriate for the device.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
