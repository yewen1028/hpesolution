"use client";

import { useEffect, useRef } from "react";
import { ServiceIcon } from "@/components/ui";
import { partnerFallbackIcons, partnerLogos, partners } from "@/lib/site";

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

export function PartnerCarousel({
  variant = "bubble",
}: {
  variant?: PartnerVariant;
} = {}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const track = trackRef.current;
    if (!frame || !track) return;

    const duration = DURATION_S[variant];
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
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

    const sync = () => (query.matches ? start() : stop());
    sync();
    query.addEventListener("change", sync);

    return () => {
      query.removeEventListener("change", sync);
      stop();
    };
    // `variant` is fixed per mount in practice; listed so the loop picks up the
    // right speed rather than silently keeping the first one.
  }, [variant]);

  return (
    <div
      ref={frameRef}
      className={`marquee mt-10 ${variant === "card" ? "marquee--cards" : ""}`}
    >
      <ul ref={trackRef} className={`marquee__track ${variant === "card" ? "py-8" : "py-5"}`}>
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
                        Square corners and a hairline border, matching the
                        grid this replaces. The bubble variant's circle is the
                        deliberate exception on this site, not the rule.
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
  );
}
