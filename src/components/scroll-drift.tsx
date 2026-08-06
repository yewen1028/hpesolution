"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { reducedMotion, registerScrollLayer } from "@/components/parallax";
import { stagePhases } from "@/components/scroll-stage";

/* ---------------------------------------------------------------------------
   A parallax layer that plays on arrival and departure and holds still in
   between — the same contract `ScrollStage` gives a whole section, measured
   against one element inside it.

   The two are not interchangeable, which is why this exists. A stage is
   measured against the section, and a section's entry resolves within 0.3 of a
   viewport of its top edge appearing: on the home page's services band that is
   over before the grid itself has cleared the fold, so a drift derived from
   the section's scalars does its whole travel below the fold where nobody can
   see it. Measured against the *list*, the same phasing puts the movement
   exactly where the list is arriving.

   This element is the ruler and is never itself transformed — the moved thing
   is the child that reads the property. Measuring the element you are moving
   feeds the last frame's transform back into this frame's geometry, which
   turns a linear drift into a lagging one that settles somewhere other than
   where the document put it. A transform does not affect layout, so this
   wrapper's box stays exactly the child's resting box.

   Publishes one scalar, `--drift-p`:

       +1  fully arrived-from   (below its resting place, on the way in)
        0  settled — the entire middle of the element's passage
       -1  fully departed-to    (above its resting place, on the way out)

   The consumer decides what that means and how far; `.svc-list` in globals.css
   multiplies it by a travel distance, which keeps the distance responsive and
   in the stylesheet. Unset — no script, reduced motion, before hydration — it
   resolves to 0 and the child is where the document put it.
--------------------------------------------------------------------------- */

export function ScrollDrift({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;

    let progress = 0;

    const unregister = registerScrollLayer({
      el,
      read(rect, viewportH) {
        const { enter, exit } = stagePhases(rect, viewportH);
        progress = 1 - enter - exit;
      },
      write() {
        el.style.setProperty("--drift-p", progress.toFixed(4));
      },
    });

    return () => {
      unregister();
      el.style.removeProperty("--drift-p");
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
