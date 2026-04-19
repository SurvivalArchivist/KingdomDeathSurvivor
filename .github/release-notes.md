## KDM Survivors Console 2.1.2

This patch release focuses on Showdown polish and reliability. It tightens the temporary combat controls, fixes the knowledge-upgrade reusable-template flow, and makes the new template-save toggle much clearer to read during play.

### Highlights
- Showdown combat stat cards now use separate `Tokens (+)` and `Tokens (-)` counters instead of a single shared token bucket.
- Showdown weapon proficiency now includes a temporary reminder control and the type field no longer drops focus after one character.
- The knowledge-upgrade reusable-template option now works reliably and has clearer `ON` / `OFF` visual states.

### Detailed Patch Notes
- Split Showdown combat `Tokens` into showdown-only `Tokens (+)` and `Tokens (-)` buckets. `Tokens (+)` add to the displayed total, while `Tokens (-)` subtract from it; both clamp at zero and never persist to survivor files.
- Added a showdown-only weapon proficiency reminder control beside the proficiency type field.
- Fixed the weapon proficiency type input so it no longer exits editing after one typed character.
- Fixed the Showdown knowledge-upgrade scratch flow so the reusable-template save option becomes enabled correctly after `Create From Scratch`.
- Replaced the unreliable reusable-template checkbox in the upgrade editor with a dedicated toggle control and clearer state styling.

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
