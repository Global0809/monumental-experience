# MONUMENTAL · Enter the World

An immersive creative brand presentation adapted from the designer-supplied Hoyo Jerez reference. The existing tunnel, camera movement, animated characters, scene transitions, installations, navigation and controls are preserved. Identity, artwork, environmental branding, sound and film now belong to the MONUMENTAL creative direction.

## Run locally

Requires Node.js 20.11 or later. No runtime package installation is needed.

```sh
npm run build
npm run dev
```

Open http://127.0.0.1:4175. Use an HTTP server so JavaScript modules and 3D assets can load.

## Explore

Press the illuminated 3D button to enter with sound, or choose **Enter without sound**. Scroll or swipe through the tunnel. The menu opens Work, Visuals and Connect. The three collection stands open their visual studies. The visual sphere opens the archive. Detail pages retain the grid-size control and full-screen image viewer, including arrow keys and Escape.

Desktop audio controls include play/pause, previous/next chapter, mute and volume. Portrait mobile layouts retain compact previous/play/next controls. The soundtrack is a locally served, original 240-second procedural ambient score with eight chapters; it contains no artist recordings.

Reduced-motion mode provides a normal entrance button and still decorative video frames. When WebGL is unavailable, /discover.html offers a lighter collection page that also works without JavaScript.

/preview.html presents the sixty-second **MONUMENTAL brand film**. It is an authored visual film, rather than a recording of site navigation. Its media file retains the legacy walkthrough.mp4 filename for compatibility.

## Collections

All eleven collections are creative studies dated 14 November 2026. The archive is illustrative and makes no claim of completed client campaigns. Legacy route and asset IDs are retained so existing links continue to resolve.

WORLD, FREQUENCY, AFTER DARK, CINEMA, CULTURE, ORIGIN, THE PORTAL, TIME MACHINE, DREAMSTATE, KINETIC and HORIZON form the visual archive. The existing year and month filters remain available.

## Build and hosting

npm run build creates out/. npm run build:pages creates pages-out/ for the MONUMENTAL GitHub Pages address by default. Set PAGES_BASE_PATH=/the-weeknd-enter-the-night/ when publishing the compatible existing address.

- Website: https://global0809.github.io/monumental-experience/
- Public source: https://github.com/Global0809/monumental-experience
- Existing address retained: https://global0809.github.io/the-weeknd-enter-the-night/

- source/: editable production HTML, modules, styles and assets.
- source-routes/: direct gallery-detail HTML entries.
- scripts/build.mjs: copies the referenced local asset graph and creates route directories.
- scripts/check.mjs: syntax, metadata, zoom and content checks.
- scripts/serve.mjs: local server with media MIME types and byte ranges.
- worker/index.js: media range support for native hosting.
- source/assets/audio/playlist.json: chapter timing and audio provenance.
- source/assets/media/video-sources.json: brand-film and decorative-video provenance.

No official external client website, email or social account was supplied. Connect and footer destinations therefore point to working internal pages.

## Credits and verification

Interactive reference: [Hoyo Jerez](https://hoyojerez.com/), supplied by its designer for this adaptation. See ASSET-NOTES.md for the asset treatment and QA.md for verification boundaries. Physical-device performance remains unmeasured.
