"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { onScrollFrame, prefersReducedMotion } from "@/lib/scroll-motion";

/**
 * Drives a 0→1 `--theme-progress` from how far a section has entered the
 * viewport, so a colour change can be tied to scroll position rather than
 * flipping the instant an edge crosses the fold.
 *
 * Used on the dark operations band: its tint deepens as the band arrives, so
 * the light page resolves into the dark one over roughly half a viewport
 * instead of switching between two frames.
 *
 * The value is written to the element's own style, not to `:root`. Two of these
 * on one page would otherwise fight over a single global, and the site already
 * has a second dark band further down.
 *
 * Reduced motion pins it to 1 — the finished state — so the band is simply its
 * intended colour with no scroll-linked movement.
 */
export function ScrollTheme({
  children,
  className = "",
  /**
   * Fraction of a viewport over which the shift completes, measured from the
   * section's top edge reaching the bottom of the screen.
   */
  span = 0.55,
}: {
  children: ReactNode;
  className?: string;
  span?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.setProperty("--theme-progress", "1");
      return;
    }

    /*
     * Guarded, because the clamp means this spends most of the page pinned at
     * 0 or 1 — and re-writing the same value still invalidates style for this
     * band and everything inside it, on every scroll frame, forever. The band
     * directly above the coverage section is exactly where that was being paid.
     */
    let last = "";

    const update = () => {
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const distance = Math.max(1, viewportH * span);

      // 0 while the top edge is still at the bottom of the screen, 1 once it
      // has travelled `distance` upward. Clamped, so it holds at 1 for the
      // whole of a tall band.
      const travelled = viewportH - rect.top;
      const progress = Math.min(1, Math.max(0, travelled / distance));

      const next = progress.toFixed(4);
      if (next === last) return;
      last = next;
      el.style.setProperty("--theme-progress", next);
    };

    update();
    return onScrollFrame(update);
  }, [span]);

  return (
    <div
      ref={ref}
      className={`scroll-theme ${className}`}
      // Server-rendered at the finished value: if script never runs, the band
      // is its full colour rather than a washed-out half state.
      style={{ "--theme-progress": 1 } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
