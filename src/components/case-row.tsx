"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerScrollLayer } from "@/components/parallax";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Counter-drift inside a case-study row.
 *
 * The row is one card: a photograph flush against a column of type. Moving the
 * two halves apart would open a seam down the middle, so nothing here moves the
 * halves. Instead the **photograph drifts inside its own frame** while the
 * **metrics block drifts the other way inside its column** — two layers passing
 * each other across a card that itself stays put.
 *
 * That is the figure this page did not have and no other page uses. The
 * mastheads drift a picture behind fixed type; `sections/coverage.tsx` pins a
 * picture and travels the band over it; the home case row bows its columns
 * outward. This one is internal to a card and runs in opposite directions,
 * which is what makes it read as depth rather than as the row sliding.
 *
 * One scroll layer per row on the shared rAF loop, writing one custom property.
 * The CSS decides what moves and by how much — see `.case-row` in globals.css.
 */

/** Peak travel of the photograph, in px. The metrics take a fraction of it. */
const SHIFT = 22;

export function CaseRow({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    let shift = 0;

    const unregister = registerScrollLayer({
      el,
      read(rect, viewportH) {
        // -1 below the fold, +1 once the row has passed the middle.
        const progress =
          (viewportH / 2 - (rect.top + rect.height / 2)) / viewportH;
        shift = Math.max(-1, Math.min(1, progress)) * SHIFT;
      },
      write() {
        el.style.setProperty("--case-shift", `${shift.toFixed(2)}px`);
      },
    });

    return () => {
      unregister();
      el.style.removeProperty("--case-shift");
    };
  }, []);

  return (
    <div ref={ref} className={`case-row ${className}`}>
      {children}
    </div>
  );
}
