"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

/* ---------------------------------------------------------------------------
   One rAF loop drives every scroll-linked layer on the page — parallax drift
   and the section fold in `scroll-fold.tsx` both register here.

   Layers register on mount and unregister on unmount, so route changes do not
   leak listeners. Every layer's `read` runs first and every layer's `write`
   runs after, so the whole page costs one layout pass per frame rather than one
   per layer: a `write` mutating style between two `read`s would invalidate
   layout and make the next `getBoundingClientRect` re-flow.
--------------------------------------------------------------------------- */

export type ScrollLayer = {
  el: HTMLElement;
  /** Measure only. Stash what the write needs; touch no styles here. */
  read: (rect: DOMRect, viewportH: number) => void;
  /** Apply only. Read no geometry here. */
  write: () => void;
};

const layers = new Set<ScrollLayer>();
/** Filled during the read pass, drained during the write pass. Reused. */
const pending: ScrollLayer[] = [];
let frame = 0;
let running = false;

export function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function tick() {
  frame = 0;
  const viewportH = window.innerHeight;
  pending.length = 0;

  for (const layer of layers) {
    const rect = layer.el.getBoundingClientRect();
    // Skip anything comfortably off-screen. The bounds are generous on the
    // leading edge so a layer is already in its correct state by the time any
    // part of it is visible.
    if (rect.bottom < -viewportH || rect.top > viewportH * 2) continue;
    layer.read(rect, viewportH);
    pending.push(layer);
  }

  for (const layer of pending) layer.write();
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

/**
 * Adds a layer to the shared loop. Returns the unregister function; the caller
 * is responsible for clearing whatever properties it wrote.
 */
export function registerScrollLayer(layer: ScrollLayer) {
  layers.add(layer);
  start();
  schedule();
  return () => {
    layers.delete(layer);
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

    let drift = 0;

    return registerScrollLayer({
      el,
      read(rect, viewportH) {
        // -1 when the element sits below the fold, +1 when it has scrolled past.
        const progress =
          (viewportH / 2 - (rect.top + rect.height / 2)) / viewportH;
        drift = progress * speed;
      },
      write() {
        el.style.setProperty("--py", `${drift.toFixed(2)}px`);
      },
    });
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
