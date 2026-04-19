## KDM Survivors Console 2.2.1

This patch release focuses on safer renderer cleanup and a cleaner shipped presentation. It expands workflow coverage around the most refactor-sensitive Settlement and Showdown paths, moves more settlement and knowledge logic behind browser-safe helper seams, and refreshes the packaged app icons with a more modern rounded presentation.

### Highlights
- Renderer workflow coverage now protects more of the refactor-sensitive paths, including rename handling, knowledge upgrades, departed slot locking, and key Settlement workflows.
- Settlement rendering and settlement-specific event wiring now live behind a browser-safe helper seam, reducing the surface area of `renderer.js`.
- Packaged app icons have been refreshed with rounded corners for a cleaner, more native feel across macOS, Windows, and Linux.

### Detailed Release Notes
- Expanded renderer smoke coverage around rename/edit cleanup, departed Showdown slot locking, knowledge upgrades, settlement sorting/filtering, row-button showdown assignment swapping, and in-memory Settlement-to-Showdown resume behavior.
- Split reusable knowledge-template and settlement logic into browser-safe helper files loaded ahead of `renderer.js`, reducing renderer responsibility without changing Electron security settings or adding a bundler.
- Extended the settlement helper seam to include settlement table rendering, search/sort/filter event wiring, row-click open behavior, showdown slot assignment buttons, and settlement bulk-row interactions.
- Refreshed packaged app icons for macOS, Windows, and Linux using the new rounded master artwork.

### Downloads
- Windows: use the `.exe` installer asset in this release.
- macOS: use the `.dmg` asset first (recommended), or `.zip` if needed.

### macOS First-Launch Note
Unsigned builds can be blocked by Gatekeeper even when the app is valid.

If macOS reports the app is damaged or cannot be opened, run:

```bash
xattr -dr com.apple.quarantine "/Applications/KDM Survivors Console.app"
```

Then launch the app again.
