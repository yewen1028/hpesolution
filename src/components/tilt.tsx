"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { canHover, prefersReducedMotion } from "@/lib/scroll-motion";

/**
 * Perspective tilt that follows the cursor across the element.
 *
 * Listeners are attached to the element, not the window: unlike the magnets,
 * a tilt only has work to do while the pointer is actually inside it, and
 * `pointerenter`/`pointerleave` bracket that exactly. Writes are batched into
 * one rAF so a fast cursor across a grid of cards cannot queue up frames.
 *
 * Inert on touch devices and under reduced motion.
 */
export function Tilt({
  children,
  as: Tag = "div",
  /** Maximum rotation in degrees at the corners. Keep it small — past ~8° the
   *  type on the card starts to read as distorted rather than lifted. */
  max = 5,
  /** Lift in px applied while hovered, on top of the rotation. */
  lift = 6,
  perspective = 900,
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  max?: number;
  lift?: number;
  perspective?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!canHover() || prefersReducedMotion()) return;

    let frame = 0;
    let rect: DOMRect | null = null;
    let rx = 0;
    let ry = 0;

    const write = () => {
      frame = 0;
      el.style.setProperty("--tilt-x", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${ry.toFixed(2)}deg`);
    };

    const enter = () => {
      // Measured once per hover, not per frame: the card cannot move while
      // the cursor is inside it.
      rect = el.getBoundingClientRect();
      el.setAttribute("data-tilt", "active");
    };

    const move = (e: PointerEvent) => {
      if (!rect) rect = el.getBoundingClientRect();

      // -0.5 … 0.5 from the centre on each axis.
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;

      // Pointer below centre tips the card away from the viewer, so rotateX
      // takes the negated Y.
      rx = -py * max * 2;
      ry = px * max * 2;

      if (!frame) frame = requestAnimationFrame(write);
    };

    const leave = () => {
      rect = null;
      rx = 0;
      ry = 0;
      el.removeAttribute("data-tilt");
      if (!frame) frame = requestAnimationFrame(write);
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);

    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      if (frame) cancelAnimationFrame(frame);
      el.removeAttribute("data-tilt");
      el.style.removeProperty("--tilt-x");
      el.style.removeProperty("--tilt-y");
    };
  }, [max, lift]);

  return (
    <Tag
      ref={ref}
      className={`tilt ${className}`}
      style={{ "--tilt-perspective": `${perspective}px`, "--tilt-lift": `${lift}px` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
