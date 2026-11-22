# Maintaining the profile

The profile README is a short introduction. `docs/` contains the fuller, buildless portfolio for GitHub Pages. All artwork is original and stored in this repository; there are no third-party animation widgets, trackers, fonts, or runtime packages.

## Update content

Edit `README.md` and the semantic sections of `docs/index.html`. Job titles and dates were checked against Faizan's LinkedIn profile on 22 November 2026. Project descriptions were checked against the public LocalCoder, ESP32OS, and Aether Launcher READMEs on the same date. Update the visible content date when refreshing those sections. Availability currently says **open to collaboration**, as in the original README; it does not claim job-seeking status.

The **Refresh GitHub activity** button fetches public star counts and push dates on demand. Career information is maintained manually. No background sync, schedules, or watchers are installed.

## Preview and check

From the repository root:

```sh
python3 -m http.server 8765 --directory docs
node --test tests/physics.test.mjs
node --check docs/app.js
```

Visit `http://localhost:8765`. Check desktop and narrow screens, dragging and throwing, touch input, tap-to-kick, keyboard arrows and Enter, the scroll-triggered entrance, and the header Pause motion control. Reduced-motion preferences start the site paused. Offscreen or hidden playgrounds stop rendering. Project content and links remain available without JavaScript.

The balls drop in staggered waves when the playground first scrolls into view. There are no playground control buttons; people interact directly with the balls. The physics uses bounded fixed time steps, circle collisions, damped boundary impacts, and pointer capture. Keep pointer cancellation distinct from release so interrupted touches do not trigger a throw. Use `textContent` for GitHub API data rather than interpolating it into HTML.

## Rebuild README artwork

Use a Python virtual environment with `Pillow==13.0.0`, then run:

```sh
python scripts/render-profile.py
```

The renderer uses Arial on macOS. On other systems, set `PROFILE_FONT_DIR` to a directory containing `DejaVuSans.ttf` and `DejaVuSans-Bold.ttf`. Both GIFs have still PNG alternatives, selected automatically in the README for reduced-motion browsers where GitHub supports the media query, and linked directly as a fallback.

## Publish

The `docs/` directory is the portfolio source. GitHub Pages publishes a separate `gh-pages` branch containing only the static site. To publish a committed update, run `git subtree split --prefix docs HEAD`, then push the resulting commit to `origin` as `gh-pages` (a normal, non-forced push). Pages serves the root of that branch. If a normal push is rejected, inspect the newer publishing branch and reconcile it before retrying; do not overwrite it.

The portfolio files are `index.html`, `style.css`, `app.js`, and `physics.mjs`; the preview needs no build or installation step. No custom deployment workflow or scheduled automation is installed. Keep the README links and Pages URL aligned with `https://faizannazir.github.io/faizannazir/`.
