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
- Build macOS + Windows artifacts
- Create/update a GitHub Release for that tag
- Attach artifacts to the Release page

Optional Linux packaging (manual while Linux release packaging is stabilized):
- GitHub -> Actions -> `Linux Package` -> `Run workflow`

Alternative (manual trigger):
- GitHub -> Actions -> `Release Publish` -> `Run workflow`
- Optional input `tag`: `v<version>` (recommended)

## 7) Artifact sanity check
- Mac: verify `.dmg` and `.zip` exist
- Windows: verify `.exe` outputs exist
- Launch each build once to confirm app starts
