"use client";

import { useEffect, useSyncExternalStore } from "react";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion";

/**
 * Cursor spotlight for every `[data-spotlight]` element on the page.
 *
 * This is Magic UI's **Magic Card** effect, published on 21st.dev
 * (21st.dev/magicui/magic-card): a soft radial highlight that tracks the
 * pointer across a card. Two deliberate departures from the published version:
 *
 * - **No framer-motion.** The original gives each card its own motion values
 *   and its own listener. There are eight cards in the services grid alone,
 *   and `motion` is otherwise unused in the shipped site. One delegated
 *   listener writing two custom properties does the same job, and matches how
 *   `press.tsx` already handles the other pointer effect on this site.
 *
 * - **No border ring.** Magic Card's other half illuminates the card's border
 *   under the cursor. That is the right call on a page of detached cards and
 *   the wrong one here: this grid is drawn with shared hairlines, so a ring
 *   per cell would double the very lines the grid is built from. The wash is
 *   the part of the effect that suits the surface.
 *
 * Purely decorative, so it is switched off entirely under reduced motion
 * rather than merely slowed.
 */
export function SpotlightProvider() {
  /*
   * This provider sits outside MotionScope in the layout, so it does not get
   * the remount that page content does. It subscribes instead: the resolved
   * state is an effect dependency, and a switch re-runs the listener setup.
   */
  const reduced = useSyncExternalStore(
    subscribeMotion,
    prefersReducedMotion,
    () => false,
  );

  useEffect(() => {
    if (reduced) return;

    let active: HTMLElement | null = null;
    let frame = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      frame = 0;
      if (!active) return;
      active.style.setProperty("--spot-x", `${x}px`);
      active.style.setProperty("--spot-y", `${y}px`);
    };

    const onMove = (e: PointerEvent) => {
      // `?.closest` yields undefined when the event target is not an Element
      // (a text node, or the document itself on the way out of the window).
      const target =
        (e.target as Element | null)?.closest<HTMLElement>("[data-spotlight]") ??
        null;

      /*
       * **The card that is being left keeps its last cursor position**, and
       * that is load-bearing rather than an oversight.
       *
       * This used to clear `--spot-x` / `--spot-y` the moment the pointer left,
       * on the reasoning that a card should not resume mid-fade with a stale
       * position. What it actually did was jump the gradient to the fallback in
       * the stylesheet — `50% 50%`, the centre of the card — at the exact
       * moment the 0.4s opacity fade-out began. So pointing at a card and then
       * moving away lit an orange blob in the middle of it and faded that out,
       * which reads as a blink from a card the cursor has already left.
       *
       * Leaving the properties in place means the wash fades out from under
       * where the cursor actually was, which is the whole point of the effect,
       * and a card re-entered later gets fresh coordinates from this same
       * handler before it is visible again.
       */
      if (target !== active) active = target;

      if (!target) return;

      // Read here, write in the frame: `getBoundingClientRect` on every
      // pointermove is a forced layout, but it is one per event on one element
      // rather than one per card, and the writes are batched behind rAF.
      const rect = target.getBoundingClientRect();
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;

      if (!frame) frame = requestAnimationFrame(paint);
    };

    document.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      document.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
      active?.style.removeProperty("--spot-x");
      active?.style.removeProperty("--spot-y");
    };
  }, [reduced]);

  return null;
}
