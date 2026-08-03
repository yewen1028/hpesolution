# HPE Solutions — marketing site

Next.js 16 (App Router, Turbopack) + React 19 + Tailwind v4 + `lucide-react`.
Static marketing site for HPE Solutions Sdn Bhd, a Malaysian IT support and
managed-services company. No backend, no database — every route prerenders.

> This is Next.js **16**. Read `node_modules/next/dist/docs/` before writing
> code; `next lint` is gone, Turbopack is the default builder, `params` is a
> Promise, and `images.qualities` defaults to `[75]`.

## Commands

```bash
npm run dev      # http://localhost:3000
npm run build    # prerenders all 19 routes
npm start        # serve the production build
npx eslint .     # `next lint` was removed in v16
```

## Content

**All copy and every figure lives in `src/lib/site.ts`.** Services, case
studies, service-centre regions, partners, stats and contact details are typed
data consumed by the components. Change content there, not in JSX.

Factual details (service scope, coverage, node counts, addresses) come from
hpe.com.my. The connective prose is written for this build.

## Design system

Tokens are declared in `@theme` in `src/app/globals.css`. Use them; do not
hardcode hex values.

- **Brand orange `--color-brand` #f26f21 is an accent, never a background
  wash** — rules, eyebrow marks, icons, active nav states, and one primary
  action per view. Everything else is warm white (`--color-paper`,
  `--color-paper-warm`) or near-black (`--color-ink`, `--color-paper-deep`).
- Type: `--font-display` (Archivo) for headings, `--font-sans` (Inter) for
  body. Use the `.display-1` / `.display-2` / `.display-3` / `.lede` classes
  rather than per-heading font sizes.
- `.eyebrow` is the small uppercase section marker with the leading orange rule.
- **Grids are drawn with hairlines, not cards.** The pattern: the container
  supplies `border-l border-t`, each cell supplies `border-r border-b`. No
  `nth-child` arithmetic — it breaks at different column counts. Where a
  trailing row would be ragged, fill it (see the CTA panel in
  `sections/services-grid.tsx`).
- **Icons only, never emoji.** `lucide-react`, `strokeWidth={1.5}` for feature
  icons, `2`–`2.5` for inline UI. Always `aria-hidden="true"`.

## Motion

- `components/parallax.tsx` — a **single** rAF loop drives every layer. Layers
  register on mount and unregister on unmount. Reads are batched before writes.
  Don't add per-element scroll listeners.
  `speed` is total drift in px across a viewport of scrolling; `Parallax`
  oversizes itself by that amount so drift never exposes an edge.
- `components/reveal.tsx` — `IntersectionObserver` reveal with a **2.5s
  safety-net timer**. Content starts hidden in CSS, so anything animated needs
  that net or it can stay invisible. Keep the `<noscript>` override in
  `layout.tsx` in sync.
- Everything bails out under `prefers-reduced-motion: reduce` — with one
  deliberate exception, `components/partner-carousel.tsx`. Windows reports
  reduced motion whenever `SPI_GETCLIENTAREAANIMATION` is 0, which is routinely
  the case on low-powered laptops, and a carousel that has stopped reads as a
  broken section rather than a considerate one. It therefore drives its own
  transform from `requestAnimationFrame` when CSS animation is disabled. The
  draft in `HPE - refined/hpe-enhanced-editing.html` does the same thing for the
  same reason. Do not copy this pattern elsewhere without the same
  justification.

## Splash screen

Shows **once per browsing session, on first entry only**. An inline script in
`<head>` (`splashBootScript`) runs before first paint and sets
`html.splash-pending`; `src/app/splash.css` does the hiding so a returning
visitor never sees a flash. `SplashScreen` clears the flag after the intro.
Do not convert this to a `useEffect`-only check — that reintroduces the flash.

## Media

`public/media/` — Pexels stills, downloaded by `scripts/fetch-media.mjs`, plus
one background video.

**Every image was checked by eye against the section it serves.** Pexels ids
are not self-describing and several plausible-looking ids turned out to be
unrelated subjects. If you change an id, download it and *look at it* before
committing, and update the `alt` text with it.

The background video is lazy-loaded by `components/video-band.tsx` — it only
fetches once near the viewport and never plays under reduced motion, so the
poster has to stand on its own.

### Partner logos

`public/media/logos/` — partner brand marks for the business-partner carousel,
downloaded from Wikimedia Commons by `scripts/fetch-logos.mjs` as rendered PNGs
and registered in `partnerLogos` in `src/lib/site.ts`.

The same eye-check rule applies, and it bites harder here: searching Commons for
"Ruckus Networks" returns a photo of their head office, and Simple Icons' `amp`
is Google AMP, not the cabling brand. **Open every file before committing it.**

Eleven of the seventeen partners have a mark. AMP, Cyberoam, Dintek, Peplink,
Ruckus and Sangfor have none that could be sourced, and render as typographic
wordmarks in the same bubble. To add one, drop the file in and add a line to
`partnerLogos` — the carousel needs no change. The authoritative source is the
logo pack each principal issues to authorised partners; prefer it over Commons,
and check each principal's brand guidelines for usage terms.

### Replacing an image at an existing path

Next's image optimizer caches on disk keyed by path, with a 4-hour default TTL,
so a same-path replacement will keep serving the old picture:

```bash
rm -rf .next/cache/images
```

## Contact form

`components/enquiry-form.tsx` composes a structured message and hands it to the
visitor's mail client via `mailto:`. There is no backend — if one is added,
replace the `mailto:` with a server action and keep the `aria-live` status.
