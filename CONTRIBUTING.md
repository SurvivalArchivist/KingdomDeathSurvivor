# Contributing

## Safe Coding Workflow
1. Sync latest main:
- `git checkout main`
- `git pull`

2. Create branch:
- `git checkout -b feature/<short-name>`

3. Make changes.

4. Run preflight checks before commit:
- `npm run preflight`

5. Commit and push:
- `git add src ui test docs .github scripts package.json package-lock.json`
- `git commit -m "<clear summary>"`
- `git push -u origin feature/<short-name>`

6. Open PR and merge after CI passes.

## Do Not Commit
- `node_modules/`
- `release/`
- `dist/`
- `.DS_Store`

## Build Artifacts
- macOS local: `npm run package:mac`
- Windows local (on Windows): `npm run package:win`
- Cross-platform preferred: GitHub Actions workflows (`macOS Package`, `Windows Package`).
