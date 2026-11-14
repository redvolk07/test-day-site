# 💗 Bestie Birthday Surprise Website

A complete interactive birthday scrapbook inspired by the supplied reference video.

## Fastest way to view it

**Double-click `Birthday-Surprise.html`.** It's a self-contained, offline-friendly website, including the original background song. Internet access is only needed for the optional Google handwriting fonts. The demo PIN is **1234**.

## Personalize the website

The editable source version uses four main files:

- `index.html` — all ten story scenes
- `styles.css` — pink scrapbook design and responsive layout
- `app.js` — password, navigation, candle, photo gallery, flowers and audio interactions
- **`site.config.js` — edit this first**. Update the name, nickname, age, date, four-digit PIN, notes, memories, photo paths, captions and music details.

To add your own photos, place them in `assets/`, for example `assets/bestie.jpg`, then change `avatarPhoto` and each memory's `photo` field in `site.config.js`. To use a song you have permission to use, place it in `assets/` and update `backgroundSong`. The included original instrumental, `assets/bestie-bloom.mp3`, is ready to play.

You can also upload photos or audio from inside the website while viewing it, but browser uploads in this demo **are temporary**. To make your changes permanent, put the files in `assets/` and update `site.config.js`.

When you finish editing, run `python build_standalone.py` from the website folder to rebuild the all-in-one `Birthday-Surprise.html` file. Requires Python 3 but no dependencies. Share that HTML file with your best friend.

## Open the editable multi-file version

Open `index.html` in your browser. Or, for local development, use:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## React + TypeScript companion

A React + TypeScript + Tailwind CSS + Framer Motion integration is provided in `react-version/`. This companion version uses the same fully functional DOM interaction engine and story markup mounted inside a React application. It's not a component-by-component React rewrite.

From `react-version/`, run:

```bash
npm install
npm run dev
```

To create a production build:

```bash
npm run build
```

This React integration has not been npm-built in this environment because package downloads were unavailable; the standalone version was visually checked on desktop and mobile, including navigation, keypad, candle, gallery and ending.

## How the surprise works

1. **Secret code** — PIN keypad, keyboard support, playful unlock animation
2. **Birthday reveal** — rainbow, confetti and animated greeting
3. **Birthday letter** — editable heartfelt message
4. **Make a wish** — tap five candles to blow them out
5. **Our memories** — photo gallery, tap-to-open lightbox, swipe support
6. **My wish for you** — scrapbook letter
7. **Flowers for you** — interactive bouquet and floating petals
8. **A little song** — custom music player with play/pause, seek, volume, and uploads
9. **One last message** — editable final letter
10. **Final surprise** — closing wish and replay button

The PIN is a playful storytelling gate, **not real content protection**: the code and content are accessible in local source files. Customize the four-digit PIN before sharing.

The website supports reduced-motion preferences, navigation by keyboard, and responsive mobile and desktop screens. No account, hosting subscription, or backend is necessary.
