"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { canHover, prefersReducedMotion } from "@/lib/scroll-motion";

/*
 * One pointer listener and one rAF loop drive every magnetic element on the
 * page, the same way parallax.tsx handles scroll. Elements register on mount
 * and unregister on unmount; reads are batched before writes so a page with
 * several magnets still costs one layout pass per frame.
 *
 * Magnetism is measured from the element's centre against a radius larger than
 * the element itself, so the button leans toward the cursor before it is
 * reached. That needs a pointer position from outside the element, which is
 * why this listens on the window rather than on each button.
 */

type Magnet = {
  el: HTMLElement;
  radius: number;
  strength: number;
  /** Cached rect, refreshed on scroll and resize rather than per frame. */
  rect: DOMRect;
};

const magnets = new Set<Magnet>();

let pointerX = 0;
let pointerY = 0;
let frame = 0;
let listening = false;

function measure() {
  for (const m of magnets) m.rect = m.el.getBoundingClientRect();
}

function tick() {
  frame = 0;

  // Read phase: nothing below touches layout.
  const moves: [Magnet, number, number][] = [];

  for (const m of magnets) {
    const cx = m.rect.left + m.rect.width / 2;
    const cy = m.rect.top + m.rect.height / 2;
    const dx = pointerX - cx;
    const dy = pointerY - cy;
    const distance = Math.hypot(dx, dy);

    if (distance > m.radius) {
      moves.push([m, 0, 0]);
      continue;
    }

    // Pull falls off toward the edge of the radius, so the release is smooth
    // rather than snapping back the moment the cursor leaves.
    const pull = (1 - distance / m.radius) * m.strength;
    moves.push([m, dx * pull, dy * pull]);
  }

  // Write phase.
  for (const [m, x, y] of moves) {
    m.el.style.setProperty("--mx", `${x.toFixed(2)}px`);
    m.el.style.setProperty("--my", `${y.toFixed(2)}px`);
  }
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(tick);
}

function onPointerMove(e: PointerEvent) {
  pointerX = e.clientX;
  pointerY = e.clientY;
  schedule();
}

function startListening() {
  if (listening) return;
  listening = true;
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("scroll", measure, { passive: true });
  window.addEventListener("resize", measure);
}

function stopListening() {
  if (!listening || magnets.size) return;
  listening = false;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("scroll", measure);
  window.removeEventListener("resize", measure);
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
}

/**
 * Wraps an element so it leans toward the cursor.
 *
 * Inert on touch devices and under reduced motion: nothing registers, no
 * listener is attached, and the child renders exactly as it would on its own.
 *
 * @param radius   Distance in px at which the pull starts.
 * @param strength Fraction of the cursor offset the element travels (0–1).
 */
export function Magnetic({
  children,
  radius = 110,
  strength = 0.34,
  className = "",
}: {
  children: ReactNode;
  radius?: number;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Touch devices have no cursor to follow, and a transform that never
    // resets would leave the button visibly off its grid position.
    if (!canHover() || prefersReducedMotion()) return;

    const magnet: Magnet = {
      el,
      radius,
      strength,
      rect: el.getBoundingClientRect(),
    };

    magnets.add(magnet);
    startListening();

    return () => {
      magnets.delete(magnet);
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
      stopListening();
    };
  }, [radius, strength]);

  return (
    <span ref={ref} className={`magnetic ${className}`}>
      {children}
    </span>
  );
}
