"use client";

import { useEffect, useRef } from "react";
import { onScrollFrame } from "@/lib/scroll-motion";

/**
 * Reading-progress bar pinned under the header.
 *
 * Deliberately *not* gated on `prefers-reduced-motion`: this is wayfinding, not
 * decoration. Someone who has asked for less movement still wants to know how
 * far through a page they are. What reduced motion removes is the CSS easing on
 * the fill, so it tracks the scrollbar exactly rather than gliding after it.
 *
 * The width is written as a `scaleX` on a compositor layer and the whole thing
 * shares the site's single scroll listener, so it costs nothing per frame
 * beyond one property write.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const doc = document.documentElement;
      // Total distance the page can actually travel.
      const span = doc.scrollHeight - window.innerHeight;
      const progress = span <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / span));

      el.style.setProperty("--scroll-progress", progress.toFixed(4));
      // Hidden until the page is long enough to be worth tracking.
      el.toggleAttribute("data-idle", span < 400);
    };

    update();
    return onScrollFrame(update);
  }, []);

  return (
    <div
      ref={ref}
      className="scroll-progress"
      // The bar duplicates information the scrollbar already exposes, so it is
      // decorative to assistive tech rather than a second progressbar role.
      aria-hidden="true"
    >
      <span className="scroll-progress__fill" />
    </div>
  );
}
