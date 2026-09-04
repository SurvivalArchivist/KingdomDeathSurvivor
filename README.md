# KDM Survivors Console

Desktop companion app for Kingdom Death survivor management.

> [!CAUTION]
> **Version 3.0.1 is a breaking campaign-reset release.** It will not load survivor files created by earlier versions. Back up any data you need, use a new survivor folder, and reselect every Data Source in Settings after updating.

## What This Is
KDM Survivors Console helps you manage survivor records across the full play loop:
- Create and edit survivors with a structured UI
- Manage settlement roster and showdown slot assignment
- Run active showdown sessions with temporary combat state
- Persist survivor data as JSON files in your own local folders
- Reuse knowledge and neurosis templates

## How It Works
- Built as an Electron desktop app
- Stores survivor records as local JSON files (you choose the folders)
- Supports markdown-backed content references (fighting arts, disorders, etc.)
- Provides dedicated views for technical editing, settlement management, create/edit survivor, and showdown

## Download The Latest Release
- Latest release page (automated Windows + macOS artifacts):
- https://github.com/SurvivalArchivist/KingdomDeathSurvivor/releases/latest

From that page, download:
- **Windows**: `.exe` artifact(s)
- **macOS**: `.dmg` or `.zip` artifact(s)

Flatpak note:
- Linux packaging remains supported, but is currently produced via manual workflows (`Linux Package` / `Linux Flatpak Debug`) while Linux release packaging is stabilized.

## Notes
- Unsigned builds may show SmartScreen/Gatekeeper warnings.
- For safest updates, always use files from the latest GitHub Release page above.
- Linux AppImage note: mark executable before first launch:
```bash
chmod +x "KDM Survivors Console-<version>-linux-x64.AppImage"
```
- If macOS says the app is damaged, clear quarantine and relaunch:
```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

## Development
### Install
```bash
npm ci
```

### Run
```bash
npm start
```

### Verify
```bash
npm run verify
```

### Local Packaging

Fedora packaging hosts need the native Node runtime plus the compatibility and RPM build tools used by Electron Builder's DEB/RPM helper:

```bash
sudo dnf install nodejs24 libxcrypt-compat rpm-build
```

```bash
npm run package:mac
npm run package:win
npm run package:linux
npm run package:linux:release
npm run package:linux:x64
npm run package:linux:arm64
```

The architecture-specific Linux commands build the core `tar.gz`, DEB, and RPM artifacts. Use `package:linux:x64` on an x86_64 Linux build host and `package:linux:arm64` on an ARM64 Linux build host. The generic Linux commands build for the current host architecture and remain available while AppImage and Flatpak packaging are stabilized separately.

After packaging, smoke-test the unpacked executable (replace the architecture when needed):

```bash
npm run smoke:linux:packaged -- release/linux-arm64-unpacked/kingdom-death-survivors
```

The smoke test uses a temporary user-data directory, verifies that the real packaged renderer and preload API become ready, then exits automatically. CI runs the same check under Xvfb on native x64 and ARM64 runners.

### Automated Publishing
Push a version tag to trigger full release publishing:
```bash
git tag v1.1.1
git push origin v1.1.1
```
This triggers the `Release Publish` GitHub Actions workflow.
