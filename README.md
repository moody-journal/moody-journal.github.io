# Moody website

Source for https://moody-journal.github.io. App source: https://github.com/moody-journal/moody.

## Preview

Run `python3 -m http.server 8080` from this folder, then open http://localhost:8080. Use a server rather than opening `index.html` as a file: browser security blocks local-file JavaScript modules and backdrop capture. The static content still works without the interactive enhancements.

## Development

The site remains deployable directly from the repository on GitHub Pages. The committed `assets/js/experience.js` and `experience.css` are the production bundles. No hosting configuration change is required.

After modifying `src/`:

```sh
npm install
npm run build
npm run typecheck
npm test
```

`npm run watch` rebuilds interactive assets during development. Commit the rebuilt assets along with source changes. Privacy and support use the shared homepage identity plus `assets/css/reading.css` and the lightweight `assets/js/reading.js`.

## Design and interaction

- `DESIGN.md`: current dark visual direction and the user's selected hero composition.
- `INTERACTIONS.md`: A–F feel audit, gesture design, spring parameters, materials, implementation checklist, and screen-specific do/don't guidance.
- `ASSET_SOURCES.md`: frame artwork, fonts, and component provenance.
- `assets/css/marketing.css`: shared visual identity and homepage styling; `reading.css` supplies the policy/support layouts.
- `src/experience.tsx`: React islands for the hero, swipe gallery, mood preview, and breathing.
- `src/breath-orb.ts`: native Swift BreathOrb/particle animation translated to Canvas, with a 4–4–6–2 breathing rhythm.
- `src/mood-model.ts`: continuous mood geometry, color interpolation, momentum projection, edge resistance.
- `src/material.ts`: exact dark-theme Rainbow glass settings and explicit lighting overrides.
- `src/components/soap-bubble/`: installed ReactDrops source, preserved as the renderer's source of truth.

## Product truth

The homepage advertises the iPhone app while preserving Coming Soon status, iOS 27 support, and Apple Intelligence compatibility requirements. It describes multiple medals per entry without revealing any of the 36 medal designs or unlock conditions. The Mood Meter preview does not save data. No account, analytics, advertising, external AI request, email signup, or fake App Store button is introduced.
