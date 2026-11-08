# Moody fluid-interface handoff

Product/screen: Moody's app marketing homepage. Platform: iOS-inspired web. Focus: continuous Mood Meter, finite screenshot carousel, press feedback, hero scroll continuity. Stack: static HTML/CSS with React 19, Motion, and the installed ReactDrops Bubble UI. Theme: dark, selected by the user; Rainbow glass uses the catalog's dark defaults plus the supplied lighting overrides.

## A. Feel audit

Scores are engineering/design assessments, not measured Apple conformance or hardware performance ratings. “Before” refers to the first local homepage redesign in this chat.

| Dimension | Before | Implemented | Evidence |
|---|---:|---:|---|
| Response | 2/5 | 4/5 | Original buttons relied on hover/click. CTAs now spring on pointer-down; glass thumb expands on down; gallery accepts new input while settling. No measured input-to-photon claim. |
| Directness | 1/5 | 4/5 | Original gallery used buttons/scroll only and the range had seven stops. Gallery captures the pointer and preserves the grab offset; native range now accepts 0.01 increments across 0–100. A real pointer drag produced 82.67. |
| Interruptibility | 2/5 | 4/5 | CSS phone rotation and image replacement became a live Motion value rail. A new grab stops the current spring at its displayed position; buttons retarget the same value. Controls are never locked. |
| Spring behavior | 1/5 | 4/5 | Position uses an explicit critically damped spring; release velocity projects the snap target. Only momentum-bearing releases can have mild overshoot. |
| Spatial consistency | 3/5 | 4/5 | Screenshots remain in one finite horizontal rail rather than replacing images in-place. Forward and backward movement share one coordinate system; selected-pill motion stays in its navigator. |
| Materials | 2/5 | 4/5 | A dark translucent toolbar and a locally captured, refractive ReactDrops thumb replace decorative generic glass. Reading surfaces remain solid. The shader reports ready in desktop and mobile viewport checks. |
| Reduced motion | 3/5 | 4/5 | System preference feeds the same still-state used by the tested footer pause control. Hero offset, gallery snapping, breathing and shape spring all have immediate alternatives. Input and labels remain available. Physical iPhone Safari testing is still recommended. |

## B. Interaction redesign

### Primary: Mood Meter

1. Pointer-down: native range begins direct tracking; the thumb expands from its live presentation size through a critically damped spring. The installed renderer retains its own pointer wobble, press response, refraction and reflections.
2. Drag: the thumb tracks the native input's position, without an extra positional spring. Values stay continuous (`step=0.01`, range 0–100). The shape uses a fast critically damped follower; colors and radial geometry interpolate continuously between adjacent anchors.
3. Release: the slider retains the exact selected value. No momentum is added to an emotional selection and it never snaps to a whole mood. The thumb springs back to its resting size.
4. Interrupt/reverse: the native input accepts reversal immediately; the shape and press springs retarget live values. A second press catches the thumb's current size rather than restarting a canned animation.
5. Edges: clamp the meaningful value at 0 and 100; do not show an impossible mood beyond the axis. The thumb's deforming glass supplies edge softness without falsifying the selected value.
6. Keyboard: arrows change 1 point; Shift+arrow and PageUp/PageDown change 10; Home/End select endpoints. The value text exposes the mood name. Keyboard adjustments retain fractional state rather than coercing a whole mood.
7. Reduced motion: no shape follower lag or spatial press expansion; paint the new shape immediately. The native input, output label, focus indicator, and static glass/CSS material remain usable.

### Secondary: screenshot gallery

1. On primary left-button pointer-down, stop the current rail spring and record its live x and pointer origin. Capture the pointer. Keep `touch-action: pan-y` so native vertical scrolling remains available.
2. Wait for 10px horizontal intent. If vertical movement wins first, cancel the gallery recognizer, release capture, and restore its selected rest position. Other pointers are ignored while one owns the gesture.
3. During a recognized horizontal drag, x follows `liveOrigin + pointerDelta` 1:1 inside the bounds. Track release velocity using pointer samples; use a weighted low-pass estimate.
4. At release, discard velocity after an 80ms stationary hold and cap it at ±2400px/s. Project `xProjected = x + v/8`, the integral of exponential velocity decay `v(t)=v0*exp(-8t)`. Snap to `round(-xProjected/spacing)`, clamped to the valid slides in the current gallery.
5. Hand the sampled velocity into the settling spring. A new press stops it at the live x, preserving the grab offset. Selecting another feature retargets from the same presentation value and current velocity.
6. Beyond the endpoints use `edge + sign(d)*90*(1 - 1/(abs(d)/90 + 1))`. Displacement approaches a 90px asymptote rather than a hard wall.
7. Pointer cancel/lost capture returns to the last committed slide with zero release velocity. The dragging state always clears. Resize stops a pending gesture and aligns the selected slide to the new spacing.
8. Buttons and Left/Right/Home/End navigation provide equivalent access. Reduced motion uses immediate snapping on release; active direct dragging remains available.

