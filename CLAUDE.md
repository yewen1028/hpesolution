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

## Header

`components/site-header.tsx` is **two stacked rows** inside one fixed element:
`components/top-bar.tsx` (the email and phone number, near-black) above the nav
row (logo, navigation, toggles, phone CTA).

Four tokens, and which one to reach for is the whole of it:

- `--topbar-h` (36px) and `--nav-h` (76px) — the two rows.
- `--header-h` = their sum. The **layout constant**: what `main` pads by, and
  the only thing that may assume the header is at rest. It is a `calc()` now,
  so `parseFloat(getPropertyValue("--header-h"))` is `NaN` — script that needs
  the number adds the two rows up instead (see `measure()` in the header).
- `--nav-h-shrunk` (60px) — the header's height past the hero, since the
  contact strip folds away at that point. **Anything positioned against the
  header's underside needs a `[data-shrunk]` rule pointing at this**: the
  progress bar, the section nav, the services scrim, the mobile panel. That
  number was a literal `60px` in four places and two of the four had been
  missed, so the scrim and the mobile panel hung 16px low whenever the page was
  scrolled.

The strip folds off the header's own `data-shrunk` state rather than a second
scroll threshold — one threshold governs the header, and two could disagree.
`overflow: hidden` on `.topbar` is what makes the fold clean.

It lives **inside** `<header>`, not above it in `layout.tsx`. The header is
`position: fixed`, so a sibling placed before it scrolls away underneath it.

## Motion

- `components/parallax.tsx` — a **single** rAF loop drives every layer. Layers
  register on mount and unregister on unmount. Reads are batched before writes.
  Don't add per-element scroll listeners.
  `speed` is total drift in px across a viewport of scrolling; `Parallax`
  oversizes itself by that amount **and clamps its progress scalar to ±1**, so
  peak drift equals the overhang and no viewport can uncover the frame. The two
  are a pair — the clamp was missing, and a band taller than the window reached
  1.5× speed and pulled a visible seam of bare overlay into the top edge.
- **The service-page banner is one figure on all seven pages.**
  `sections/service-band.tsx` is the single implementation; `band` in `site.ts`
  supplies the photograph and the sentence and nothing about the movement. It
  used to carry a `variant` of `drift | aperture` chosen per service, which
  meant the same slot moved in two directions depending on which service you
  had opened. Do not reintroduce a per-page movement prop.
- **`ParallaxWindow` (the aperture) is unused, and reaching for it again is a
  mistake.** It judders on a long continuous scroll and cannot be tuned out of
  it: scrolling is composited off the main thread, the transform is written from
  `rAF`, so the layer is one frame behind — and since the figure works by
  *cancelling* the scroll, the residual error is `strength` times a whole
  frame's scroll distance. The picture shakes around the position it is meant
  to be pinned at, worse the faster you scroll, for the same reason
  `background-attachment: fixed` judders. `Parallax` has the identical one-frame
  lag and does not show it, because there the layer rides the section's own
  natively composited scrolling and the transform only adds a small lag on top.
  The home page's coverage band was an aperture and is now a drift at the
  service band's own `speed={90}`. `ParallaxBand` still takes `variant`, but
  nothing passes `aperture`. A real fix needs a compositor-driven
  `animation-timeline`, not a different constant.
- `components/scroll-stage.tsx` — the section figures play **on arrival and on
  departure, never in between**. Entry is keyed to the top edge arriving, exit
  to the *bottom* edge leaving, and each span is capped at half the section so
  the two can't overlap on a section shorter than the window. Everything
  between is the settled state. Keying both phases off the top edge — which is
  what it used to do — makes a tall section tip away and dim while it is still
  being read.
  `stagePhases` takes an optional `Phasing` — `enterLead`, `enterSpan`,
  `exitSpan`, all in viewport fractions. **Check where a phase resolves before
  trusting a span.** On the home page's ~1500px services grid in an 800px
  window, the defaults ran the entry from the grid's top edge at 800px down to
  560px down, and the exit over the last 240px of `rect.bottom` — both almost
  entirely off screen, so the grid was settled for every frame anyone could
  see, and it read as having no parallax at all. The travel was not too small;
  it was spent somewhere else. `READING_DRIFT` is the tuned set for a translate
  on something taller than the window, and it is **only** safe for a translate:
  the same spans on a stage, which fades and scales, are what
  `SETTLED_EXIT_SPAN` exists to prevent.
