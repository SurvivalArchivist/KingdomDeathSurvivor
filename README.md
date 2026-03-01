# KDM Survivors Console

Desktop companion app for Kingdom Death survivor management.

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
- Latest release page (Windows + macOS artifacts):
- https://github.com/SurvivalArchivist/KingdomDeathSurvivor/releases/latest

From that page, download:
- **Windows**: `.exe` artifact(s)
- **macOS**: `.dmg` or `.zip` artifact(s)

## Notes
- Unsigned builds may show SmartScreen/Gatekeeper warnings.
- For safest updates, always use files from the latest GitHub Release page above.

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
```bash
npm run package:mac
npm run package:win
```

### Automated Publishing
Push a version tag to trigger full release publishing:
```bash
git tag v1.1.1
git push origin v1.1.1
```
This triggers the `Release Publish` GitHub Actions workflow.
