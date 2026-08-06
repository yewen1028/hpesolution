"use client";

import { useEffect, useRef } from "react";
import { registerScrollLayer } from "@/components/parallax";
import { ServiceIcon } from "@/components/ui";
import { partnerFallbackIcons, partnerLogos, partners } from "@/lib/site";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion";
import { canHover } from "@/lib/scroll-motion";

/**
 * The moving strip. Bubble shape follows the `HPE - refined` draft: a white
 * circle holding the mark, brand name underneath, hover lifts and scales the
 * circle only.
 *
 * Motion is CSS (`.marquee__track` in globals.css) with a requestAnimationFrame
 * engine as backup. The backup exists because of a specific failure the draft
 * also hit and commented: Windows' "Animation effects" toggle is routinely
 * switched off on low-powered laptops, which reports as
 * `prefers-reduced-motion: reduce` and kills every CSS animation on the page.
 * The carousel then sits perfectly still and reads as broken.
 *
 * So when reduced motion is on we stop relying on CSS and drive the transform
 * from rAF instead. This is a deliberate exception to the site-wide "everything
 * bails out under reduced motion" rule in CLAUDE.md — it is the one component
 * whose entire purpose is the movement. Deleting the effect below restores the
 * standard behaviour if that trade is ever judged the wrong way round.
 *
 * Two variants over the same list and the same engine:
 *   `bubble` — circular mark, used by `sections/partner-marquee.tsx`
 *   `card`   — hairline card, used by `sections/partners.tsx` on the home page
 */

/**
 * Seconds per full cycle, per variant. Cards are roughly twice the width of a
 * bubble, so the track is twice as long; matching the bubble's 42s would double
 * the travel speed. These two numbers keep the strip moving at the same pixels
 * per second in both variants.
 */
const DURATION_S = { bubble: 42, card: 78 } as const;

export type PartnerVariant = keyof typeof DURATION_S;

/**
 * `tone` is which background the strip is sitting on, and it exists for the
 * edge fades: they are painted gradients, so they have to be the band's own
 * colour or they read as a grey smear rather than as the strip running out.
 * `dark` also pins the card text to the fixed ink, because the card underneath
 * it is permanently white in both themes.
 */
export type PartnerTone = "light" | "dark";

/**
 * Scroll parallax, when `parallax` is on. The strip is displaced by these
 * amounts at each end of its pass through the viewport: the band drifts
 * vertically against the page, and the cards slide horizontally *against their
 * own travel*, so approaching the section and leaving it are different views of
 * the same strip rather than the same loop seen twice.
 *
 * **Every figure below is stated at t = ±1, which is off screen.** The signed
 * progress only reaches ±0.5 while any part of the section is in the viewport
 * (see the read pass), so a visitor sees half of each number at the extremes —
 * ±22px of lift, ±75px of slide, ±0.7° of tilt. Sizing them at ±1 keeps the
 * curve linear in scroll and the constants comparable to `Parallax`'s `speed`.
 *
 * The ceilings are measured rather than picked:
 *
 *   - `Y` has the section's own padding to play with — 80px at the smallest
 *     step, and the strip is the last thing in the section — so ±22px never
 *     puts a card into the description above.
 *   - `X` is bounded by nothing visual (the duplicated track runs thousands of
 *     pixels past both edges, so no shift can expose an end) and instead by the
 *     loop: ±75px stays well under one card's 208px, so the displacement reads
 *     as depth rather than as the marquee stuttering.
 *   - `ROT` is the one figure that makes the approach and the exit read as
 *     *opposite* rather than merely offset — the strip banks one way coming up
 *     the screen and the other way leaving it. Held under a degree: past that
 *     it stops being depth and becomes a crooked row. At ±0.7° a full-bleed
 *     frame rises about 10px at its corners, which the same 80px of padding
 *     absorbs.
 *   - `SCALE` and `FADE` are the settle: the band arrives slightly small and
 *     slightly recessed into the near-black, and is only at full size and full
 *     strength while it is the thing you are looking at. Both are driven by
 *     |t|, so they are symmetric — unlike the three above, which flip sign.
 */
