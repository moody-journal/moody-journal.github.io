# Website asset sources

## iPhone frame

- File: `img/iphone-17-pro-silver.webp`.
- Source: https://tryhoverify.com/tools/device-frames/iphone-17-pro/
- Asset: https://tryhoverify.com/images/devices/iphone_17_pro/silver.webp
- Terms: https://tryhoverify.com/tools/device-frames/license/
- This is Hoverify's bitmap illustration of the physical device, not Apple's official artwork. The license permits use in a finished website. Do not offer the asset as a reusable frame pack or mockup generator.
- Published bounds: 1332×2748. Screen: 1206×2622, origin (63,63), corner radius 186px. CSS positions the original screenshot at those exact ratios.
- Apple's official bezel download was not used because opening it presented a separate license-acceptance step.

## ReactDrops Bubble UI

- Installed with `npx shadcn@latest add https://reactdrops.dev/r/soap-bubble.json --yes` on November 8, 2026.
- Source: https://reactdrops.dev/r/soap-bubble.json
- Component version from the registry: 0.1.0.
- Source files are retained under `src/components/soap-bubble/` with their ReactDrops Component License notice in `LICENSE.txt`.
- Integrated into this Moody website, not redistributed as a component library or template.
- The imported optical renderer is unmodified. Integration settings are in `src/material.ts`.

## Fonts

DM Sans and Fraunces from Google Fonts; self-hosted under `assets/fonts/` with their OFL license files. Self-hosting avoids third-party font requests and lets the ReactDrops backdrop capture read the stylesheets.

## Product media

The original Moody app icon and screenshots in `img/` and `demos/` are preserved. Resized JPEG/PNG derivatives in `assets/media/` reduce homepage transfer size without changing the artwork. The user-approved medal shelf and detail screenshots are shown in the achievements gallery. Standalone medal renders and a full unlock-condition catalogue are not used.

## Additional user-supplied screenshots

The insights showcase now uses the Mood screen supplied by the user on November 8, 2026, captured on an iPhone Air. The original is retained as `demos/Moody_MoodInsights_October.png`; its optimized homepage derivative is `assets/media/mood-insights.jpg`. The selected hero remains unchanged. The later user-approved medal screens are used in the achievements gallery.

The user subsequently requested the remaining supplied screenshots: journal export and entry analysis now appear in the main showcase; medal shelf and detail appear in the achievements showcase. This supersedes the earlier blanket restriction on showing medal artwork. The hero composition remains unchanged.