- A drift does not have to share its section's phasing. The services grid's
  stage takes `SETTLED_EXIT_SPAN` so its fade and scale stay off the reading,
  while its `ScrollDrift` takes the full tail so the departure is visible. Both
  still resolve at the same edges, so the drift leads the fold rather than
  outlasting it — that is the constraint, not "same numbers on both".
- `--svc-travel` and the drift's spans are a pair. 96px over a viewport and a
  fifth reads; the old 60px over the same distance does not.
- `components/reveal.tsx` — `IntersectionObserver` reveal with a **2.5s
  safety-net timer**. Content starts hidden in CSS, so anything animated needs
  that net or it can stay invisible. Keep the `<noscript>` override in
  `layout.tsx` in sync.
  `from` takes `up` (the default, and what nearly everything uses) or
  `left`/`right`, for two-column content whose halves each arrive from the
  outside edge they occupy. **Use it in pairs**, and read the direction off the
  same expression that decides the layout — on `/case-study` the rows alternate
  which side the photograph sits on, and a picture that sits right but arrives
  from the left crosses the type on its way in.
- The case-study rows carry the page's whole figure: `components/case-row.tsx`
  writes `--case-shift` (the photograph and the metrics counter-drifting inside
  a card that stays put), `--case-zoom` (the picture settles to 1.06 as the row
  centres and opens to ~1.105 at the ends — **only ever adding** scale, so the
  `overflow-hidden` frame gains cover rather than losing it), and `--case-exit`
  (the departure). **Nothing may transform `.case-row` itself** — it is the
  measured element, so the departure lives on `.case-row__body` inside it.
- Everything bails out when motion is off — with one deliberate exception,
  `components/partner-carousel.tsx`, which drives its own transform from
  `requestAnimationFrame` instead, because a carousel that has stopped reads as
  a broken section rather than a considerate one. The draft in
  `HPE - refined/hpe-enhanced-editing.html` does the same thing for the same
  reason. Do not copy this pattern elsewhere without the same justification.

### The motion preference

**Never ask `prefers-reduced-motion` directly — in CSS or in script.** The
resolved answer lives on `<html data-motion="full|reduced">`, written before
first paint by `motionBootScript` (`src/lib/motion.ts`).

Windows reports reduced motion whenever `SPI_GETCLIENTAREAANIMATION` is 0, and
that flag is cleared by **Accessibility → Visual effects → Animation effects**,
by the "Adjust for best performance" preset, and by some OEM battery-saver
profiles. On low-end laptops it is routinely off without the owner ever having
expressed a preference about motion, and the whole site then renders dead
still. So the media query is the *default*, not the verdict, and `MotionToggle`
in the header lets a visitor override it either way (persisted under
`hpe:motion`). Someone who set the OS preference deliberately still gets the
still site on arrival.

- CSS: `html[data-motion="reduced"] { … }`, never `@media
  (prefers-reduced-motion: reduce)`. The one remaining media query is the
  `<noscript>` fallback in `layout.tsx`, for when no script runs to set the
  attribute.
- Script: `prefersReducedMotion()` from `@/lib/motion` — re-exported by
  `lib/scroll-motion.ts` and aliased as `reducedMotion()` in `parallax.tsx`, so
  existing call sites are unchanged. `subscribeMotion()` for anything that must
  react to a switch.
