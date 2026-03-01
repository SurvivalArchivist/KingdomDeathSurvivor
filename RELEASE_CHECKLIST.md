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

## 6) Build artifacts in GitHub Actions
- Run workflow: `macOS Package`
- Run workflow: `Windows Package`
- Download artifacts from each run

## 7) Artifact sanity check
- Mac: verify `.dmg` and `.zip` exist
- Windows: verify installer/portable outputs exist
- Launch each build once to confirm app starts
