# Proposed Theme Roadmap

Last updated: 2026-09-18

## Goal

Turn the four reference images in `ui/assets/Proposed Assets/` into an optional, gated layout style without regressing Classic or the existing Zen presentation. The user-facing style name is **Modern**, independently combinable with Classic or Zen colours.

This is a layout and component-language change, not a new colour scheme. It must reuse the existing Zen day/night colours while adopting the reference Showdown's information hierarchy, spacing system, icon language, survivor identity treatment, and control layout. Those structural differences must be isolated behind a theme/layout class while all data, actions, LAN behavior, persistence, and accessibility remain shared.

## Reference Direction

The supplied assets establish these layout and component rules:

- retain the existing Zen day/night canvas, surfaces, text, and line colours
- compact rounded controls with light borders and minimal shadows
- retain Zen's semantic colours for positive/ready/survival, danger/Insanity, bleeding/error, and hosting states
- compact survivor identity treatment without a decorative avatar
- strongly grouped Showdown rows: primary vitals, critical state, mind, armor, then combat stats
- icon-led navigation and domain labels, with text retained where recognition matters
- more whitespace between groups, but denser controls within each group

The mockup is a direction reference, not a pixel-perfect specification. Existing workflows and current Showdown behavior remain authoritative.

## Asset Inventory And Required Cleanup

The four PNG files are source references, not production-ready icon assets:

1. `(1).png` — full Showdown composition and spacing reference.
2. `(2).png` — navigation, vital, state, and utility icon sheet.
3. `(3).png` — armor, checkbox, and step-control icon sheet.
4. `(4).png` — combat-stat and modifier-bucket icon sheet.

Before use:

- extract each approved icon from the supplied transparent PNG sheets as an individual, downscaled raster asset
- normalize stroke width, caps, joins, optical size, and baseline alignment
- remove all baked labels, backgrounds, shadows, and state decoration
- separate semantic overlays from base icons; specifically, the Head armor icon must not contain its warning triangle
- keep warning, checked, disabled, active, and bleeding states as CSS/DOM layers so they can change independently
- preserve the reference artwork colours in day mode and use theme-gated filters where a monochrome icon needs night-mode contrast
- retain the current accessible text/`aria-label` behavior even where the visible treatment becomes icon-led
- document the final source/provenance and reject raster crops as shipping UI assets

## Architectural Approach

### Theme registration and gating

- Add the new layout as a separate Settings theme-family option while sharing Zen colour tokens.
- Introduce explicit theme and layout classes rather than changing the existing Zen layout in place.
- Preserve the saved theme-family preference and the header sun/moon behavior.
- Provide both day and night variants from the start by mapping the new family onto the existing Zen day/night palette.
- Gate every structural override beneath the new layout class so ordinary `theme-zen-day` and `theme-zen-night` remain visually stable.

### Token layer

Reuse the existing Zen semantic colour tokens for:

- canvas, card, inset-control, hover, and selected surfaces
- primary and secondary/muted ink
- borders, focus rings, and restrained elevation
- survival/success, danger/insanity, bleeding/error, and hosting/network states
- spacing, corner radii, control heights, icon sizes, and typography weights

Add layout-specific sizing and spacing tokens only where necessary. Components should continue consuming Zen semantic colour variables; avoid duplicating the Zen palette or scattering literal colours across Showdown selectors.

### Layout isolation

- Add the dedicated Modern style class (kept internally as `theme-zen-layout` for saved-preference compatibility) alongside the selected colour class.
- Keep shared markup where practical and add semantic component hooks where the current DOM does not express the reference hierarchy.
- Put layout changes under the internal `theme-zen-layout` class; Standard geometry must remain unchanged.
- Do not fork renderer logic or create a second Showdown implementation.
- Keep the fixed navbar, full-height Showdown cards, internal card scrolling, departed-state behavior, and responsive single-card fallback.

## Delivery Phases

### Phase 0 — Decisions and acceptance frame

Status: proposed.

- Choose the final theme name.
- Confirm whether the mockup's Disorders shortcut is part of this theme or merely illustrative.
- Capture target screenshots at the normal desktop width and the smallest supported window width.
- Define acceptance as visual similarity plus full workflow parity, not pixel equality with generated artwork.

Exit condition: the open decisions above are resolved and the reference screenshots are agreed.

### Phase 1 — Production icon system

Status: complete for the approved scope. Theme-only PNGs extracted and downscaled from the supplied artwork are implemented for vitals, Survival, Insanity, Bleeding, Courage, Understanding, armor locations, combat stats, and combat modifier buckets. The Head asset was cleaned so its severe-injury warning remains a separate interactive overlay. Existing navigation and utility icons are intentionally retained.

- Create a reviewed set of compact transparent PNG assets for vitals, mind, armor, stats, and modifier buckets.
- Reuse existing icons where they already match; replace only where the new language materially improves consistency.
- Build armor icons without warnings, then compose the existing severe-injury danger button separately.
- Verify icons at 16, 20, 24, and 32 CSS pixels on standard and high-density displays.
- Add a small icon-gallery development fixture or documented review page for alignment and theme-colour checks.

Exit condition: icons are crisp, independently colourable, accessible through surrounding controls, and no warning/state is baked into a base glyph.

### Phase 2 — Theme foundation and shell

Status: in progress. Settings now persists colour theme and layout style as independent axes. Standard or Modern geometry can be combined with Classic or Zen colours, while day/night remains controlled by the header toggle. Initial shell, card, field, identity, and responsive Showdown treatments live in `theme-zen-layout.css`.

