#!/usr/bin/env bash
set -euo pipefail

APP_NAME="KDM Survivors Console"
OUT_DIR="dist/macos"
APP_BUNDLE="$OUT_DIR/$APP_NAME.app"
RES_APP_DIR="$APP_BUNDLE/Contents/Resources/app"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"
cp -R "node_modules/electron/dist/Electron.app" "$APP_BUNDLE"

if command -v /usr/libexec/PlistBuddy >/dev/null 2>&1; then
  /usr/libexec/PlistBuddy -c "Set :CFBundleName $APP_NAME" "$APP_BUNDLE/Contents/Info.plist" || true
  /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName $APP_NAME" "$APP_BUNDLE/Contents/Info.plist" || true
  /usr/libexec/PlistBuddy -c "Set :CFBundleExecutable Electron" "$APP_BUNDLE/Contents/Info.plist" || true
fi

mkdir -p "$RES_APP_DIR"

# Exclude only top-level generated folders; keep dependency dist folders in node_modules.
rsync -a --delete \
  --exclude '.git' \
  --exclude '.github' \
  --exclude '/dist' \
  --exclude '/release' \
  --exclude '/user' \
  --exclude '/docs' \
  --exclude '/test' \
  --exclude '/scripts' \
  --exclude '/AGENTS.md' \
  --exclude '/README.md' \
  --exclude '*.log' \
  ./ "$RES_APP_DIR/"

# Offline-safe trim of known dev-only dependencies copied from workspace.
rm -rf "$RES_APP_DIR/node_modules/electron"
rm -rf "$RES_APP_DIR/node_modules/electron-builder"
rm -rf "$RES_APP_DIR/node_modules/@electron"
rm -f "$RES_APP_DIR/node_modules/.bin/electron" "$RES_APP_DIR/node_modules/.bin/electron.cmd"

(
  cd "$OUT_DIR"
  zip -qry "$APP_NAME-macos-arm64.zip" "$APP_NAME.app"
)

echo "Built: $APP_BUNDLE"
echo "Zipped: $OUT_DIR/$APP_NAME-macos-arm64.zip"
