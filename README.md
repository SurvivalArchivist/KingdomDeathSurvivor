# KDM Survivors Console

Electron desktop app for managing Kingdom Death survivors with JSON records, markdown-linked content, and showdown workflows.

## Quick Setup (Human + AI)

## Requirements
- Node.js 20+ (tested on Node 24)
- npm 10+
- macOS/Windows/Linux for dev runtime

## Install
```bash
npm install
```

## Run App
```bash
npm start
```

## Test
```bash
# quick syntax/compile checks
npm run test:unit

# behavior tests
npm run test:integration

# full suite
npm test
```

## Package Builds
Configured via `electron-builder` in `package.json`.

```bash
# all configured targets for current host
npm run package

# mac artifacts (dmg + zip)
npm run package:mac

# windows artifacts (nsis + portable)
npm run package:win

# unpacked build output
npm run package:dir
```

Output directory: `release/`

Notes:
- Windows packaging from macOS may require additional toolchain/runtime support depending on target and host setup.
- If packaging fails in CI/local due to missing builder dependencies, run `npm install` again and verify network access.

## Project Structure
- `src/main.js`: Electron main process + IPC wiring
- `src/preload.js`: secure renderer API bridge
- `src/renderer.js`: view logic/state/events
- `src/dataService.js`: file storage + validation + template storage
- `src/validation/person.schema.json`: survivor schema
- `ui/components/index.html`, `ui/components/styles.css`: UI
- `test/`: Node test suites

## Key Features (Current)
- Technical View + Create/View Survivor + Settlement + Showdown
- Departed showdown session lock and resume
- Knowledge/Tenet progression:
  - `knowledgeLevel`
  - `nextKnowledgeMode` (`existingTemplate`, `noTemplate`, `maxLevel`)
  - `nextKnowledgeTemplate`
- Reusable knowledge template library with search

## AI Continuity Files (Read First)
Agents should read and maintain:
- `AGENTS.md`
- `docs/ai/PROJECT_CONTEXT.md`
- `docs/ai/MODEL_HANDOFF.md`
- `docs/ai/UPDATE_CHECKLIST.md`

These files are the canonical handoff layer for reliable model switching.

