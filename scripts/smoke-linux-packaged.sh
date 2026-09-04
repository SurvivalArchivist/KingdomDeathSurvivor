#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <packaged-electron-executable>" >&2
  exit 2
fi

executable="$1"
if [[ ! -x "$executable" ]]; then
  echo "Packaged executable is missing or not executable: $executable" >&2
  exit 2
fi

smoke_dir="$(mktemp -d -t kdm-packaged-smoke.XXXXXX)"
cleanup() {
  rm -rf -- "$smoke_dir"
}
trap cleanup EXIT

log_file="$smoke_dir/electron.log"
if ! timeout 30s env -u ELECTRON_RUN_AS_NODE ELECTRON_ENABLE_LOGGING=1 \
  "$executable" \
  --smoke-test \
  --user-data-dir="$smoke_dir/user-data" \
  2>&1 | tee "$log_file"; then
  echo "Packaged Electron smoke test process failed" >&2
  exit 1
fi

if ! grep -Fq 'KDM_PACKAGED_SMOKE_TEST_OK' "$log_file"; then
  echo "Packaged Electron smoke test did not report renderer readiness" >&2
  exit 1
fi

echo "Packaged Electron smoke test passed: $executable"
