# Linux x86_64 and ARM64 Support Review and Plan

Date reviewed: 2026-09-04

## Executive summary

The application does not need to be translated to a different framework to run on Linux. Its production code is JavaScript, its two production dependencies (`ajv` and `markdown-it`) are architecture-neutral, and Electron publishes Linux binaries for both `x64` and `arm64`. The main-process platform branches are limited and reasonable.

The initial review found that Linux support was declared but not delivered or demonstrated:

- Tagged releases publish macOS and Windows only.
- The manual Linux workflow runs only on `ubuntu-latest`, which is x86_64, and no build command specifies an architecture. It therefore produces x86_64 artifacts only.
- Local packaging also inherits the machine architecture. Running it on Asahi would make ARM64 artifacts, while running it on a normal x86_64 workstation would make x86_64 artifacts; neither command produces and tests both intentionally.
- `electron-builder` 24.13.3 is old relative to Electron 41.10.4. This unnecessarily exposes packaging to old helper binaries and compatibility defects, especially on ARM64/16 KiB-page systems.
- CI checks only that files with expected extensions exist. It never starts Electron or a packaged application.
- There is no Asahi/16 KiB-page test. A generic ARM64 Ubuntu runner is necessary, but it is not equivalent to Asahi Linux.
- On the Asahi system used for this review, `node` and `npm` are absent from `PATH`, so development, tests, and packaging cannot currently begin. The kernel reports `aarch64` and a 16,384-byte page size.

Phases 0–4 were subsequently completed. Fedora's native Node 24.18.0 package was installed, `npm ci` succeeded, all 220 repository tests passed, and Electron 41.10.4 launched the application successfully under the KDE Wayland session using the Asahi DRM render node. Electron Builder was upgraded to 26.15.7; native x64 and ARM64 CI jobs passed; and valid tarball, DEB, and RPM artifacts were uploaded. The ARM64 RPM from the successful `main` run was checksum-verified, installed on the 16 KiB-page Fedora Asahi system, and passed the launch and functional acceptance checks.

The recommended route is to make native `x64` and `arm64` CI builds explicit, start with `tar.gz` plus the native package for each intended distribution, add real launch smoke tests, and treat an Asahi launch as a release gate for ARM64. AppImage and Flatpak should be introduced only after their runtime/tooling behavior is verified on both architectures.

In this document, “x86 Linux” means 64-bit x86 (`x86_64`/Electron `x64`). Supporting obsolete 32-bit x86 is not proposed.

## What is already portable

### Runtime code

The runtime is already in good shape for cross-platform use:

- `src/main.js`, `src/dataService.js`, `src/survivorProvider.js`, and `src/lanSurvivorHost.js` use Node/Electron APIs rather than platform shell commands.
- Paths are built with `path.join`, `path.resolve`, and `path.relative` rather than hard-coded Windows or Unix separators.
- Configuration is stored below Electron's `app.getPath('userData')`.
- User data and markdown sources are selected through Electron's directory dialog.
- The Windows and macOS branches in `src/main.js` only control menu and dock behavior. Linux follows the normal Electron window path.
- Survivor writes use a temporary file in the destination directory followed by `rename`, so they remain on the same filesystem and retain atomic-write behavior on normal Linux filesystems.
- There are no native production Node addons (`*.node`) to rebuild for each architecture.

Electron officially lists `arm64` support for ARM64 Linux, and electron-builder documents both Linux `x64` and `arm64` targets:

