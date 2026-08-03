"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/* ---------------------------------------------------------------------------
   One rAF loop drives every parallax layer on the page.
   Layers register on mount and unregister on unmount, so route changes do not
   leak listeners. Reads happen in a single batch, writes in a second batch,
   which keeps the whole page to one layout pass per frame.
--------------------------------------------------------------------------- */

type Layer = { el: HTMLElement; speed: number };

const layers = new Set<Layer>();
let frame = 0;
let running = false;

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function tick() {
  frame = 0;
  const viewportH = window.innerHeight;

  for (const layer of layers) {
    const rect = layer.el.getBoundingClientRect();
    // Skip anything comfortably off-screen.
    if (rect.bottom < -viewportH || rect.top > viewportH * 2) continue;

    // -1 when the element sits below the fold, +1 when it has scrolled past.
    const progress = (viewportH / 2 - (rect.top + rect.height / 2)) / viewportH;
    const drift = progress * layer.speed;
    layer.el.style.setProperty("--py", `${drift.toFixed(2)}px`);
  }
}

function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(tick);
}

function start() {
  if (running) return;
  running = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function stop() {
  running = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
}

function register(el: HTMLElement, speed: number) {
  const layer: Layer = { el, speed };
  layers.add(layer);
  start();
  schedule();
  return () => {
    layers.delete(layer);
    el.style.removeProperty("--py");
    if (layers.size === 0) stop();
  };
}

/**
 * Wraps a media layer and drifts it against the scroll.
 *
 * `speed` is the total travel in pixels across a full viewport of scrolling.
 * The layer must be oversized by at least `speed` so drift never reveals an
 * edge — `Parallax` handles that itself via the `inset` scaling below.
 */
export function Parallax({
  speed = 90,
  className = "",
  style,
  children,
}: {
  speed?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    return register(el, speed);
  }, [speed]);

  return (
    <div
      ref={ref}
      data-parallax=""
      className={className}
      // Grow the layer past its container by the full drift distance on both
      // edges, so the photo always covers the frame.
      style={{ ...style, top: -speed, bottom: -speed }}
    >
      {children}
    </div>
  );
}