- Most components decide once in a mount effect, so `MotionScope` (wrapping
  `{children}` in `layout.tsx`) remounts the page on a switch. Providers that
  sit outside it — `press.tsx`, `spotlight.tsx` — subscribe instead.

## Hero carousel

The home hero's background is four clips, not one still —
`components/hero-carousel.tsx` over `heroSlides` in `site.ts`. It still sits
inside the same `Parallax` frame the still did, so the masthead's drift against
the page is unchanged; only what is inside the frame moves on its own.

- **Three things advance it, answering three visitors**: a 10s timer for
  someone reading, scroll distance for someone moving through it, and
  `sessionStorage` for someone who reloads. Drop any one and a whole kind of
  visit sees a static hero.
- **Scroll advance is measured in distance travelled, not position in the
  hero** — position ties the number of changes to the breakpoint, and the hero
  is several windows tall on a phone. It registers on the shared rAF loop
  (`registerScrollLayer`), not its own listener: the advance goes in `write`,
  never in `read`.
- **The reload position is written once, on mount, not on every advance.** The
  read is cached for the life of the page — it feeds `useSyncExternalStore`,
  which calls `getSnapshot` every render and would spin on a value changing
  underneath it — so a later write would have no reader anyway, and one reload
  should move the hero on by exactly one picture however long it was left open.
- **`poster` is load-bearing, not a placeholder.** It is the frame shown when
  autoplay is refused (iOS Low Power Mode refuses all of it) and the frame
  shown outright under reduced motion, where the hero is the first still and
  nothing else. Same rule as `components/video-band.tsx`.
- Only slides that have been shown get a poster in the DOM and a `src` on their
  video, so the hero costs one image and one clip on arrival rather than four
  of each, and the timer stops when the hero leaves the viewport or the tab
  goes to the background. The set of shown slides is **derived** from the step
  count rather than tracked separately — two pieces of state here drifted.
- `heroSlides` is ordered dark to light because `.masthead-tint` thins to 0.6
  on its right edge; only the last frame can afford to be a bright one there.
  The tint is what holds four different photographs to one tonal range, so the
  headline sits on the same contrast whichever clip is playing.

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

`scripts/fetch-media.mjs` also downloads the four home-hero clips and their
stills (`HERO` in that file, `heroSlides` in `site.ts`). Two things differ from
the photos: Pexels' poster filename carries a per-clip slug and its video
filename a per-rendition id, so neither is derivable from the clip id and both
are written out in full; and the rendition is chosen per clip rather than
globally — these sit behind a heavy tint, so the rule is "the smallest
rendition that is not visibly soft at full bleed", which is why two of the four
are 960 wide. The eye-check rule bites hardest here, because a clip's *poster*
is a frame of the clip: a search for "data center" returned a factory
production line that read as a rack aisle at thumbnail size.

### Partner logos

`public/media/logos/` — partner brand marks for the business-partner carousel,
downloaded by `scripts/fetch-logos.mjs` and registered in `partnerLogos` in
`src/lib/site.ts`.

**The source is hpe.com.my itself** — the seventeen files the live site serves
on /business-partner. So the carousel shows the artwork the company already
publishes for itself, which is the point. It replaced a mixed set of eleven
Wikimedia Commons renders plus four draft favicons, where AMP and Cyberoam fell
back to type because Commons had nothing usable. **All seventeen have artwork
now.** The principal's own logo pack is still the better source if one is to
hand; check each principal's brand guidelines for usage terms.

The same eye-check rule applies. **Open every file before committing it** — these
ids are not self-describing.

**Every logo is the full lockup**, exactly as the live site shows it. The script
briefly also derived `-mark.png` crops — the symbol cut away from the wordmark —
for the brands whose lockup is too wide to read in a small box. **Do not bring
that back.** The fix for artwork that does not fit is a frame that fits the
artwork; cropping instead meant editing seventeen other companies' trademarks to
suit this site's layout, with a geometric split that cannot tell a symbol from a
letter. It cut Ruckus' logo through the "R" — the dog's leash bridges the gutter
to the wordmark — and produced a perfectly plausible file.

