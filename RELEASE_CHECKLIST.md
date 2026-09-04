# Release Checklist

Use this checklist for every release (for example `1.1.0`, `1.2.0`).

## 1) Start clean
- `git checkout main`
- `git pull`
- `git checkout -b release/<version>`

## 2) Bump version
- `npm version <version> --no-git-tag-version`

## 3) Validate
- `npm run verify`

## 4) Commit + push
- `git add package.json package-lock.json`
- `git add src ui test docs .github scripts`
- `git commit -m "Release <version>"`
- `git push -u origin release/<version>`

## 5) Merge
- Open a PR to `main`
- Confirm CI is green
- Merge PR

## 6) Trigger fully automated public release
- Create and push a release tag:
- `git checkout main`
- `git pull`
- `git tag v<version>` (example: `git tag v1.2.0`)
- `git push origin v<version>`
- Workflow `Release Publish` will automatically:
- Build macOS, Windows, Linux x64, and Linux ARM64 artifacts
- Verify the release tag matches the version in `package.json`
- Run full verification and packaged-app smoke tests on both Linux architectures
- Generate Linux SHA-256 checksum files
- Create/update a GitHub Release for that tag
- Attach artifacts to the Release page

Alternative (manual trigger):
- GitHub -> Actions -> `Release Publish` -> `Run workflow`
- Required input `tag`: `v<version>`
- The tag must already exist and match the version in `package.json`

## 7) Artifact sanity check
- Mac: verify `.dmg` and `.zip` exist
- Windows: verify `.exe` outputs exist
- Linux x64: verify `.tar.gz`, `.deb`, `.rpm`, and `SHA256SUMS-linux-x64.txt` exist
- Linux ARM64: verify `.tar.gz`, `.deb`, `.rpm`, and `SHA256SUMS-linux-arm64.txt` exist
- Confirm the Linux checksum files validate their three corresponding downloads
- Launch each build once to confirm app starts
- Record physical Fedora Asahi acceptance after Electron or Electron Builder upgrades; x86_64 installed-package feedback can continue after release without blocking publication
