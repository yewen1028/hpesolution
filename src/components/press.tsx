"use client";

import { useEffect } from "react";

/**
 * Press feedback for every `[data-press]` element on the page.
 *
 * ## Why JavaScript at all, when `:active` exists
 *
 * `:active` alone is not enough on touch. iOS Safari does not apply it to an
 * element unless that element (or an ancestor) has a touch listener bound or
 * `cursor: pointer` set, so a button that presses correctly with a mouse can be
 * completely inert under a thumb. Android browsers apply it, but only after the
 * ~300ms tap delay on some configurations, which reads as lag rather than
 * feedback.
 *
 * Pointer Events solve both at once: `pointerdown` / `pointerup` fire for mouse,
 * touch and pen through one code path, with no delay and no per-platform
 * branching. The CSS keeps `:active` as well, so the effect still works with
 * JavaScript disabled — it is a progressive enhancement, not a replacement.
 *
 * ## Why delegation
 *
 * One listener on the document rather than one per button. There are more than
 * thirty pressable elements across the site and they mount and unmount with
 * every route change; delegation means nothing to register, nothing to leak,
 * and new markup works without being wired up.
 *
 * Mount once, in the root layout.
 */
export function PressProvider() {
  useEffect(() => {
    let pressed: HTMLElement | null = null;

    const release = () => {
      if (!pressed) return;
      pressed.removeAttribute("data-pressed");
      pressed = null;
    };

    const onDown = (e: PointerEvent) => {
      // Primary button only: a right-click or middle-click opens a menu or a
      // new tab, neither of which should look like a press.
      if (e.button !== 0) return;

      const target = (e.target as Element | null)?.closest<HTMLElement>(
        "[data-press]",
      );
      if (!target) return;

      release();
      pressed = target;
      target.setAttribute("data-pressed", "");
    };

    /*
     * `pointercancel` matters more than it looks: it is what fires when a tap
     * turns into a scroll. Without it the element stays visually depressed
     * while the page scrolls away underneath the finger.
     */
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", release, { passive: true });
    document.addEventListener("pointercancel", release, { passive: true });
    // Dragging off the element, or the window losing focus mid-press.
    document.addEventListener("pointerleave", release, { passive: true });
    window.addEventListener("blur", release);

    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", release);
      document.removeEventListener("pointercancel", release);
      document.removeEventListener("pointerleave", release);
      window.removeEventListener("blur", release);
      release();
    };
  }, []);

  return null;
}