Two things happen on download, and both matter:

- **Everything is trimmed to its ink.** All seventeen arrive 600×300 with
  inconsistent internal padding, so under `object-contain` it is the padding
  that gets fitted and each logo lands at a different optical size.
- **Cyberoam is keyed out.** It is the one file with no alpha channel, drawn on
  opaque white; left alone its bounding box paints a white rectangle on every
  dark surface. Trimming does not help — what is left is still opaque.

**The aspect ratios run from 0.99 (Huawei, square) to 8.51 (Fortinet, a bare
wordmark), and any frame has to hold both.** That is why neither variant uses a
square box, and why the bubble strip is a 172×92 tile rather than the 84px
circle it was: Fortinet in that circle came out about 62×7px. A round frame can
only show a round mark well, and this artwork is overwhelmingly wide. The image
height caps are set by the widest logo, not the tallest.

The bubble and the card both sit on **fixed white in either theme**. Thirteen
of these marks are dark ink, and `--color-paper` is near-black in the dark
theme, which swallowed them.

Both pages render this list through `components/partner-carousel.tsx`, in its
two variants: the home page takes `card` on the near-black band (`tone="dark"`,
which recolours the edge fades and pins the card text, since the card itself
stays white in both themes), `/business-partner` takes the `bubble` strip. A
page picks one variant, never both. `components/ui/marquee-along-svg-path.tsx`
drew the home page's earlier curved ribbon and is currently unused.

The home page also passes `parallax`: **one** property, `--band-y` on the
clipping frame, written by `registerScrollLayer`, drifting the band vertically
as the section arrives and as it leaves. It has to go on the frame — Y written
to anything inside the clip shaves the top or bottom off every card. Unlike the
marquee itself, the parallax takes the standard reduced-motion bail-out.

**The scroll position moves the band; the pointer moves the cards. Keep those
apart.** This used to be five scroll-driven properties — a horizontal slide on
an inner wrapper plus a rotate, a scale and an opacity on the frame — and the
other four all read on the *cards*, which were therefore banking, shrinking and
dimming while the marquee carried them sideways and the pointer tilt leaned them
at the cursor. A card had no settled state to be looked at. Adding a second
scroll-driven property here means deciding what it does to a card that is being
hovered at the same time.

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

`components/enquiry-form.tsx` posts to the `submitEnquiry` server action in
`app/actions/enquiry.ts`, which validates and mails the enquiry through SMTP
(`lib/mail.ts`, nodemailer). This is the site's only server-side code — every
route still prerenders; the action is a separate POST endpoint.

- **Configure it with `.env.local`; see `.env.example`.** `ENQUIRY_TO` is the
  destination, `SMTP_*` the transport. Any SMTP host works, so switching
  provider is env-only. Gmail needs an App Password, not the account password.
- **`lib/mail.ts` imports `server-only`.** Importing it from a client component
  is a build error rather than a leaked credential.
- **The transporter is built lazily and cached.** Reading env at module scope
  would run during `next build`, where the variables are absent, and fail the
  build of nineteen pages over a credential none of them need.
- **`From` is the SMTP account, never the visitor.** Sending as someone else's
  address is a forgery and gets spam-filed. The visitor goes in `Reply-To`.
- The action carries a honeypot, per-field validation, length caps and an
  in-memory per-IP rate limit. It is a public POST endpoint that sends mail;
  treat those as part of the feature. The rate limit is per-process, so it is
  not a substitute for a platform limit under real abuse.
- **Delivery is never a dead end.** With no credentials, or on a transport
  failure, the visitor is offered the original `mailto:` hand-off carrying the
  same structured body. Keep that fallback and keep the `aria-live` status.
