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

## Coverage map

`/service-centre/map` carries **two** maps behind a switch, following the draft.
Reached from the service-centre band on the home page and from the
`/service-centre` directory. Both read one dataset — `regions[].centres` in
`src/lib/site.ts`, which holds `lat`/`lng` for the geographic map and `nx`/`ny`
for the network map. Coordinates are town-centre positions, not branch
addresses.

**Network map** (`components/network-map.tsx`, the default view) is a server
component: SVG and CSS, no JavaScript, so it paints on the first frame.

- The dot field is one `<path>` of 1,949 zero-length dashes with a round
  linecap, in `src/lib/netmap-dots.ts`. It is ~31 KB of markup that compresses
  about 10:1, so the page is ordinary over the wire. Keep it inline — an
  external asset is one more thing that can fail to render.
- Arc geometry is derived from the coordinates at build time. The draft built
  them with DOM calls; there is no reason to.
- **The static state is the complete state**: arcs rest fully drawn and nodes
  visible, with the animation only replaying that arrival. Reduced motion
  switches all of it off, and the map still has to read.

**Geographic map** is Leaflet, constructed only when that view is selected.

- Leaflet touches `window` on import, so `components/coverage-map.tsx` imports
  it **inside** `useEffect`. That keeps the route prerendering like every other.
- Markers are `L.divIcon`, not Leaflet's default: the stock icon resolves image
  paths relative to its own CSS and breaks under bundling. The pin is a round
  badge (`.sc-pin` in `globals.css`) carrying a lucide glyph — `map-pin`, or
  `building-2` plus a pulse ring for Puchong. The two glyphs are **inlined as
  SVG strings** in `coverage-map.tsx` because `divIcon` takes HTML, not a React
  node; re-copy them from `lucide-react` if that dependency is upgraded.
- Three marker states — rest, hover, selected — and the selected one is driven
  through `setIcon`, never by adding a class to the element. Leaflet re-creates
  marker DOM on zoom and would wipe it.
- Only the selected centre's tooltip is `permanent`. Panning and the state
  layer's tooltip churn can close it, so a `zoomend moveend dragend` handler
  re-opens it; that handler is registered once and reads the selection through
  `activeRef`.
- Opens at zoom 6, not the draft's 5: Malaysia's ~19° of longitude is only
  ~430px at zoom 5 and reads as a small island in the middle of a wide stage.
  Zoom 6 needs ~865px to fit the country, so a container narrower than 880px
  opens at 5 instead of showing a cropped Malaysia.
- Clicking a **pin** only selects — it deliberately does not `setView`, so the
  whole country stays in frame. Clicking a **directory entry** selects *and*
  flies, to `max(zoom, 7)`.
- State boundaries come from `public/geo/malaysia-states.json`, fetched lazily
  and drawn under the markers (`bringToBack`), with an orange hover fill and
  the state name on a sticky tooltip. The tiles carry no labels, so this is
  what makes the map read as Malaysia. It is GADM 4.1 level-1, reduced to
  `name` + geometry and simplified (RDP, ~1.1 km; islets under ~50 km² dropped)
  from 343 KB to 45 KB. Serving it from `public/` rather than GADM's host —
  which the draft fetches live — keeps CARTO the only runtime third party and
  means a slow academic server can never hold up the map. A failed fetch is
  swallowed; the markers stand on their own.
- Tiles come from CARTO — the site's only runtime third-party request. The OSM
  and CARTO attribution control is required by their terms; leave it in place.

The centre directory under the maps is server-rendered and is the real content;
both maps are enhancement. Selecting a centre there switches to the geographic
map and flies to it.

## Contact form

`components/enquiry-form.tsx` composes a structured message and hands it to the
visitor's mail client via `mailto:`. There is no backend — if one is added,
replace the `mailto:` with a server action and keep the `aria-live` status.
