"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { canHover } from "@/lib/scroll-motion";

/* ---------------------------------------------------------------------------
   One rAF loop drives every scroll-linked layer on the page — parallax drift
   and the section stages in `scroll-stage.tsx` both register here.

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

/** Alias kept for this module's callers; the preference lives in `lib/motion`. */
export const reducedMotion = prefersReducedMotion;

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
 * The layer is oversized by `speed` on both edges and the progress scalar is
 * clamped to ±1, so peak drift is exactly the overhang and the frame can never
 * be uncovered. Those two numbers are a pair — changing one without the other
 * reintroduces the gap described below.
 */
export function Parallax({
  speed = 90,
  flattenOnCoarsePointer = false,
  className = "",
  style,
  children,
}: {
  speed?: number;
  /**
   * Hold the layer still where the pointer is coarse — phones and tablets.
   *
   * Off by default, because this is not the motion preference and must not
   * quietly become one: a visitor on a touch device has expressed nothing, and
   * the site's own preference system (`data-motion`, and the header toggle) is
   * what speaks for people who have. It exists because a drifting layer on a
   * touch screen is driven by a scroll position that moves in flings rather
   * than continuously, which is where this effect looks worst and costs most.
   * Opt in per figure; do not make it the default.
   */
  flattenOnCoarsePointer?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    if (flattenOnCoarsePointer && !canHover()) return;

    let drift = 0;

    return registerScrollLayer({
      el,
      read(rect, viewportH) {
        /*
         * -1 when the element sits below the fold, +1 when it has scrolled
         * past — but only for a frame shorter than the window. The scalar is
         * (0.5 + rect.height / 2 * viewportH) at its extreme, so a band taller
         * than the viewport used to reach 1.5 and beyond, drift past the
         * layer's own overhang, and pull a strip of bare overlay into the top
         * of the frame. Measured at 115px of drift against 90px of overhang on
         * a 500px band in a 268px window: a 15px seam.
         *
         * Clamping is the fix rather than a larger overhang because the
         * overhang is a fixed cost in pixels of image that must always be
         * loaded and composited, while the clamp costs nothing and makes the
         * guarantee exact at every viewport.
         */
        const progress =
          (viewportH / 2 - (rect.top + rect.height / 2)) / viewportH;
        drift = (progress < -1 ? -1 : progress > 1 ? 1 : progress) * speed;
      },
      write() {
        el.style.setProperty("--py", `${drift.toFixed(2)}px`);
      },
    });
  }, [speed, flattenOnCoarsePointer]);

  return (
    <div
      ref={ref}
      data-parallax=""
      className={className}
      /*
       * Grow the layer past its container by the full drift distance on both
       * edges, so the photo always covers the frame. The extra pixel absorbs
       * sub-pixel rounding at the clamped extremes, where the layer edge and
       * the frame edge would otherwise land exactly on top of each other and
       * a fractional device pixel ratio could still show a hairline.
       */
      style={{ ...style, top: -(speed + 1), bottom: -(speed + 1) }}
    >
      {children}
    </div>
  );
}

/**
 * The other parallax figure: an **aperture**.
 *
 * `Parallax` drifts a photo inside a frame that is itself scrolling — the
 * photo lags, and you read the lag. This inverts that. The layer is held
 * against the viewport and the section scrolls over it, so the section reads
 * as a window cut through the page onto a picture that is standing still
 * behind it. Same input, opposite subject: there, the photo moves; here, the
 * page does.
 *
 * This is what `background-attachment: fixed` was meant to do, minus its two
 * problems — it is ignored outright on iOS, and it forces a repaint of the
 * whole band on every frame. A transform on a promoted layer neither.
 *
 * `strength` is how much of the scroll the layer cancels: 1 pins it dead
 * still, 0 is an ordinary static background. Below 1 the picture creeps in the
 * scroll direction, which keeps the band from reading as a printed backdrop.
 */
export function ParallaxWindow({
  strength = 0.92,
  className = "",
  children,
}: {
  strength?: number;
  className?: string;
  children: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const layer = layerRef.current;
    if (!frame || !layer || reducedMotion()) return;

    let offset = 0;
    let height = 0;
    let applied = -1;

    const unregister = registerScrollLayer({
      // Measured on the frame — the layer is the thing being moved, so its own
      // rect is already displaced by the last frame's write.
      el: frame,
      read(rect, viewportH) {
        /*
         * A layer exactly one viewport tall only stays covered at strength 1.
         * Below that it slips against the frame by (1 - strength) of however
         * far the frame has travelled, and on a section taller than the window
         * — which is most of them — it eventually uncovers its own bottom edge
         * and shows a seam of bare overlay. So the layer is oversized by
         * exactly that slip and no more.
         */
        height =
          viewportH + (1 - strength) * Math.max(0, rect.height - viewportH);

        // The part of the frame the window is currently showing, in frame
        // coordinates.
        const visibleTop = Math.max(0, -rect.top);
        const visibleBottom = Math.min(rect.height, -rect.top + viewportH);

        // Pin, then refuse to expose an edge. The clamp only ever engages at
        // the very start and end of the band's travel, where it degrades the
        // aperture into an ordinary drift rather than showing a seam.
        const pinned = -rect.top * strength;
        offset = Math.min(
          Math.max(pinned, visibleBottom - height),
          visibleTop,
        );
      },
      write() {
        // Height only moves on resize, so it is not rewritten every frame —
        // it is the one declaration here that would cost a layout.
        if (height !== applied) {
          layer.style.height = `${height}px`;
          applied = height;
        }
        layer.style.setProperty("--pw", `${offset.toFixed(2)}px`);
      },
    });

    return () => {
      unregister();
      layer.style.removeProperty("--pw");
      layer.style.removeProperty("height");
    };
  }, [strength]);

  return (
    <div ref={frameRef} className={`overflow-hidden ${className}`}>
      <div
        ref={layerRef}
        data-parallax-window=""
        /*
         * Anchored to the frame's top edge, and `h-full` — not `h-screen` —
         * because that class is the whole no-script state. Filling the frame
         * with an untransformed photo is an ordinary full-bleed band, which is
         * what a visitor with scripting off, or with reduced motion set, gets.
         * A viewport-tall default would instead leave the bottom two thirds of
         * a tall section as bare overlay. The read pass replaces this with the
         * measured height on the first frame.
         */
        className="absolute inset-x-0 top-0 h-full"
      >
        {children}
      </div>
    </div>
  );
}