## C. Motion spec

| Behavior | Properties | Parameters | Velocity/overshoot |
|---|---|---|---|
| Hero scroll continuity | translateY only; upright device retained | mass 1, stiffness 247, damping 31.43; damping ratio ≈1, response convention ≈0.4s | Motion follows the scroll value. Range 0 to −65px. No bounce. |
| Gallery settle / reversible selection | translateX; derived scale 1→0.82, opacity 1→0.45, rotation capped ±8° | mass 1, stiffness 247, damping 31.43 | Button retargeting inherits current velocity with critical damping. Gesture release hands off sampled px/s. |
| Momentum-bearing gallery release | same rail | damping 27.7 when explicit release speed exceeds 500px/s; stiffness 247 | Ratio ≈0.88; mild overshoot is allowed only for this causal release. |
| CTA feedback / navigator pill | scale 1→0.965 (CTA); 1→0.95 (selector); shared pill x/size | mass 1, stiffness 247, damping 31.43 | Acknowledge down on the next animation frame. Retarget live state on release/cancel. |
| Slider thumb press geometry | width/height multiplier 1→1.45 | mass 1, stiffness 247, damping 31.43 | Motion value; source CSS transition is overridden only for this integration. Installed optical press/wobble code is intact. |
| Mood geometry/color follower | SVG path coordinates + fill interpolation | mass 1, stiffness 900, damping 60; ratio 1 | Fast follower only for artwork, never for thumb position. Retargets continuously; no whole-state snap. |
| Native BreathOrb preview | Canvas particle positions, radius, trails, glow and hue; phase text below | Swift port: 120 particles, 8-point trails, double-sine phase envelope | 4s inhale, 4s hold, 6s exhale, 2s hold. Time-normalized particle velocity. Suspend offscreen/hidden and freeze on pause; static ring for initial reduced motion. |

Apple-style “response” is an interpretation of a spring frequency convention, not a guarantee of a fixed completion duration. These physical springs settle according to distance and velocity.

Do not implement gallery translation, press/release, slider shape morphing, or thumb press geometry with CSS keyframes or CSS transitions. The scope-specific selector removes the catalog thumb's CSS size transition; the installed source itself is unmodified. CSS transitions are used only for non-geometric color feedback. No automated section entrance choreography is required for reading.

## D. Materials & hierarchy

- **Solid:** charcoal page, near-black screenshot stage, plum mood stage, sage breathing layers, warm achievement chapter, all text-heavy sections. Clear hierarchy comes from contrast, spacing and product imagery.
- **Translucent:** sticky toolbar uses a single 24px backdrop blur at 82% dark opacity. No second glass layer under it. Native app toolbar glass inside a screenshot remains part of the screenshot.
- **Refractive:** only the Mood Meter thumb uses ReactDrops material with the local mood playground as its backdrop. The shared renderer, thin-film interference, drainage, Marangoni swirl, upright/inverted reflections, mirrored rims, spectral dispersion, liquid blend and track lens are preserved.
- **Rainbow settings:** glass .95; iridescence 2; filmScale 4.85; oilOpacity 1; oilCoverage 1; oilEdge 18; oilEdgeFade 1; clearCenter .73; thickness 480; drainage .35; swirl .5; reflectivity 1.3; refraction .15; dispersion 1; bevel 14.
- **Explicit user overrides retained:** windowLength 1.3; windowMargin .85; windowBend .75; windowSize .75; windowWidth .8; windowGradient .96; windowHead .7; windowTail .6; glintSize 1.65; glintIntensity **0**; glintDistance −.45; glintHeight .65; windowIntensity .85; windowTwin false; bottomShadeColor #ffffff.
- **No scrim:** this is a browsing and exploration surface; no modal is needed. The gallery can darken peripheral screenshots without obscuring navigation.
- **Depth:** large hero device uses a 25px offset/32px soft shadow at low contrast on the dark ground. Gallery phones use 28px offset/25px blur. The small thumb keeps the catalog's bevel/reflection/shadow weighting rather than inheriting the hero shadow. Avoid full-page blur or full-screen WebGL.

## E. Implementation checklist

