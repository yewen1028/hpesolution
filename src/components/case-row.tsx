"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerScrollLayer } from "@/components/parallax";
import { stagePhases } from "@/components/scroll-stage";
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

/**
 * Resting scale of the photograph, and how much it adds at the extremes.
 *
 * The frame is `overflow-hidden` and the picture is oversized so it has margin
 * to drift into. Tying a little more scale to distance-from-centre makes it
 * *settle* as the row reaches the middle of the window and open up again as it
 * leaves — and because the extra is only ever added, the frame gains cover
 * rather than losing it. Going the other way would uncover an edge at exactly
 * the moment the row is most visible.
 */
const ZOOM_REST = 1.06;
const ZOOM_RANGE = 0.045;

/**
 * How much of a viewport the row's departure plays out over.
 *
 * Small on purpose. At 0.4 the fade does not begin until the row's *bottom*
 * edge is within 40% of a screen of the top of the window, by which point most
 * of the row has already left — so nothing dims while it is still being read,
 * which is the rule the section stages follow for the same reason.
 */
const EXIT_SPAN = 0.4;

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
    let zoom = ZOOM_REST;
    let exit = 0;

    const unregister = registerScrollLayer({
      el,
      read(rect, viewportH) {
        // -1 below the fold, +1 once the row has passed the middle.
        const progress =
          (viewportH / 2 - (rect.top + rect.height / 2)) / viewportH;
        const clamped = Math.max(-1, Math.min(1, progress));

        shift = clamped * SHIFT;
        zoom = ZOOM_REST + Math.abs(clamped) * ZOOM_RANGE;
        ({ exit } = stagePhases(rect, viewportH, { exitSpan: EXIT_SPAN }));
      },
      write() {
        el.style.setProperty("--case-shift", `${shift.toFixed(2)}px`);
        el.style.setProperty("--case-zoom", zoom.toFixed(4));
        el.style.setProperty("--case-exit", exit.toFixed(4));
      },
    });

    return () => {
      unregister();
      el.style.removeProperty("--case-shift");
      el.style.removeProperty("--case-zoom");
      el.style.removeProperty("--case-exit");
    };
  }, []);

  /*
   * **Nothing may transform this element.** It is the one being measured, and a
   * transform on it feeds the last frame's displacement back into this frame's
   * `getBoundingClientRect` — the row would settle somewhere other than where
   * the document put it. The departure is applied to `.case-row__body` inside
   * it, which is why the article carries a class of its own.
   */
  return (
    <div ref={ref} className={`case-row ${className}`}>
      {children}
    </div>
  );
}
