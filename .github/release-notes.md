# KDM Survivors Console 3.3.1

Version 3.3.1 coordinates LAN Showdown readiness, adds Vignette Showdown reset, and shares the default survivor template through the Host.

### Shared Showdown Readiness

- Depart and End Showdown show ready/total player counts for the Host and connected clients.
- Every player must vote before the group departs or ends the Showdown. A player's cards and survivor slots lock while waiting.
- Duplicate votes do not increase counts. Disconnected participants remain required once voting starts; reconnecting does not count as approval.
- Campaign saves retain conflict detection and partial-save recovery. Successful completion is acknowledged without repeating saves after a lost response.

### Vignette Reset

- Vignette replaces End Showdown with **Reset Showdown**, which also requires every player's confirmation.
- Reset restores each player's survivors, armor, injuries, bleeding, modifiers, tokens, and other combat state to the departure snapshot.
- Survivors stay departed with locked slots. Reset can be repeated and does not save survivor files.

### Shared Default Survivor Template

- The default new-survivor template now lives at `default_survivor_template/default-new-survivor.json` inside the authoritative Survivors folder.
- Clients read and save the Host's template; Settings no longer needs a separate template Data Source.
- An existing valid template in the former configured location is copied when needed, leaving the original untouched.

### Session Notes

- LAN Showdown coordination requires a running Host. Upgrade the Host and all Clients together.
- Clients joining after departure wait for the next session. Active readiness and departure snapshots are held in memory and do not survive app or Host restarts.
- Automated verification passes all 276 tests. Live multi-device acceptance of shared readiness remains outstanding.

### Compatibility

- Version 3.3.1 keeps survivor schema version `6` and settlement metadata schema version `1`.
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
sudo dnf install ./kingdom-death-survivors-3.3.1-linux-arm64.rpm
```

Ubuntu/Debian-based systems:

```bash
sudo apt install ./kingdom-death-survivors-3.3.1-linux-x64.deb
```

Replace the architecture suffix with the one appropriate for the device.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
