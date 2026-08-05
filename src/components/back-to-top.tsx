"use client";

import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
import { onScrollFrame, prefersReducedMotion } from "@/lib/scroll-motion";

/** Appears once the visitor is this far down. 1.5 viewports of travel. */
const SHOW_AFTER = 1.5;

/**
 * Back-to-top control.
 *
 * Visibility is an attribute written from the shared scroll loop rather than
 * React state — the flag flips at one scroll position and re-rendering the tree
 * for it would be wasted work. The button stays mounted throughout so it can
 * animate out; `visibility` in the hidden state is what keeps it off the tab
 * order rather than a conditional render.
 *
 * The scroll itself honours reduced motion: `smooth` becomes `auto`, since a
 * long smooth scroll is exactly the kind of movement that preference is asking
 * to avoid.
 */
export function BackToTop() {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Guarded: this runs on every scroll frame, and writing an attribute even
    // to the value it already holds invalidates style for the element.
    let shown: boolean | null = null;

    const update = () => {
      const next = window.scrollY > window.innerHeight * SHOW_AFTER;
      if (next === shown) return;
      shown = next;
      el.toggleAttribute("data-shown", next);
    };

    update();
    return onScrollFrame(update);
  }, []);

  const toTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    // Scrolling alone does not move focus, which would strand a keyboard user
    // at the bottom of the document.
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={toTop}
      data-ripple=""
      className="back-to-top"
      aria-label="Back to top"
    >
      <ArrowUp size={18} strokeWidth={2.25} aria-hidden="true" />
    </button>
  );
}
