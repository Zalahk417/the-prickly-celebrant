# The Prickly Celebrant

Production source for **The Prickly Celebrant** website.

## Live site

`https://the-prickly-celebrant.pmhaik.workers.dev`

Cloudflare deploys automatically from the `main` branch.

## Canonical project structure

- `index.html` — main scroll-driven website
- `linda.html` — Linda profile page
- `app.css` — **single production stylesheet**
- `script.js` — **single production interaction script**
- `assets/` — original artwork and approved brand assets
- `_headers` — static security/cache headers

There is no build step and no framework. The website is plain HTML, CSS and JavaScript.

## Design system

The website is built around the supplied Prickly artwork:

- warm cream/sand background
- black editorial typography
- Prickly red accents
- illustrated cactus/stone-path landscape
- torn-paper content cards
- progressive landscape reveal while scrolling
- fixed cactus-style Menu and Contact controls

The desert path is the visual environment rather than a conventional section background. Content should remain compact enough that the illustrated journey stays visible.

## Key assets

- `assets/02_desert_path.jpeg` — master scrolling landscape
- `assets/10_logo.png` — Prickly Celebrant logo
- `assets/prickly-menu.svg` — Prickly Menu logo
- `assets/01_infinity_couple.jpeg` — closing artwork
- `assets/03_cactus_bowl.jpeg` through `assets/09_services_poster.png` — source artwork library

Do not recreate the Prickly Menu logo with CSS or JavaScript. Use the approved asset directly.

## Editing rule

Future visual changes belong in `app.css`. Do not add `latest.css`, `polish.css`, `hotfix.css`, dynamically injected stylesheets or temporary override files.

Future behaviour changes belong in `script.js`. Do not use JavaScript to swap brand asset filenames.

## Deployment

Push to `main`. Cloudflare Workers Builds is connected to this repository and publishes automatically.