- [Electron installation and supported architectures](https://www.electronjs.org/docs/latest/tutorial/installation)
- [electron-builder architecture support](https://www.electron.build/docs/architecture/)

This makes an Electron-to-another-framework rewrite a poor first response. The faster and lower-risk path is to correct packaging and prove runtime behavior.

### Existing Linux work

The repository already contains:

- Linux icon assets at `ui/assets/linux-icons/`.
- Electron Builder targets for AppImage, DEB, RPM, `tar.gz`, and Flatpak.
- Manual `Linux Package` and `Linux Flatpak Debug` workflows.
- Linux artifact names containing `${arch}`.
- Node-based tests that run in Ubuntu validation CI.

These are useful foundations, but they currently prove only that application logic works under Node on an x86_64 Ubuntu worker and that an x86_64 packaging job can create named files.

## Why Linux may not be working now

### 1. No Linux binaries are published in normal releases

`.github/workflows/release-publish.yml` has jobs for macOS and Windows only. Its publish job depends only on those jobs and uploads only those artifacts. The README consequently points users to releases that do not contain a normal Linux download.

Git history shows Linux was deliberately removed from release publishing in commit `43181b7` while packaging was being stabilized. That was a sensible containment action, but it means Linux is currently an internal/manual packaging experiment rather than a supported release platform.

### 2. Architecture is implicit, so the workflow builds x86_64 only

The Linux workflow uses:

```yaml
runs-on: ubuntu-latest
```

and invokes Electron Builder without `--x64` or `--arm64`. Electron Builder defaults to the current machine architecture when no architecture is specified. `ubuntu-latest` is an x86_64 runner, so this cannot produce a native ARM64 release despite the architecture token in the artifact filename.

GitHub now documents native hosted labels such as `ubuntu-24.04` for x64 and `ubuntu-24.04-arm` for ARM64. Use them deliberately rather than relying on `-latest`: [GitHub-hosted runner reference](https://docs.github.com/en/actions/reference/runners/github-hosted-runners).

### 3. The build tool/runtime pairing is poorly aligned

The repository pins:

```text
electron         41.10.4
electron-builder 24.13.3
```

Electron 41 itself requires Node 22.12 or newer during installation, while Builder 24 dates from a much earlier Electron generation. It may still package a simple app, but keeping an old packager means keeping old downloaded helper toolchains and missing years of ARM64, AppImage, Flatpak, and modern distribution fixes.

Upgrade Electron Builder in an isolated change, regenerate `package-lock.json`, review its migration notes, and prove all Windows/macOS packages as well as Linux. At review time the stable Builder line is 26.x; do not jump to a prerelease solely to gain an `all` shortcut. Continue using explicit architectures.

### 4. Asahi Linux is not an ordinary ARM64 target

The reviewed machine reports:

```text
architecture: aarch64
kernel:       7.1.6-400.asahi.fc44.aarch64+16k
page size:    16384
```

Asahi uses 16 KiB memory pages. ARM64 software can still be built incorrectly with 4 KiB ELF alignment or hard-coded 4 KiB assumptions; such a binary can fail before any application JavaScript runs. The Asahi project describes the loader failure and recommends inspecting program headers with `readelf`: [Asahi broken-software notes](https://github.com/AsahiLinux/docs/blob/main/docs/sw/broken-software.md).

Electron also had a specific 16 KiB-page renderer regression in Electron 34/Chromium 132. The reported upstream fix arrived with Chromium 134: [Electron issue #45560](https://github.com/electron/electron/issues/45560). Electron 41 is much newer, so that exact regression should not apply, but the packaged Electron binary and every packaging/runtime helper still need to be tested rather than assumed compatible.

A native GitHub ARM64 runner generally proves ARM64 compatibility on its own kernel. It does not prove 16 KiB-page compatibility. Asahi must remain a separate acceptance environment.

### 5. The current machine lacks the required development runtime

During this review, `node` was not found. Because Electron 41's installer requires Node 22.12 or newer, standardize development and CI on Node 24 and declare the constraint in `package.json`.

On a traditional Fedora Asahi installation:

```bash
sudo dnf install nodejs24
node --version
npm --version
```

Fedora documents that its Node package includes npm and provides versioned packages such as `nodejs24`: [Fedora Node.js installation](https://developer.fedoraproject.org/tech/languages/nodejs/nodejs.html).

If this is an image-based Fedora variant, use its supported layered-package or development-container workflow rather than assuming `dnf` mutates the base system.

### 6. Packaging success is not runtime success

The manual workflow's smoke check uses filename globs. It proves that an `.AppImage`, `.rpm`, or other file exists, but not that:

- the embedded Electron executable matches the requested architecture;
- the executable loader can start it;
- the Chromium sandbox can initialize;
- a renderer loads `ui/components/index.html`;
- Wayland/X11 and GPU initialization work;
- file chooser portals can reach user-selected folders;
- LAN host and discovery traffic can pass the Fedora firewall.

The existing renderer smoke test is a mocked DOM/API test, not an Electron process test. This distinction should be made explicit in CI naming.

### 7. Too many package formats are attempted at once

The Linux job attempts AppImage, DEB, RPM, `tar.gz`, and Flatpak in one job, and a failure in any one blocks all Linux output. That makes diagnosis difficult and overstates maturity.

- `tar.gz` is the simplest portable baseline and is useful for diagnosing Electron independently of installer behavior.
- RPM is the most useful native package for Fedora Asahi.
- DEB covers Ubuntu/Debian x86_64 and ARM64.
- AppImage adds its own runtime and FUSE behavior. Electron Builder documents FUSE failures and an extract-and-run fallback: [electron-builder AppImage troubleshooting](https://www.electron.build/docs/troubleshooting/).
- Electron Builder creates a single-file Flatpak bundle, not a Flathub repository release. Flatpak also changes configuration and filesystem locations through sandboxing: [electron-builder Flatpak documentation](https://www.electron.build/docs/flatpak/).

Build and report these independently so a Flatpak problem does not erase working RPM/tarball releases.

### 8. Package formats change visible filesystem and configuration behavior

The app stores selected source folders as absolute paths in its Electron user-data `config.json`. A normal package and Flatpak do not necessarily use the same user-data directory. Switching format may therefore look like lost configuration even though survivor JSON files remain untouched and only need to be reselected.

Flatpak's default Electron Builder permissions currently include home-directory access, display, network, and DRI, which broadly match this app. Still test:

- folders inside and outside the home directory;
- removable/network-mounted folders;
- the directory chooser under Wayland portals;
- export-backup destination access;
- LAN Host and LAN Client modes.

Do not auto-create or silently relocate survivor folders to solve sandbox access; that would violate the product's data ownership rules.

### 9. Fedora firewall behavior can look like an ARM/Linux application failure

Local survivor CRUD does not require network changes. LAN Host uses TCP port 3765 by default, and discovery broadcasts over UDP port 3766. Fedora commonly enables a firewall, so manual host entry may work differently from discovery, or neither may be reachable from another device until the user authorizes the ports.

Treat firewall changes as an explicit user/admin action and document how to scope them to the trusted local network zone. Do not have the app modify firewall rules.

## Recommended support target

Use the following initial matrix:

| Platform | Architecture | Required first formats | Secondary formats | Required runtime test |
| --- | --- | --- | --- | --- |
| Ubuntu 24.04 | x86_64 (`x64`) | `tar.gz`, DEB | AppImage, Flatpak | Native CI GUI smoke test |
| Ubuntu 24.04 | AArch64 (`arm64`) | `tar.gz`, DEB | AppImage, Flatpak | Native ARM64 CI GUI smoke test |
| Fedora current | x86_64 (`x64`) | RPM, `tar.gz` | Flatpak, AppImage | Clean VM/hardware test |
| Fedora Asahi Remix | AArch64 (`arm64`, 16 KiB pages) | RPM, `tar.gz` | Flatpak, AppImage | Physical Asahi acceptance test |

“Required first” means the format must be green before Linux is restored to tagged releases. Secondary formats can be added one at a time without blocking core Linux delivery.

## Proposed implementation

### Phase 0: establish a reproducible Asahi baseline

Status on the reviewed device: **passed for the source/development launch on 2026-09-04**. The installed runtime was Node 24.18.0/npm 11.16.0 on `linux arm64`. Electron's main ELF was native AArch64 with `0x10000` (64 KiB) `LOAD` alignment, the complete test suite passed, and the real renderer loaded under Wayland without disabling GPU acceleration. Packaging is the next separate gate.

1. Install Node 24, then capture:

   ```bash
   uname -a
   uname -m
   getconf PAGESIZE
   node --version
   npm --version
   echo "$XDG_SESSION_TYPE"
   ```

2. From a clean dependency tree, run:

   ```bash
   npm ci
   npm run verify
   npm start
   ```

3. Classify failure before changing application code:

   - Failure in `npm ci`: Node version, network, Electron artifact, or an architecture-specific install/helper problem.
   - Immediate `SIGSEGV`/loader error: inspect 16 KiB ELF compatibility.
   - Chromium sandbox error: inspect sandbox/user-namespace packaging.
   - Window starts but is blank: capture Electron/renderer logs and test GPU/Wayland diagnostics.
   - App works from `npm start` but packaged output fails: packaging/tooling defect, not application portability.

4. Keep the first successful log as a baseline artifact.

Useful diagnostics (not permanent launch flags):

```bash
ELECTRON_ENABLE_LOGGING=1 npm start
npm start -- --disable-gpu
```

If disabling GPU changes the result, investigate Electron/Chromium/Mesa and Wayland initialization. Do not permanently disable the Asahi GPU without evidence.

### Phase 1: make architecture and prerequisites explicit

Status: **core work complete**. The project now declares Node `>=22.12.0`, Electron Builder has been upgraded from 24.13.3 to 26.15.7, and explicit `package:linux:x64` and `package:linux:arm64` commands build the core tarball, DEB, and RPM formats. On Asahi, all tests pass, the unpacked application launches, and all three ARM64 core artifacts build successfully. Fedora build hosts require `libxcrypt-compat` for Builder's bundled FPM/Ruby and `rpm-build` for `rpmbuild`. Secondary-format scripts and cross-platform packaging verification remain separate later work.

Make these repository changes together:

1. Add a Node engine declaration compatible with Electron's installer, and standardize docs/CI on Node 24.
2. Upgrade `electron-builder` from 24.13.3 to the current stable 26.x release in its own reviewable commit.
3. Add scripts whose names declare both format and architecture, for example:

   ```json
   "package:linux:x64": "electron-builder --linux tar.gz deb rpm --x64",
   "package:linux:arm64": "electron-builder --linux tar.gz deb rpm --arm64",
   "package:linux:appimage:x64": "electron-builder --linux AppImage --x64",
   "package:linux:appimage:arm64": "electron-builder --linux AppImage --arm64",
   "package:linux:flatpak:x64": "electron-builder --linux flatpak --x64",
   "package:linux:flatpak:arm64": "electron-builder --linux flatpak --arm64"
   ```

4. Keep `${arch}` in artifact names.
5. Add `engines` and supported platform information to the README without claiming ARM64 support until its acceptance gate passes.

Explicit scripts prevent a developer from assuming that `package:linux` created both architectures.

### Phase 2: create native two-architecture CI

Status: **implemented and passed on native GitHub-hosted runners**. The manual `Linux Package` workflow uses pinned `ubuntu-24.04` x64 and `ubuntu-24.04-arm` ARM64 runners with explicit package scripts. Each job records architecture/page size, runs full verification, builds tarball/DEB/RPM artifacts, validates DEB and RPM architecture metadata plus the unpacked executable's ELF machine, prints ELF load segments and checksums, and uploads an architecture-specific artifact set. Both jobs passed from merged `main` in workflow run `33914931154` on 2026-09-04.

Replace the single Linux job with a matrix. The key design is:

```yaml
strategy:
  fail-fast: false
  matrix:
    include:
      - runner: ubuntu-24.04
        arch: x64
      - runner: ubuntu-24.04-arm
        arch: arm64
runs-on: ${{ matrix.runner }}
```

Each job should:

1. Install Node 24 with npm caching.
2. Record `uname -m` and `getconf PAGESIZE` in the log.
3. Run `npm ci` and `npm run verify`.
4. Build `tar.gz`, DEB, and RPM with an explicit architecture flag.
5. Inspect the unpacked app and principal ELF files with `file` and `readelf -l`.
6. Upload per-architecture artifacts with distinct names such as `linux-x64-core` and `linux-arm64-core`.

Do not cross-build the ARM release on the x86 job unless native hosted ARM runners are unavailable. Native builds remove emulation and helper-tool ambiguity and can execute their own outputs.

### Phase 3: add a real Electron launch smoke test

Status: **implemented and passed on Asahi and native GitHub-hosted x64/ARM64 runners**. The packaged application accepts `--smoke-test`, creates its real `BrowserWindow`, verifies the document title, navigation, Settings view, and preload API after `did-finish-load`, prints `KDM_PACKAGED_SMOKE_TEST_OK`, and exits. `scripts/smoke-linux-packaged.sh` provides an isolated temporary user-data directory and enforces an outer timeout. Both CI matrix jobs invoke it through Xvfb against their unpacked packaged executable; the hosted runners use `--no-sandbox` because the unpacked `chrome-sandbox` cannot have root ownership/mode 4755 in that environment. Normal Asahi launches retain Electron's sandbox. The ARM64 package also passed this test under the normal KDE Wayland session on the reviewed Fedora Asahi device.

Add a small opt-in test mode to the app, for example `--smoke-test`, that:

1. Starts the real packaged main process.
2. Creates the real `BrowserWindow`.
3. Waits for `did-finish-load`.
4. Verifies a known root element/title through `webContents.executeJavaScript`.
5. Writes a success line and exits zero, with a timeout that exits non-zero.

Run it under a virtual display where needed (for example Xvfb) against the unpacked packaged application on both native CI architectures. This tests the binary that will be shipped, not merely source files through Node.

Keep the existing unit/integration/renderer tests. The packaged smoke test supplements them; it does not replace them.

### Phase 4: pass the Asahi acceptance gate

Status: **passed on Fedora Linux Asahi Remix**. The `kingdom-death-survivors-3.0.1-1.aarch64` RPM from merged-`main` workflow run `33914931154` was verified against its CI SHA-256 (`fabbe37b2dc00a00707d8f567fed648bfd6637e52ec4e6ea020dbd9b97ed107d`), installed through Fedora's package manager, and launched from `/opt/KDM Survivors Console/kingdom-death-survivors` without `--no-sandbox`. The installed app passed automated renderer/preload readiness under KDE Wayland on the 16 KiB-page kernel, and the user confirmed the functional acceptance flows below work with schema-v6 survivor data.

For every candidate Electron or Builder upgrade, test the ARM64 core artifact on the physical Asahi device.

Minimum checks:

- The executable architecture is AArch64.
- The application starts on the 16 KiB kernel without loader or renderer crashes.
- A window renders under the normal Wayland session.
- Settings opens a directory chooser.
- Existing survivor and markdown folders can be selected without being created or moved.
- Survivor list/load/create/edit/delete works.
- Rename and history snapshot behavior works.
- Backup export works.
- Full-screen toggle works.
- LAN Host starts; a client can reach `/health` over TCP.
- UDP discovery is checked separately with the trusted firewall zone configured.
- The app closes cleanly.

If launch fails before JavaScript, unpack the artifact and inspect every executable ELF, not only the main Electron binary:

```bash
file path/to/executable
readelf -lW path/to/executable
```

For a suspected 4 KiB-only tool that is not part of the shipped app, `muvm` can be used as a diagnostic/workaround on Fedora Asahi. It should not become the normal launch requirement for this app; native 16 KiB compatibility is the release goal.

### Phase 5: add packaging formats independently

Add formats in this order:

1. `tar.gz`: simplest control artifact.
2. RPM: primary Fedora/Asahi install experience.
3. DEB: Ubuntu/Debian install experience.
4. AppImage: verify ARM64 runtime, FUSE availability, executable bit, and `--appimage-extract-and-run` fallback.
5. Flatpak: build per architecture, install with `flatpak install --user`, and test data-folder portals, home access, network, Wayland, and DRI.

Give AppImage and Flatpak separate jobs so their failures do not block core packages. Add a Pacman target only if Arch Linux ARM is an explicit supported distribution; Asahi reference alone does not justify it because the reviewed host is Fedora-based.

### Phase 6: restore Linux to tagged releases

Once x64, ARM64, and Asahi gates pass:

1. Add the two native Linux core jobs to `release-publish.yml`.
2. Make the publish job depend on both.
3. Download and attach both architecture artifact sets.
4. Clearly label `x64` versus `arm64` in release notes.
5. State which formats are supported and which are experimental.
6. Add checksum files for downloads.
7. Update `RELEASE_CHECKLIST.md` to require one x86_64 launch and one Asahi launch before publication.

Do not call Linux ARM64 supported merely because packaging succeeded on CI. The 16 KiB Asahi acceptance result should be recorded with the release.

## Suggested troubleshooting decision tree

```text
npm ci fails
  -> check Node >= 22.12, native architecture, network, Electron download

npm start fails before a window
  -> capture stderr and exit signal
  -> loader/SIGSEGV: inspect ELF alignment for 16 KiB pages
  -> sandbox error: inspect chrome-sandbox/user namespaces

npm start works; unpacked package fails
  -> Builder/helper/permissions/package layout issue

unpacked package works; RPM/DEB fails
  -> native package metadata, ownership, desktop entry, or install permissions

tarball/RPM works; AppImage fails
  -> AppImage runtime/FUSE/ELF issue; test extract-and-run

native package works; Flatpak fails
  -> portal, filesystem, D-Bus, network, Wayland, or DRI permission issue

window works only with --disable-gpu
  -> Electron/Chromium/Mesa/Wayland investigation; do not mask permanently

local data works; LAN does not
  -> test TCP 3765 and UDP 3766 separately; inspect Fedora firewall zone
```

## Definition of done

Linux support can be described as effective when all of the following are true:

- Tagged releases contain clearly named `x64` and `arm64` Linux artifacts.
- Builds use explicit architecture flags on native CI runners.
- CI runs the complete Node test suite on both architectures.
- CI launches the unpacked packaged application on both architectures and verifies renderer load.
- ELF architecture is checked and build logs record page size.
- The ARM64 artifact passes the physical Asahi/16 KiB acceptance checklist.
- RPM is verified on Fedora x86_64 and Fedora Asahi.
- DEB is verified on Ubuntu x86_64 and ARM64.
- AppImage and Flatpak are either separately verified or clearly marked experimental/omitted.
- Folder selection, persistence, backup export, and LAN behavior are verified on Linux.
- README and release notes explain installation, architecture choice, configuration location differences, AppImage executable/FUSE behavior, and firewall requirements.
- Linux failures are isolated by architecture and package format rather than hidden behind one all-or-nothing job.

## Immediate next action

Validate the x64 RPM on Fedora x86_64 and the DEB on Ubuntu x86_64, then add the proven x64/ARM64 core packages to tagged release publishing with checksums and clear architecture labels. Keep AppImage and Flatpak stabilization separate until the core package gates pass.
