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
/**
 * Magic UI's **Ripple Button** (21st.dev/magicui/ripple-button): a circle that
 * grows out of the exact point that was clicked.
 *
 * It earns its place because the scale compression above cannot cover
 * everything. The comment on `ButtonLink` puts it plainly — scaling a hairline
 * outline reads as a rendering fault — so ghost buttons, the header's own
 * controls and the back-to-top had no click feedback at all. A ripple is
 * indifferent to whether the thing it is in has a fill or an outline.
 *
 * A real element rather than a pseudo-element, because the buttons that most
 * need this already spend both: `.btn-fill` uses `::before` and `.btn-shine`
 * uses `::after`. It is removed on `animationend`, so nothing accumulates.
 */
function spawnRipple(host: HTMLElement, e: PointerEvent) {
  const rect = host.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // The circle has to reach the corner furthest from the click, or a press
  // near one edge leaves the opposite corner untouched.
  const diameter =
    2 *
    Math.max(
      Math.hypot(x, y),
      Math.hypot(rect.width - x, y),
      Math.hypot(x, rect.height - y),
      Math.hypot(rect.width - x, rect.height - y),
    );

  const span = document.createElement("span");
  span.className = "ripple";
  span.style.width = `${diameter}px`;
  span.style.height = `${diameter}px`;
  span.style.left = `${x - diameter / 2}px`;
  span.style.top = `${y - diameter / 2}px`;

  span.addEventListener("animationend", () => span.remove(), { once: true });
  host.appendChild(span);
}

export function PressProvider() {
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

      const origin = e.target as Element | null;

      // The ripple is opt-in per element and independent of the scale press,
      // because the elements that want one are largely the ones that cannot
      // take the other.
      if (!still) {
        const rippleHost = origin?.closest<HTMLElement>("[data-ripple]");
        if (rippleHost) spawnRipple(rippleHost, e);
      }

      const target = origin?.closest<HTMLElement>("[data-press]");
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
