"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { registerScrollLayer } from "@/components/parallax";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A window that opens as you reach it and closes behind you.
 *
 * The frame's clip is driven by how far the element is from the middle of the
 * viewport: pinched top and bottom while it is approaching or leaving, fully
 * open as it passes through. The picture inside keeps its own drift, so the two
 * run at different rates — the aperture changing shape against a photograph
 * that is itself moving is where the depth comes from. A shutter over a still
 * picture would only be a wipe.
 *
 * Distinct from everything else on the site by construction. `curtain` clips a
 * whole section once, on entry and exit; `MaskReveal` wipes a frame open a
 * single time and leaves it open; `aperture` pins a picture and travels the
 * band over it. This one is continuous and symmetrical — the same figure plays
 * forwards on the way in and backwards on the way out, which is exactly the
 * "before and after" it was asked for.
 *
 * Rides the shared rAF loop, so it costs no listener of its own.
 */

/** Maximum pinch at top and bottom, as a percentage of the frame's height. */
const MAX_INSET = 7;

export function ScrollShutter({
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

    let inset = 0;

    const unregister = registerScrollLayer({
      el,
      read(rect, viewportH) {
        // 0 when the frame is centred, 1 when it is a half-viewport away in
        // either direction. Squared, so the window spends most of its travel
        // open and shuts briskly at the ends rather than never quite settling.
        const distance = Math.abs(
          (rect.top + rect.height / 2 - viewportH / 2) / viewportH,
        );
        const t = Math.min(1, distance / 0.55);
        inset = t * t * MAX_INSET;
      },
      write() {
        el.style.setProperty("--shutter", `${inset.toFixed(2)}%`);
      },
    });

    return () => {
      unregister();
      el.style.removeProperty("--shutter");
    };
  }, []);

  return (
    <div ref={ref} className={`scroll-shutter ${className}`}>
      {children}
    </div>
  );
}