- The form works with scripting off: `action` takes the server action directly,
  so a submit without JavaScript is an ordinary POST that still sends.

## Chat assistant

`components/chat-widget.tsx` (launcher, floating label, panel) over
`lib/chat.ts` (the answers). Mounted once in `layout.tsx`, so it is on every
route.

**It is scripted, not a language model.** Every answer is composed from
`site.ts` — service titles and summaries, `supportTiers`, `regions`, `stats`,
`contact` — so an answer cannot drift from the page it links to, and adding a
service to `site.ts` teaches the bot about it with no edit in `chat.ts`. Two
rules hold it up, and they matter more than the matcher does:

- **It never invents.** Figures are read, never typed out a second time.
- **It never dead-ends.** The fallback hands over — phone, the right mailbox,
  the enquiry form — in the same turn. "I don't understand" and a full stop is
  worse for a visitor than no chat widget at all.

To put a real model behind it, keep `Reply` as the response shape and replace
`answer()` with a call to your endpoint. The widget knows nothing else.

- The matcher scores whole-word phrase hits, longest phrase wins, and tests the
  plural of each keyword. **Not `String.includes`** — substring matching had
  "who are your partners" matching the *about* intent's "who are you" and
  answering with the company history.
- **The icon is a headset, not a speech bubble.** A bubble says there is a chat
  window here, which is the least interesting thing about it; on a site selling
  a helpdesk and 4-hour onsite response, a headset says *who* is on the other
  end. One import to change if that judgement is ever reversed.
- **Hover and press are opposite movements, deliberately**, so the two states
  can never be confused. Hover goes outward — lift, scale to 1.06, ink to
  brand, an expanding ring on a loop. Press goes inward — compress to 0.92,
  plus the shared `[data-ripple]` wash. `[data-pressed]` from `press.tsx` is
  what makes press work on touch, where `:active` is unreliable.
- **One** label floats above the launcher: `.chat-nudge`, the prompt, after
  2.6s. **The ✕ is the only thing that dismisses it.** Not hover — the label
  sits directly over the launcher, so a pointer leaving the label crosses the
  button, and an `onMouseEnter` dismissal there made the prompt vanish from
  being read. Not opening the panel either; the label is hidden while the panel
  is open anyway, so it returns when the panel is closed. Dismissal is
  **page-scoped, not persisted** — a reload is a fresh arrival and gets the
  prompt again, because it is the only thing naming the control. (There used to be a second, `.chat-tag`, a standing "Chat with us"
  that took the space back once the prompt was dismissed; it is gone, and the
  space above the launcher now belongs to the back-to-top arrow.)
- The panel is hidden, not unmounted — it keeps the conversation across opens
  and has something to animate out of. `inert` is what takes it out of the tab
  order and the accessibility tree; `visibility: hidden` alone leaves a closed
  panel readable to a screen reader mid-transition.
- **The panel has a settled `height`, not a `max-height`**, clamped to what is
  free above the launcher once `--header-h` is subtracted, in `dvh` so mobile
  browser chrome is accounted for. With a maximum alone the frame grew by a
  bubble per turn and the input crept away under the cursor. This only works
  because `.chat-log` carries `min-height: 0` — a flex item defaults to
  `min-height: auto` and will not shrink below its content, which pushed the
  input and footer out through the bottom of the panel instead of scrolling.
- Stacking: splash 200 > header 100 > scroll progress 99 > **chat 95** >
  back-to-top 90. The corner is **one column: launcher, label, arrow**, bottom
  to top. `.back-to-top` is offset upward by `--chat-size` plus
  `--chat-nudge-h` — the label's measured height, published on `:root` by
  `chat-widget.tsx` and unset when there is no label. The label keeps the space
  against the launcher, because its caret points at that button and it is the
  button's only name; the arrow is what gives way. The height is measured with
  a `ResizeObserver` rather than written as a constant: the label is two lines
  of copy at one width and three at another.
