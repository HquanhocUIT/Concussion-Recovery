# Phase 5 — UI/UX polish & accessibility

## What changed

- Replaced the split “space/aurora” landing concepts with one calm clinical visual system for light and dark mode.
- Added a plain-language product flow: check-in → plan-demand simulation → guideline retrieval → safety check.
- Removed unsupported marketing claims such as “safe Recovery Load”, “100% anonymous”, clinic-partner counts, and improvement percentages.
- Added an explicit “not a diagnosis / not medical clearance” message at the entry points and in consent copy.
- Converted the theme toggle, logo, workflow actions, recommendation cards, and bookmark controls to semantic controls.
- Added a keyboard skip link, visible `:focus-visible` styling, `aria-pressed` state for toggles, `role=progressbar`, and live error messaging.
- Increased interactive targets to at least 44px, improved form labels/IDs, and reduced truncation in recommendation cards.
- Simplified consent, check-in, and results surfaces to solid, high-contrast panels with responsive spacing.
- Added a `prefers-reduced-motion` fallback and removed the remote Lottie theme assets from the header.
- Updated the GitHub link to the Concussion-Recovery repository.

## Verification

```powershell
cd frontend
npm run lint
npm run build
$env:CAPTURE_URL='http://127.0.0.1:3001'
node scripts/capture-phase5.mjs mobile-check
```

The mobile capture reported `scrollWidth = 390px` at a `390px` viewport and `0 unnamed` buttons, so the primary flow has no horizontal overflow and all visible buttons have an accessible name.

## Pitch-deck screenshots

- Before: [`01-landing.png`](screenshots/phase5/before/01-landing.png), [`02-consent.png`](screenshots/phase5/before/02-consent.png), [`03-motivation.png`](screenshots/phase5/before/03-motivation.png)
- After: [`01-landing.png`](screenshots/phase5/after/01-landing.png), [`02-consent.png`](screenshots/phase5/after/02-consent.png), [`03-motivation.png`](screenshots/phase5/after/03-motivation.png), [`04-check-in.png`](screenshots/phase5/after/04-check-in.png)
- Mobile smoke captures: [`01-landing.png`](screenshots/phase5/mobile/01-landing.png), [`04-check-in.png`](screenshots/phase5/mobile/04-check-in.png)

## Manual accessibility checklist

- [x] Keyboard focus is visible on links, buttons, inputs, sliders, and language controls.
- [x] Skip link moves focus to `#main-content`.
- [x] Icon-only theme, bookmark, GitHub, and modal-close controls have accessible names.
- [x] Toggle and bookmark state is exposed with `aria-pressed`; language choices expose `aria-checked`.
- [x] Check-in progress exposes current step through `role=progressbar`.
- [x] Validation errors use an assertive live region.
- [x] Red-flag questions remain grouped in a labelled `fieldset` and are not inferred from severity sliders.
- [x] Layout was smoke-tested at 390px with no horizontal overflow.
- [ ] Run NVDA/VoiceOver manually in the final demo environment (screen-reader output depends on OS/browser settings).