- [x] Install the exact ReactDrops registry component with the requested shadcn command; retain downloaded source and license notice.
- [x] Configure dark-theme Rainbow defaults without replacing the explicit lighting or zero-value overrides.
- [x] Preserve the shared WebGL renderer and local backdrop capture; self-host fonts to remove cross-origin capture errors.
- [x] Native range for direct tracking and platform cancellation; 0.01 value increments; useful 1/10-point keyboard adjustments; accessible mood text.
- [x] Interpolate both SVG geometry and RGB colors continuously across all mood boundaries; test continuity at those boundaries.
- [x] Pointer Events, primary pointer ownership, pointer capture, 10px directional threshold, vertical-scroll cancellation, lost-capture handling, bounded rubber-band and velocity projection for the gallery.
- [x] Retarget existing Motion values rather than disabling controls or restarting from endpoints.
- [x] Keep hero upright and oversized per the user's screenshot; use calibrated transparent bitmap artwork instead of CSS shells.
- [x] Disable decorative movement with the system preference and footer control; stop the breathing phase timer offscreen.
- [x] Retain the component's CSS fallback and add a visible fallback track if WebGL is unavailable. All product copy and preview substitutes remain visible without JavaScript.
- [x] Optimize homepage screenshot derivatives and icon sizes without modifying the originals.
- [x] Commit production bundles so existing GitHub Pages hosting continues to work. Preview through localhost/HTTPS rather than a local-file URL.
- [x] Build, strict type check, continuity/momentum/resistance tests, desktop/mobile screenshots and browser interaction checks.
- [NEEDS INPUT] Physical iPhone/Safari performance signoff on the oldest supported target device. No physical-device frame-rate claim is made from desktop viewport emulation.
- [NEEDS INPUT] Real App Store URL and release status when available. Until then keep Coming Soon and the GitHub journey link.

### Verification observed

- Browser viewports: 1440×900, 390×844, and 320×740. Mobile scroll width matched viewport width.
- Glass renderer `data-soap-bubble-ready` was true on desktop, 390px and 320px previews.
- Real pointer drag changed the range to a fractional 82.67 and cleared the active press state after release.
- Real horizontal pointer drag advanced the gallery from Mood insights to A fresh start, then Home selected Journal.
- Keyboard arrows changed the range value; the pause control set `aria-pressed=true`, stopped decorative motion, and switched smooth navigation to instant behavior.
- Seven model tests pass, including the native breathing phase schedule, envelope, and particle initialization, plus: continuity across every interior anchor, fractional morphing, velocity-projected snap, bounded edge resistance. Strict TypeScript and production bundle build pass.
- The installed CSS fallback and reduced-motion routing are present. A physical low-end iPhone, Safari, and forced no-WebGL session are not claimed as tested.

## F. Do / Don't

### Do

1. Keep the hero phone upright and cropped, matching the user's selected composition.
2. Let the slider stop at any fractional position; blend the shape and color around that exact feeling.
3. Preserve the user's explicit zero glint intensity while using dark Rainbow glass on this dark site.
4. Let a horizontal swipe carry the gallery into its next screenshot, and let a new grab catch it immediately.
5. Keep the local preview unsaved and the launch CTA honest: Coming Soon until a real release exists.

### Don't

1. Restore seven whole-state stops or animate the native thumb toward a lagging position.
2. Replace ReactDrops film/refraction with a generic blurred white capsule or reset optical settings to an approximate preset.
3. Add a scrim or modal just to browse screenshots, or make page scrolling advance the gallery against the user's intent.
4. Fabricate device shells with borders and a pill-shaped pseudo-element, list undisclosed medal unlock conditions, or imply the third-party frame is official Apple artwork.
5. Reintroduce tilted hero devices, repeated entrance animations, automatic media playback, or a file-URL workflow that prevents the interactive code from loading.

References: [Motion drag](https://motion.dev/docs/react-drag), [Motion animate](https://motion.dev/docs/animate), [ReactDrops registry](https://reactdrops.dev/r/soap-bubble.json), [frame artwork and measurements](https://tryhoverify.com/tools/device-frames/iphone-17-pro/). Spring principles and specified optical settings came directly from the user's brief; no HIG page numbers are asserted.

## Reading-page follow-through

Privacy and Support now inherit the dark identity and self-hosted fonts through `marketing.css`, with route-specific reading layouts in `reading.css`. Policy sections remain visible by default; desktop uses a sticky contents list, mobile uses an inline native disclosure with keyboard focus handoff to the selected section. The original 19 privacy paragraphs/list items and all eight support paragraphs/list items are preserved. Support includes a tested copy-email action with a selection fallback and status feedback. No new message is sent.

The user subsequently requested the remaining supplied screenshots: journal export and entry analysis now appear in the main showcase; medal shelf and detail appear in the achievements showcase. This supersedes the earlier blanket restriction on showing medal artwork. The hero composition remains unchanged.
