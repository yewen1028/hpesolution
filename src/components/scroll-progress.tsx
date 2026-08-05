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

    /*
     * `scrollHeight` is measured on resize, never on scroll.
     *
     * Reading it forces a layout of the whole document, and this ran on every
     * scroll frame — on a loop that is *not* the one the parallax layers use.
     * So each frame went: parallax loop writes its transforms, this reads
     * `scrollHeight`, and the browser has to re-lay-out the entire page to
     * answer. The more scroll-linked layers on screen the more that costs,
     * which is why it showed up as a stutter in the heaviest bands rather than
     * evenly. The page's height does not change while you scroll; a
     * `ResizeObserver` catches the times it does.
     */
    let span = 0;

    const measure = () => {
      span = document.documentElement.scrollHeight - window.innerHeight;
      el.toggleAttribute("data-idle", span < 400);
    };

    measure();
    const sized = new ResizeObserver(measure);
    sized.observe(document.body);

    // Only the value actually changes per frame, and only when it differs:
    // writing an identical custom property still invalidates style.
    let last = "";

    const update = () => {
      const progress =
        span <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / span));
      const next = progress.toFixed(4);
      if (next === last) return;
      last = next;
      el.style.setProperty("--scroll-progress", next);
    };

    update();
    const offScroll = onScrollFrame(update);

    return () => {
      offScroll();
      sized.disconnect();
    };
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
