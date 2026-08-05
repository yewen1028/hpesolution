"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { registerScrollLayer } from "@/components/parallax";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface CardItem {
  id: string | number;
  url: string;
  title: string;
}

export interface DiagonalMarqueeProps {
  cards: CardItem[];
  /** Tilt of the whole field, in degrees. */
  angle?: number;
  /** Seconds for one row to travel its own length. Higher is slower. */
  baseSpeed?: number;
  /** Rows of cards. */
  rows?: number;
  className?: string;
}

/* -------------------------------------------------------------------------- */

/*
 * Great UI's **Diagonal Marquee Carousel** (great-ui.com), rebuilt for this
 * site. Five changes, and the first three are the difference between a device
 * and a liability:
 *
 *  1. **Three rows of 240x160, not five of 400x300.** The original mounts five
 *     rows of eighteen cards duplicated — 180 <img> elements animating at once.
 *     This is a marketing site read on low-powered laptops; that is a fan
 *     spinning up for a background. Three rows of nine, duplicated once, is 54.
 *
 *  2. **It stops when the reader asks it to.** The original animates
 *     unconditionally. Here the rows freeze under the motion preference and the
 *     field is a still contact sheet, which is a perfectly good backdrop.
 *
 *  3. **The keyframes live in globals.css.** The original injects a <style> tag
 *     through `dangerouslySetInnerHTML` on every mount — duplicate rules per
 *     instance, and markup the CSP has to allow.
 *
 *  4. **Square corners and a hairline, not `rounded-xl shadow-2xl`.** The house
 *     draws with rules; a stack of soft-shadowed rounded rectangles is the one
 *     look this design system does not have anywhere in it.
 *
 *  5. **`next/image`, and only images already in `public/media`.** No remote
 *     hosts: CARTO's map tiles are meant to be the site's only runtime
 *     third-party request, and stock URLs from an image CDN would break that
 *     for decoration.
 *
 * The whole field also drifts against the scroll — see `--marquee-y`.
 */
export default function DiagonalMarquee({
  cards,
  angle = -14,
  baseSpeed = 150,
  rows = 3,
  className,
}: DiagonalMarqueeProps) {
  const fieldRef = useRef<HTMLDivElement>(null);

  const reduced = useSyncExternalStore(
    subscribeMotion,
    prefersReducedMotion,
    () => false,
  );

  /*
   * Parallax on the field as a whole: it rises against the page as the masthead
   * scrolls away, so the backdrop and the headline over it separate instead of
   * leaving together. Same shared rAF loop as every other scroll layer here.
   */
  useEffect(() => {
    const el = fieldRef.current;
    if (!el || reduced) return;

    let drift = 0;

    const unregister = registerScrollLayer({
      el,
      read(rect, viewportH) {
        const progress =
          (viewportH / 2 - (rect.top + rect.height / 2)) / viewportH;
        drift = Math.max(-1, Math.min(1, progress)) * 40;
      },
      write() {
        el.style.setProperty("--marquee-y", `${drift.toFixed(2)}px`);
      },
    });

    return () => {
      unregister();
      el.style.removeProperty("--marquee-y");
    };
  }, [reduced]);

  return (
    <div className={cn("marquee-field", className)} aria-hidden="true">
      <div
        ref={fieldRef}
        className="marquee-field__rows"
        style={{ "--marquee-angle": `${angle}deg` } as React.CSSProperties}
      >
        {Array.from({ length: rows }, (_, row) => {
          // Each row is offset into the list so the same picture is never
          // directly above itself, and every other row runs the other way.
          const ordered = [...cards.slice(row * 3), ...cards.slice(0, row * 3)];
          const speed = baseSpeed + row * 22;

          return (
            <div key={row} className="marquee-row">
              <div
                className={cn(
                  "marquee-row__track",
                  row % 2 === 1 && "marquee-row__track--reverse",
                )}
                style={
                  {
                    "--speed": `${speed}s`,
                    animationPlayState: reduced ? "paused" : undefined,
                  } as React.CSSProperties
                }
              >
                {/* Two passes: the second is the tail that makes the loop seamless. */}
                {[0, 1].map((pass) => (
                  <div key={pass} className="flex shrink-0">
                    {ordered.map((card) => (
                      <div
                        key={`${card.id}-${pass}`}
                        className="marquee-card"
                      >
                        <Image
                          src={card.url}
                          alt=""
                          width={240}
                          height={160}
                          sizes="240px"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
