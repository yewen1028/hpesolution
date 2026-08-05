"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerScrollLayer } from "@/components/parallax";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Layered drift for a row of cards: each column travels at its own rate, so the
 * row separates into planes as it crosses the viewport and closes back up as it
 * leaves.
 *
 * This is the parallax proper — layers moving at different speeds against one
 * another — rather than a stage, which moves a whole section as one block. The
 * two are on different axes here and do not fight: `pan` carries the section
 * sideways, this carries the cards vertically.
 *
 * Depth reads from the outside in. The first and last columns travel furthest
 * and the middle one barely moves, so the row appears to bow toward the reader
 * at its centre rather than shearing off in one direction.
 *
 * Rides the shared rAF loop in `parallax.tsx` — reads for every layer on the
 * page are batched before any write, so a row of three costs one measurement
 * pass, not three.
 */

/** Peak travel in px for the outermost cards. The middle scales down from it. */
const DRIFT = 26;

export function CaseParallax({
  index,
  count,
  className = "",
  children,
}: {
  /** Column position, 0-based. */
  index: number;
  /** Columns in the row, so the middle can be found without hardcoding it. */
  count: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    /*
     * -1 for the leftmost column, +1 for the rightmost, 0 for the middle of an
     * odd row. Squaring the distance from centre and keeping the sign gives the
     * outer columns most of the travel and leaves the centre nearly still.
     */
    const centre = (count - 1) / 2;
    const offset = centre === 0 ? 0 : (index - centre) / centre;
    const weight = Math.sign(offset) * offset * offset;

    let drift = 0;

    const unregister = registerScrollLayer({
      el,
      read(rect, viewportH) {
        const progress =
          (viewportH / 2 - (rect.top + rect.height / 2)) / viewportH;
        drift = Math.max(-1, Math.min(1, progress)) * DRIFT * weight;
      },
      write() {
        el.style.setProperty("--case-y", `${drift.toFixed(2)}px`);
      },
    });

    return () => {
      unregister();
      el.style.removeProperty("--case-y");
    };
  }, [index, count]);

  return (
    <div ref={ref} className={`case-parallax ${className}`}>
      {children}
    </div>
  );
}
