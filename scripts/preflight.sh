#!/usr/bin/env bash
set -euo pipefail

forbidden='(^node_modules/|^release/|^dist/|(^|/).DS_Store$)'
staged_files="$(git diff --cached --name-only)"

if [[ -n "${staged_files}" ]]; then
  bad_files="$(printf '%s\n' "${staged_files}" | rg -N "${forbidden}" || true)"
  if [[ -n "${bad_files}" ]]; then
    echo "Refusing commit: forbidden files are staged:"
    printf '%s\n' "${bad_files}"
    echo "Unstage them with: git restore --staged <path>"
    exit 1
  fi
fi

bash scripts/verify.sh

echo "Preflight checks passed. Safe to commit."