const PARALLAX_Y = 44;
const PARALLAX_X = 150;
const PARALLAX_ROT = 1.4;
const PARALLAX_SCALE = 0.1;
const PARALLAX_FADE = 0.42;

export function PartnerCarousel({
  variant = "bubble",
  tone = "light",
  parallax = false,
}: {
  variant?: PartnerVariant;
  tone?: PartnerTone;
  parallax?: boolean;
} = {}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const track = trackRef.current;
    if (!frame || !track) return;

    const duration = DURATION_S[variant];
    let raf = 0;
    let prev = 0;
    let x = 0;

    function step(now: number) {
      const el = trackRef.current;
      if (!el) return;

      // One set is half the track. Measured every frame so a late-loading logo
      // or a resize cannot desynchronise the wrap point.
      const half = el.scrollWidth / 2;

      if (half > 0) {
        // Clamp the delta: a backgrounded tab hands back a huge gap on return,
        // which would teleport the strip.
        const dt = prev ? Math.min(now - prev, 50) : 16;
        x += (half / (duration * 1000)) * dt;
        if (x >= 0) x -= half; // left to right, wrapping a full set at a time
        el.style.transform = `translate3d(${x}px, 0, 0)`;
      }

      prev = now;
      raf = requestAnimationFrame(step);
    }

    function start() {
      if (raf) return;
      const el = trackRef.current;
      if (!el) return;
      x = -el.scrollWidth / 2;
      prev = 0;
      frame?.setAttribute("data-js", "on");
      raf = requestAnimationFrame(step);
    }

    function stop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      frame?.removeAttribute("data-js");
      const el = trackRef.current;
      if (el) el.style.transform = "";
    }

    // CSS drives the strip when motion is on; rAF takes over when it is off,
    // which is the exception documented above. `subscribeMotion` covers both
    // the OS query and a switch made with the header toggle.
    const sync = () => (prefersReducedMotion() ? start() : stop());
    sync();
    const unsubscribe = subscribeMotion(sync);

    return () => {
      unsubscribe();
      stop();
    };
    // `variant` is fixed per mount in practice; listed so the loop picks up the
    // right speed rather than silently keeping the first one.
  }, [variant]);

  /*
   * Scroll parallax, on the site's single rAF loop — `registerScrollLayer` is
   * the same one the photo layers use, so this costs no extra scroll listener
   * and no extra layout pass. Reads are batched before writes across the page.
   *
   * The two axes are written to two different elements, and that split is
   * load-bearing rather than tidiness:
   *
   *   - **Y goes on the frame**, which is the clipping box. Drifting the box
   *     itself moves the whole strip against the page. Putting Y on something
   *     *inside* `overflow: hidden` would slide the cards under their own clip
   *     and shave the top or bottom off every one of them.
   *   - **X goes on the inner wrapper**, never the track: the track's transform
   *     is the marquee itself, driven by the CSS animation and, under reduced
   *     motion, by the rAF loop above. A second writer on that property would
   *     fight both. The wrapper is free, and the duplicated track runs
   *     thousands of pixels past both edges of the frame, so a 70px shift can
   *     never pull an end into view.
   *
   * Unlike the marquee, this is ordinary decoration and bails out entirely when
   * motion is off — the strip still travels, it simply stops being displaced by
   * the page. `MotionScope` remounts on a toggle, so deciding once is enough.
   */
  useEffect(() => {
    const frame = frameRef.current;
    const drift = driftRef.current;
    if (!parallax || !frame || !drift || prefersReducedMotion()) return;

    let y = 0;
    let x = 0;
    let rot = 0;
    let scale = 1;
    let fade = 1;

    const unregister = registerScrollLayer({
      el: frame,
      read(rect, viewportH) {
        // -0.5 when the strip sits a half-viewport low, +0.5 once it has risen
        // the same distance past centre. Clamped, so a section still on screen
        // after a long scroll cannot keep accumulating displacement.
        const progress =
          (viewportH / 2 - (rect.top + rect.height / 2)) / viewportH;
        const t = Math.max(-1, Math.min(1, progress));
        const away = Math.abs(t);

        y = t * PARALLAX_Y;
        // Negative: the cards lag as the section rises, so the displacement
        // opposes the loop's own left-to-right travel instead of adding to it.
        x = -t * PARALLAX_X;
        rot = t * PARALLAX_ROT;
        scale = 1 - away * PARALLAX_SCALE;
        fade = 1 - away * PARALLAX_FADE;
      },
      write() {
        frame.style.setProperty("--band-y", `${y.toFixed(2)}px`);
        frame.style.setProperty("--band-rot", `${rot.toFixed(3)}deg`);
        frame.style.setProperty("--band-scale", scale.toFixed(4));
        frame.style.setProperty("--band-fade", fade.toFixed(3));
        drift.style.setProperty("--band-x", `${x.toFixed(2)}px`);
      },
    });

    return () => {
      unregister();
      for (const prop of ["--band-y", "--band-rot", "--band-scale", "--band-fade"])
        frame.style.removeProperty(prop);
      drift.style.removeProperty("--band-x");
    };
  }, [parallax]);

  /*
   * Pointer tilt, `card` variant only.
   *
   * The card leans towards the cursor, from two custom properties written here:
   * `--tilt-x` and `--tilt-y`, in -1…1 across and down the card. The transform
   * itself is declared once in `.partner-card`, so hover scale and tilt compose
   * instead of overwriting each other. Everything else about the hover — the
   * brand rule, the border, the type — is CSS off `:hover` and needs nothing
   * from this loop.
   *
   * Three things about this strip make it different from an ordinary tilt-card:
   *
   *   - **One listener on the frame**, not one per card. There are 34 cards
   *     (two passes over seventeen) and they are replaced by nothing — the same
   *     nodes travel forever — so delegation is both cheaper and simpler.
   *   - **The card moves under a stationary cursor.** A `pointermove`-driven
   *     tilt goes stale the moment the visitor stops moving the mouse, which on
   *     a strip that is still sliding is exactly when it looks broken. So the
   *     tilt is recomputed every frame from the last known pointer position for
   *     as long as the pointer is over the band, and the card under it is
   *     re-resolved with `elementFromPoint` rather than trusted from the last
   *     event — the pointer can end up over a different card without moving.
   *   - **The loop only exists while the pointer is inside the band.** It is
   *     started by `pointerenter` and cancelled by `pointerleave`, so a page
   *     that nobody is pointing at costs nothing.
   *
   * Bails out entirely without a hover-capable pointer — on touch the whole
   * figure is unreachable, and `canHover` is the site's existing test for that
   * — and under reduced motion, where the card keeps its colour hover and drops
   * the movement. `MotionScope` remounts on a toggle, so deciding once is
   * enough.
   */
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || variant !== "card") return;
    if (!canHover() || prefersReducedMotion()) return;

    let raf = 0;
    let active: HTMLElement | null = null;
    let px = 0;
    let py = 0;

    function release(card: HTMLElement) {
      card.removeAttribute("data-pointing");
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    }

    function tick() {
      raf = requestAnimationFrame(tick);

      const under = document.elementFromPoint(px, py);
      const card =
        under instanceof Element
          ? (under.closest(".partner-card") as HTMLElement | null)
          : null;

      if (card !== active) {
        if (active) release(active);
        active = card;
        // Set while tracking so the card can shorten its transform transition:
        // the settle that reads well on enter and exit reads as lag under a
        // moving cursor.
        card?.setAttribute("data-pointing", "");
      }

      if (!card) return;

      const rect = card.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const u = (px - rect.left) / rect.width; // 0 at the left edge, 1 at the right
      const v = (py - rect.top) / rect.height;
      const tx = Math.max(-1, Math.min(1, u * 2 - 1));
      const ty = Math.max(-1, Math.min(1, v * 2 - 1));

      card.style.setProperty("--tilt-x", tx.toFixed(3));
      card.style.setProperty("--tilt-y", ty.toFixed(3));
    }

    function onMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      px = event.clientX;
      py = event.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function onLeave() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (active) release(active);
      active = null;
    }

    frame.addEventListener("pointermove", onMove);
    frame.addEventListener("pointerleave", onLeave);
    // A drag or a tab switch can swallow the leave; both surface here.
    window.addEventListener("blur", onLeave);

    return () => {
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      onLeave();
    };
  }, [variant]);

  return (
    <div
      ref={frameRef}
      className={`marquee mt-10 ${variant === "card" ? "marquee--cards" : ""} ${
        tone === "dark" ? "marquee--deep" : ""
      } ${parallax ? "marquee--parallax" : ""}`}
    >
      {/*
       * Carries the horizontal parallax only. Present in every configuration so
       * the tree does not change shape with a prop; with `--band-x` unset it
       * resolves to 0 and this is an inert wrapper.
       */}
      <div ref={driftRef} className="marquee__drift">
        <ul
          ref={trackRef}
          className={`marquee__track ${variant === "card" ? "py-8" : "py-5"}`}
        >
          {/*
         * Two passes over the same list. The second is the visual tail that
         * makes the loop seamless, so it is hidden from assistive tech — a
         * screen reader reads the partner list once.
         */}
        {[0, 1].map((pass) => (
          <li key={pass} aria-hidden={pass === 1 ? "true" : undefined}>
            <ul className="flex">
              {partners.map((partner) => {
                const logo = partnerLogos[partner];
                const icon = partnerFallbackIcons[partner];

                /*
                 * A plain <img> on purpose in both variants. These are static
                 * PNGs of 1–25 KB; routing them through the image optimizer
                 * adds a round trip each for no size win, and in dev on a slow
                 * machine that delay is exactly what makes the carousel look
                 * empty.
                 */
                const mark = logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logo.src}
                    alt={`${partner} logo`}
                    width={logo.width}
                    height={logo.height}
                    decoding="async"
                    className={
                      variant === "card"
                        ? "max-h-[42px] w-auto max-w-[120px] object-contain"
                        : "size-[46px] object-contain"
                    }
                  />
                ) : (
                  <ServiceIcon
                    name={icon ?? "Network"}
                    size={variant === "card" ? 34 : 30}
                    className="text-brand"
                  />
                );

                if (variant === "card") {
                  return (
                    <li key={partner} className="mx-3 shrink-0">
                      {/*
                        Softly rounded and lifted, following the auto-slider
                        reference: see `.partner-card` in globals.css for why
                        this variant is allowed a radius where the rest of the
                        site is square.
                      */}
                      <article className="partner-card group">
                        <span className="partner-card__mark">{mark}</span>

                        <span className="partner-card__name">{partner}</span>

                        <span className="partner-card__role">
                          Authorised partner
                        </span>
                      </article>
                    </li>
                  );
                }

                return (
                  <li key={partner} className="mx-2.5 shrink-0">
                    <span className="group flex w-[104px] cursor-default flex-col items-center gap-3">
                      <span className="flex size-[84px] items-center justify-center overflow-hidden rounded-full border border-rule bg-paper shadow-[0_8px_22px_rgb(20_24_29_/_0.10)] transition-[transform,box-shadow,border-color] duration-[350ms] ease-[var(--ease-out-quint)] group-hover:-translate-y-1.5 group-hover:scale-[1.09] group-hover:border-brand group-hover:shadow-[0_18px_36px_rgb(242_111_33_/_0.30)]">
                        {mark}
                      </span>
                      <span className="whitespace-nowrap text-center text-[0.8125rem] font-semibold text-ink-muted transition-colors duration-300 group-hover:text-brand">
                        {partner}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
        </ul>
      </div>
    </div>
  );
}
