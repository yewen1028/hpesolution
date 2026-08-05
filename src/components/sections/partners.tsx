"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import MarqueeAlongSvgPath from "@/components/ui/marquee-along-svg-path";
import { registerScrollLayer } from "@/components/parallax";
import { Reveal } from "@/components/reveal";
import { Container, SectionHeading } from "@/components/ui";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion";
import { partnerLogos, partners } from "@/lib/site";

/*
 * The reference path, used verbatim, and its viewBox with it — the two are one
 * measurement and swapping either alone reshapes the curve.
 *
 * I had substituted a shallower double curve on the grounds that a loop was too
 * playful for a list of principals. That was the wrong call to make silently:
 * the loop is the figure, and the cusp where the line crosses itself is where
 * the strip stops reading as a conveyor belt.
 */
const PATH =
  "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";
const VIEW_BOX = "0 0 996 330";

export function Partners() {
  /*
   * Frozen, not hidden, when motion is off: the logos stay laid out along the
   * curve, evenly spaced, and simply do not travel. A strip that vanished under
   * the preference would take the whole partner list with it.
   */
  const reduced = useSyncExternalStore(
    subscribeMotion,
    prefersReducedMotion,
    () => false,
  );

  /*
   * Parallax on the ribbon itself: the whole band drifts vertically against the
   * page as the section passes, so it arrives from slightly below and leaves
   * slightly above rather than being fixed to the copy beside it. That is a
   * different figure from the marquee's own scroll coupling — that changes how
   * fast the logos travel *along* their curve, this moves the curve.
   *
   * `registerScrollLayer` is the site's single rAF loop, the same one the
   * photo layers use; reads are batched before writes across every layer on
   * the page, so this costs no extra listener and no extra layout pass.
   *
   * ±20px, and the ceiling is not arbitrary: the cards already overhang the top
   * of the band by up to 58px and the clearance below the heading is 96px, so
   * the drift has 38px to play with before it puts a logo back into the
   * description. Twenty is comfortably inside that at every width.
   */
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bandRef.current;
    if (!el || reduced) return;

    let drift = 0;

    const unregister = registerScrollLayer({
      el,
      read(rect, viewportH) {
        // -0.5 when the band sits a half-viewport low, +0.5 once it has risen
        // the same distance past centre.
        const progress =
          (viewportH / 2 - (rect.top + rect.height / 2)) / viewportH;
        drift = Math.max(-1, Math.min(1, progress)) * 20;
      },
      write() {
        el.style.setProperty("--band-y", `${drift.toFixed(2)}px`);
      },
    });

    return () => {
      unregister();
      el.style.removeProperty("--band-y");
    };
  }, [reduced]);

  return (
    /*
      The band is near-black now, and that is the fix for the logos rather than
      decoration around it.

      Every one of these marks is drawn for a light background — Riverbed is
      brand orange, Ruckus is black, TM is blue and orange, and the four favicon
      marks are darker still. On the warm paper this band used to be they had
      barely any separation, and in the dark theme the card itself inverted to
      near-black and swallowed them whole. Cards that are permanently white on a
      dark band give every mark the background it was designed for, in both
      themes, and the band supplies the contrast that makes them read.

      It is also the only arrangement the design system allows the gradient to
      take: an orange field belongs on a near-black panel, where it is an accent
      — on light paper it would be the colour wash the first rule forbids.
    */
    <section className="relative isolate overflow-hidden border-t border-rule bg-paper-deep py-20 sm:py-24">
      <div className="partner-aurora" aria-hidden="true" />

      <Container>
        <Reveal>
          <SectionHeading
            tone="light"
            title="Authorised by the principals we support"
            lede="Warranty fulfilment and managed security only work when the vendor relationship is real. These are the principals and distributors whose products we are authorised to carry, deploy and repair."
          />
        </Reveal>
      </Container>

      {/*
       * Full-bleed, and deliberately NOT wrapped in `Reveal` — the strip has to
       * be on screen even if IntersectionObserver never fires or the reveal
       * script is slow to boot on a low-powered machine. Same reasoning the
       * carousel this replaces carried.
       */}
      {/*
        The box is the viewBox's own 996:330, so the curve spans the full width
        instead of being letterboxed inside it — `responsive` scales to fit, and
        a box of the wrong ratio just leaves margins. `isolate` keeps the items'
        rolling z-index local to this band so a logo can never paint over the
        heading above it.
      */}
      {/*
        `overflow-x-clip` is load-bearing, and its absence is what let the whole
        page scroll sideways. Two things inside overflow this box:

          - the marquee's inner container is given a literal `996px` width by
            its own responsive effect, and the `scale()` that fits it to the
            viewport is a transform — transforms do not change layout size, so
            on any viewport under 996px that box is simply wider than the page;
          - `scale-105` likewise paints 5% past the edges, and a transformed box
            does contribute to the scrollable overflow area.

        The carousel this replaced carried `overflow: hidden` for the same
        reason and I dropped it. `clip` rather than `hidden` because `hidden`
        would make this a scroll container.
      */}
      {/*
        The top margin is measured, not guessed.

        This path tops out at y=1.4 in a 330-unit viewBox — effectively on the
        band's upper edge — so a card sitting there hangs half its own height
        *above* the band, and `scale-105` lifts it a further 2.5% of the band
        height. At 64px cards that is 58px of overhang on a 1440px viewport and
        31px at 768px. The margin has to clear the larger of those at each
        width, which is why it steps up rather than being one value: the
        overhang grows with the viewport, because the whole band scales with it.

        `mt-2` was the bug — 8px of clearance against 58px of overhang, so the
        cards sat on top of the description.
      */}
      <div
        ref={bandRef}
        className="partner-band mt-14 aspect-[996/330] w-full isolate overflow-x-clip sm:mt-16 lg:mt-24"
      >
        <MarqueeAlongSvgPath
          path={PATH}
          viewBox={VIEW_BOX}
          className="h-full w-full scale-105"
          responsive
          baseVelocity={reduced ? 0 : 8}
          paused={reduced}
          /*
           * The parallax, kept — but by speed alone.
           *
           * `useScrollVelocity` couples the ribbon's rate to the page's, so it
           * surges as you come into the section and eases as you leave. I had
           * also set `scrollAwareDirection`, which flips the travel to follow
           * the scroll: that is what made the flow reverse against the
           * direction the reference specifies. Speed coupling gives the depth;
           * direction stays as authored.
           */
          useScrollVelocity={!reduced}
          /*
           * The interactions from the reference: the strip slows to a quarter
           * speed under the pointer so a mark can actually be read, and it can
           * be grabbed and flung along its own curve. Drag stays enabled even
           * when the automatic travel is paused — see the note in the
           * component's animation frame.
           */
          slowdownOnHover
          slowDownFactor={0.25}
          draggable
          grabCursor
          dragSensitivity={0.1}
          /*
           * `repeat={1}`, not the reference's 2 — and this one is arithmetic
           * rather than taste.
           *
           * The path measures 1669 units. The reference fills it with 13 images
           * twice over: 26 cards, 64 units apart, 8 clear between 56px cards.
           * This list is 17 principals. Twice over is 34 cards at 49 units
           * apart — 7 units *less* than the card is wide, so every neighbouring
           * pair overlaps for the whole length of the curve. That is the
           * cards-blocking-each-other fault, and no z-index fixes it because
           * they genuinely have nowhere to sit.
           *
           * Once through gives 98 units of spacing and 42 clear. The repeat
           * exists to pad a short list onto a long path; a seventeen-item list
           * does not need padding.
           */
          repeat={1}
          /*
           * Rolling z-index left on, as the reference has it. Turning it off
           * was the cause of the cards blocking each other: without it every
           * item shares one stacking level and they collide in DOM order at the
           * cusp, where the path crosses itself. With it, position along the
           * curve decides what sits in front, so the crossing reads as depth.
           * `isolate` on the wrapper above contains the range.
           */
        >
          {partners.map((partner) => {
            const logo = partnerLogos[partner];

            return (
              <span key={partner} className="partner-node" title={partner}>
                {logo ? (
                  /*
                   * A plain <img>, as in the carousel this replaces: these are
                   * static PNGs of 1–25 KB, and routing them through the image
                   * optimizer adds a round trip each for no size win.
                   */
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logo.src}
                    alt={`${partner} logo`}
                    width={logo.width}
                    height={logo.height}
                    decoding="async"
                    draggable={false}
                    /*
                      One fixed frame for every mark, not `w-auto` with a pair
                      of maximums.

                      With `w-auto` each image box shrank to its own logo, so
                      the boxes ranged from 44x5px for Fortinet's wordmark to
                      28x28px for Microsoft's square. Each was centred in its
                      card, but centred *at a different size and shape* — and a
                      five-pixel sliver adrift in a 64px card reads as badly
                      placed however correct the arithmetic is.

                      A shared 46x30 frame with `object-contain` fits each mark
                      into the same rectangle and centres it there: wide
                      wordmarks take the full width, square marks take the full
                      height, and every card presents its logo in the same
                      optical area.
                    */
                    className="h-[30px] w-[46px] object-contain"
                  />
                ) : (
                  /*
                   * AMP and Cyberoam are the two principals with no mark that
                   * could be sourced, so they carry their name instead. A
                   * stand-in logo would be worse than none: it would be wrong.
                   */
                  <span className="partner-node__word">{partner}</span>
                )}
              </span>
            );
          })}
        </MarqueeAlongSvgPath>
      </div>
    </section>
  );
}
