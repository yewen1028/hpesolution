"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { onceInView, prefersReducedMotion } from "@/lib/scroll-motion";

/**
 * Total time the per-stroke offsets may span within one icon, however many
 * strokes it has. See the note where it is used.
 */
const STAGGER_BUDGET_MS = 480;

/** Every SVG element that accepts `pathLength` and can be stroke-drawn. */
const DRAWABLE = "path, line, polyline, polygon, circle, ellipse, rect";

/**
 * Draws its child SVG in on scroll, stroke by stroke.
 *
 * ## Why `pathLength`, not `getTotalLength()`
 *
 * A dash-draw needs `stroke-dasharray` to equal the path's length, and the
 * usual way to get that is `getTotalLength()` per element. That means a layout
 * read for every sub-path of every icon on the page, and it does not work
 * uniformly — `getTotalLength` is unreliable on `<rect>` across engines.
 *
 * Setting `pathLength="1"` instead tells the renderer to *treat* the path as
 * being 1 unit long, whatever its real geometry. `stroke-dasharray: 1` then
 * covers exactly one path on any shape, and the whole animation becomes CSS
 * with no measurement at all. It is also what makes the strokes of one icon
 * draw at a consistent apparent speed: a 4-unit line and a 60-unit curve both
 * normalise to 1.
 *
 * ## Why the hidden state is armed in JavaScript
 *
 * The icon is server-rendered complete, and JS rewinds it before drawing —
 * the same order `counter.tsx` uses. Reduced motion returns before the rewind
 * and no-JS never reaches it, so in both cases the icon simply is what it was.
 * Nothing here can leave an icon half-drawn.
 */
export function DrawIcon({
  children,
  /** Per-stroke draw time. */
  duration = 900,
  /** Delay between strokes within one icon. */
  stagger = 90,
  /** Delay before the first stroke — use to offset icons in a grid. */
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  duration?: number;
  stagger?: number;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    // Leaves the icon exactly as rendered.
    if (prefersReducedMotion()) return;

    const shapes = host.querySelectorAll<SVGElement>(DRAWABLE);
    if (shapes.length === 0) return;

    /*
     * Stagger is budgeted, not fixed. Lucide glyphs vary enormously in stroke
     * count — `wrench` is a single path, `server-cog` is twelve — so a flat
     * 90ms between strokes means one icon finishes in 900ms and its neighbour
     * takes 1890ms. Spreading a fixed budget across however many strokes there
     * are keeps every icon landing inside roughly the same window.
     */
    const effectiveStagger =
      shapes.length > 1
        ? Math.min(stagger, STAGGER_BUDGET_MS / (shapes.length - 1))
        : 0;

    host.style.setProperty("--draw-stagger", `${effectiveStagger.toFixed(1)}ms`);

    shapes.forEach((shape, i) => {
      // Normalises every stroke to one unit long — see the note above.
      shape.setAttribute("pathLength", "1");
      shape.style.setProperty("--i", String(i));
    });

    // Arming this is the rewind: CSS hides the strokes only once it is present.
    host.setAttribute("data-draw", "");

    const stop = onceInView(host, () => host.setAttribute("data-draw", "shown"), {
      threshold: 0.4,
      safetyMs: 2500,
    });

    return () => {
      stop();
      // Unmounting mid-draw must leave the finished icon, not a fragment.
      host.setAttribute("data-draw", "shown");
    };
    // `stagger` is read once on mount; it is a constant at every call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span
      ref={ref}
      className={`draw-icon ${className}`}
      style={
        {
          "--draw-duration": `${duration}ms`,
          "--draw-stagger": `${stagger}ms`,
          "--draw-delay": `${delay}ms`,
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}
