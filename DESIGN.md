# Moody website design

## Direction

A dark, Apple-inspired product website for Moody. The user selected the oversized upright iPhone composition from their November 8 screenshot: headline on the left, a large phone on the right, cropped at the bottom. Preserve that composition, the app icon, the Moody wordmark, the headline “A little more you.”, and real in-app screenshots. Do not restore the previous tilted phone, background shape, or three-phone hero fan.

## Palette and type

Charcoal `#101014` is the primary ground. `#09090c` frames the screenshot gallery; `#19151f` frames the interactive mood preview. Lavender headings, sage breathing cues, and warm muted gold for achievements provide distinct chapters while retaining a dark page. Breathing now uses the app’s native cyan-to-violet particle palette. Off-white is the primary text and CTA surface. DM Sans (400/500/600) and the existing Fraunces wordmark are self-hosted; keep their OFL notices.

## Composition

Generous editorial spacing, restrained UI chrome, and large app proof. The screenshot gallery has a finite horizontal rail and explicit feature selectors; it does not auto-advance or hijack scrolling. The hero phone translates slightly with scroll while staying upright. All page content and the hero substitute remain visible without JavaScript.

## Materials

Use the installed ReactDrops Bubble UI source under `src/components/soap-bubble/`. The site is explicitly dark, so use the catalog Rainbow glass defaults and the user's explicit lighting/reflection overrides in `src/material.ts`. Preserve zero values. The optical renderer, shared WebGL context, backdrop capture, film effects, reflections, and vendor fallbacks remain intact. A local integration spring replaces the thumb's CSS size transition. Keep actual copy surfaces solid; only the sticky navigation and the slider thumb are translucent. No scrim.

## Motion

See `INTERACTIONS.md` for the A–F audit, engineering spec and validation. Pointer-driven values use Motion values and springs, not CSS keyframes. Shapes interpolate continuously through the whole range; only their human-readable mood names change discretely. Gesture interruption never disables controls. Respect system reduced motion, the footer pause control, native vertical scrolling, pointer cancellation, keyboard input, and offscreen animation suspension.

## Product constraints

Keep launch status Coming Soon, the iOS 27 and Apple Intelligence requirements, and the ability to save/retry when analysis is unavailable. Never reveal the medal collection artwork or unlock conditions. Privacy and support share the new dark navigation, locally hosted typography, reading scale and footer. The privacy policy keeps all nine legal sections and its existing date, with a sticky desktop contents list and an inline mobile disclosure. Support provides a direct email link, copy action, and problem-reporting guidance. No invented launch date, pricing, testimonials, email signup, or App Store link.

## Device artwork

The transparent iPhone 17 Pro Silver asset is third-party device artwork from Hoverify, with screen bounds calibrated to its published 1332×2748 frame and 1206×2622 screen. It replaces the previous CSS phone approximation. It is not Apple's official bezel asset. Source and terms are recorded in `ASSET_SOURCES.md`.

## Native breathing preview

`src/breath-orb.ts` translates the supplied Swift BreathOrb and BreathParticle code: 120 particles, chaos-to-circle interpolation, eight-point trails, glow, phase hues 185/200/270/240, and a 4–4–6–2 cycle. Phase labels sit below the canvas as in the app. Rendering uses a visibility-aware animation loop and a device-pixel-ratio cap. The redundant slider caption has been removed.
