# Showdown Refactor Acceptance

Checkpoint: 2026-09-05, Step 9.

## Automated verification — passed

`npm run verify` passed: 229 tests (1 syntax, 146 integration, 41 main-process, 41 renderer). `git diff --check` passed. Browser script loading includes State, View, Controller, and Session before the renderer; the smoke harness loads the same modules.

Renderer regression coverage includes assignment/swapping, pre-departure refresh, departed slot locking, cross-view resume, inline text persistence, Lumi persistence, negative temporary modifiers, temporary-state reset, page/accordion retention, successful completion, and partial-save/conflict recovery.

These tests use a simulated DOM/API environment, not a real Electron UI. The agent did not perform manual acceptance; the user subsequently confirmed their manual testing looked fine (see result below). No merge was performed.

## Manual acceptance — user confirmed

Use a disposable Survivors folder containing two current-schema test survivors, not live campaign records. Record results and any failures below. Restore the original Settings selection afterward. Do not induce save failures against real survivor data.

- [ ] Launch the app. Open Settlement and assign two different survivors via row buttons and selectors; verify slot swapping and both cards render correctly.
- [ ] Before Depart, change a persistent value on a card and refresh survivors. Verify the saved value is restored. Depart and verify selectors/refresh cannot replace the active survivors.
- [ ] Change Survival and Lumi; add/commit Abilities, Impairments, and Notes. Exercise negative combat Temp modifiers, armor, bleeding, and proficiency reminders. Check values and controls remain legible in both themes.
- [ ] Change card pages and expand/collapse sections, then edit a value that rerenders the card. Verify page and section state survives. Navigate through Create and Settlement and return; verify the departed session and edits remain intact.
- [ ] Cancel End Showdown confirmation; verify the session stays active. Then confirm End Showdown. Reopen the survivors and verify persistent edits saved, selectors cleared, and a fresh session resets temporary armor/modifiers/tokens/reminders.
- [ ] Using disposable LAN test data, create a stale revision for one survivor after departure and attempt End Showdown. Verify the error identifies the failure, the session stays departed, and recovery does not silently overwrite the newer record. Check the partial-success case if available; retain any error details for investigation.

Manual result: **accepted by the user**, who subsequently reported "Manually looks, fine". Platform and per-item results were not supplied; the checklist above is retained as the original test guide, not a claim that the agent executed each item. Step 9 is complete; no merge performed. The new settlement knowledge feature requires separate acceptance.
