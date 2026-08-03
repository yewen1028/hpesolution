"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { onceInView } from "@/lib/scroll-motion";

/**
 * Wipes its children into view with a `clip-path` inset rather than a fade.
 *
 * The image is fully opaque throughout — only the visible rectangle grows —
 * so the photograph never appears washed out mid-animation the way an opacity
 * transition makes it. That reads as a shutter opening, which suits a site
 * whose whole layout is drawn with hairlines and hard edges.
 *
 * A counter-scale on the inner element means the picture settles into place
 * rather than being static behind a moving window: the wrapper's clip opens
 * while the image relaxes from 1.08 to 1.
 *
 * Motion is entirely in `.mask-reveal` in globals.css, which is where the
 * reduced-motion bail-out lives too. The resting state is the fully revealed
 * one, so anything that never receives `data-shown` still shows the image.
 */
export function MaskReveal({
  children,
  /** Wipe direction. `up` suits a band, `left` suits a row of panels. */
  from = "up",
  delay = 0,
  duration = 1100,
  className = "",
}: {
  children: ReactNode;
  from?: "up" | "left";
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No reduced-motion check: the CSS override covers it, and covers no-JS.
    return onceInView(el, () => el.setAttribute("data-shown", ""), {
      threshold: 0.2,
      safetyMs: 2500,
    });
  }, []);

  return (
    <div
      ref={ref}
      className={`mask-reveal ${className}`}
      data-from={from}
      style={
        {
          "--mask-delay": `${delay}ms`,
          "--mask-duration": `${duration}ms`,
        } as CSSProperties
      }
    >
      <div className="mask-reveal__inner">{children}</div>
    </div>
  );
}
