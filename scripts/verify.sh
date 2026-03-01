#!/usr/bin/env bash
set -euo pipefail

node --check src/main.js src/preload.js src/dataService.js src/renderer.js
npm test
