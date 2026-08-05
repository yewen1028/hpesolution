"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerScrollLayer } from "@/components/parallax";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A travelling wave across a row of figures.
 *
 * Every other layered figure on this site separates its columns by **amplitude**
 * — the case-study row bows its outer columns furthest and holds the middle
 * still, the partner band moves as one. This one gives all four cells the same
 * travel and staggers them in **phase** instead: each is a fraction of a
 * viewport behind the one before it, so the row tips into a diagonal and the
 * diagonal sweeps along as you scroll. Same distance, different moment.
 *
 * That distinction is the reason it exists rather than reusing what is already
 * here: a row of four equal figures should not have one of them singled out by
 * moving further than the rest, which is exactly what an amplitude-weighted
 * version would do.
 *
 * The travel is deliberately small. These cells sit in a strip with 32–40px of
 * vertical padding and a hairline along the top; anything larger would push a
 * numeral into that rule.
 */

/** Peak travel, px. Comfortably inside the strip's own padding. */
const SHIFT = 14;
/** How far behind its neighbour each cell runs, as a fraction of a viewport. */
const PHASE = 0.07;

export function StatParallax({
  index,
  children,
}: {
  index: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let drift = 0;

    const unregister = registerScrollLayer({
      el,
      read(rect, viewportH) {
        // -1 below the fold, +1 once well past it.
        const progress =
          (viewportH / 2 - (rect.top + rect.height / 2)) / viewportH;
        // The phase offset is what makes it a wave rather than a slant that
        // holds its shape: each cell reaches a given point in the figure later
        // than the one to its left.
        const shifted = progress + index * PHASE;
        drift = Math.max(-1, Math.min(1, shifted)) * SHIFT;
      },
      write() {
        el.style.setProperty("--stat-y", `${drift.toFixed(2)}px`);
      },
    });

    return () => {
      unregister();
      el.style.removeProperty("--stat-y");
    };
  }, [index]);

  return (
    <div ref={ref} className="stat-parallax">
      {children}
    </div>
  );
}
