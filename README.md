# Moody website

Static source for https://moody-journal.github.io. The app source is at https://github.com/moody-journal/moody.

## Preview

Run `python3 -m http.server 8080` from this folder, then open http://localhost:8080.
There is no build step. GitHub Pages serves the site from the main branch.

## Medal assets

`img/medals/` contains all 36 transparent 512-pixel renders of the app's current USDZ medals, including the refined contrast on pale medals. Gallery cards are in `index.html` so they work without JavaScript. The expanded collection uses native HTML details. Images are lazy-loaded with explicit dimensions.

`assets/audio/medal-chime.wav` is the current app chime and plays only on request.

The site describes iOS 27 support and multiple medals per entry. Availability remains Coming Soon until an App Store release is confirmed. Existing journal and mood screenshots remain in demos/.