- Register colour and layout as separate Settings controls while preserving legacy saved theme values.
- Reuse Zen's colour tokens and add gated Modern styles for the fixed header, navigation buttons, status controls, fields, tables, modals, focus states, and disabled states.
- Retain the existing navigation icons, text, order, and global control treatment.
- Verify startup role gate, Settings, Survivors, Settlement, Bulk Updates, Create/View Survivor, and every modal in both Modern day/night modes before proceeding to structural Showdown work.

Exit condition: every view is usable in Modern with no Showdown-specific layout changes and no leakage into Classic or the original Zen layout.

### Phase 3 — Showdown hierarchy

Status: in progress. The Modern Showdown now uses a four-column primary-vitals row, a deliberately proportioned proficiency/Survival/Insanity/Bleeding row, separated mind controls, compact armor hierarchy, and denser three-column combat-stat cards. Responsive variants collapse these groups without changing the underlying controls.

- Add the compact survivor identity treatment without introducing decorative avatars or survivor-image persistence.
- Recreate the reference grouping using the current data model:
  - row 1: Age, Lumi, Systemic Pressure, Torment
  - row 2: Weapon Proficiency trigger, Survival, Insanity, Bleeding
  - row 3: Courage and Understanding
  - armor and combat-stat sections beneath
- Preserve the existing Weapon Proficiency popover, Brain Trauma/severe tables, heavy/light armor toggles, bleeding behavior, and Showdown-only temporary modifiers.
- Style critical-state controls using semantic colour rather than baked imagery.
- Use the available vertical space while retaining approximately 20px bottom clearance and internal card scrolling.
- Treat the two-survivor desktop layout and one-survivor narrow layout as separate acceptance cases.

Exit condition: the reference hierarchy is recognizable, both survivor cards remain functionally complete, and no session/save behavior changes.

### Phase 4 — Create/View and shared components

Status: not started.

- Apply the same icon, field, card, and hierarchy language to Create/View Survivor without copying the Showdown-only combat layout blindly.
- Keep the flattened sticky action rail required by the existing UI guardrail.
- Bring tag editing, notes, knowledge, disorders, severe injuries, tables, and pickers into the Modern component system.
- Ensure shared controls have one semantic component treatment rather than per-view imitations.

Exit condition: Create/View and Showdown feel like one theme while preserving their different tasks.

### Phase 5 — Survivors, Settlement, and utility views

Status: not started.

- Restyle roster filters, Extra Filters, optional columns, tag chips, and refresh controls.
- Restyle Settlement record sections and collapsible Returning Survivors/Knowledge tables.
- Cover Bulk Updates, Settings infrastructure, validation messages, offline/LAN states, and empty/error/loading states.
- Keep tables information-dense and avoid turning utility controls into oversized cards.

Exit condition: the theme is complete across the application rather than a Showdown skin.

### Phase 6 — Accessibility, regression, and polish

Status: not started.

- Check text, icons, Zen semantic tints, borders, and focus rings against WCAG AA contrast targets in day and night modes.
- Verify keyboard order, visible focus, popover dismissal, modal focus, checkbox state, and icon-only accessible names.
- Test 100%, 125%, 150%, and 200% zoom and the supported window-width breakpoints.
- Add renderer coverage for theme selection/persistence and any new structural hooks; keep behavior tests theme-independent where possible.
- Run `npm run preflight` and perform manual screenshot comparison in every theme family.
- Check Windows, macOS, and Linux font/icon rendering before release.

Exit condition: automated gates pass, the visual review matrix is signed off, and Classic/original-Zen screenshots show no unintended layout drift.

## Suggested Implementation Slices

Keep reviewable changes small enough to compare visually:

1. cleaned PNG icon set and icon gallery
2. Modern registration, gated geometry tokens, and shell
3. shared buttons/fields/tables/modals
4. Showdown identity and vital rows
5. Showdown armor and combat stats
6. Create/View Survivor
7. Survivors, Settlement, Bulk Updates, and Settings
8. responsive/accessibility polish and final regression pass

Do not combine icon extraction, global token replacement, and all-view layout changes into one patch.

## Risks And Guardrails

- Generated reference art can contain inconsistent geometry and embedded mistakes. Redraw, do not crop blindly.
- Theme-specific layout selectors can become more specific than shared interaction states. Keep selector specificity controlled and test hover/focus/disabled/error states in every family.
- A top-layer popover may not inherit layout assumptions from its visual parent. Test Weapon Proficiency and all modals explicitly.
- Compact controls must not reduce touch/click targets below a usable size.
- Semantic colour cannot be the only signal; retain labels, icons, checked state, and warning affordances.
- Theme work must not alter survivor schema, settlement schema, LAN protocol, save semantics, or Showdown persistence rules.
- Existing Classic and original Zen layouts remain supported until an explicit product decision retires them.

## Definition Of Done

- Modern is selectable and persists across restarts.
- The theme toggle switches between the inherited Zen day/night palettes.
- Every primary view, modal, empty state, error state, and LAN state has an approved treatment.
- Icons are production PNG crops derived from the approved artwork, with separable state overlays.
- The Head icon contains no baked warning; severe-injury warnings remain functional overlays.
- Showdown matches the reference hierarchy without losing any current control or session behavior.
- Keyboard, contrast, zoom, responsive, and multi-theme regression checks pass.
- `npm run preflight` passes and the change is recorded in the handoff documentation.
