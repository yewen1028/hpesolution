"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/* ---------------------------------------------------------------------------
   Flickering grid — the Magic UI background component published on 21st.dev
   (21st.dev/magicui/flickering-grid), rebuilt here against its documented prop
   surface: squareSize, gridGap, color, maxOpacity, flickerChance.

   Three things differ from the published component, all of them house rules:

   - **It is drawn on a canvas, not as SVG rects.** At this square size a band
     this wide is several thousand cells; as DOM nodes that is a style
     recalculation every frame. One canvas is one paint.
   - **It stops when it is not on screen.** An `IntersectionObserver` parks the
     rAF loop, so a background at the bottom of the page costs nothing while
     you are reading the top of it.
   - **Reduced motion gets the grid, not nothing.** The field is painted once at
     a settled opacity and left there. The same principle as the network map:
     the static state is the complete state, and the animation only ever
     replays an arrival.

   It is decorative — `aria-hidden`, and the panel it sits behind carries its
   own contrast without it.
--------------------------------------------------------------------------- */

export function FlickeringGrid({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "#f26f21",
  maxOpacity = 0.3,
  reveal = false,
  className = "",
}: {
  /** Cell edge in CSS pixels. */
  squareSize?: number;
  /** Gap between cells in CSS pixels. */
  gridGap?: number;
  /** Probability per second that a given cell picks a new opacity. */
  flickerChance?: number;
  /** Any CSS colour; resolved to rgb once via a 1×1 scratch canvas. */
  color?: string;
  /** Ceiling for a cell's opacity. */
  maxOpacity?: number;
  /**
   * Switch the field on outward from the centre the first time it scrolls into
   * view, instead of arriving already lit.
   *
   * This is the one idea worth keeping from the WebGL dot-matrix background it
   * was added for: that shader's whole signature is `dist_from_center * 0.01 +
   * random * 0.15`, cells lighting in a ragged ring travelling outward, each
   * overshooting slightly as it lands. Reproduced here in the 2D loop that was
   * already running — see the note in `sections/contact-cta.tsx` for why the
   * shader itself did not come with it.
   *
   * Off under reduced motion, like every other arrival on this site: the field
   * is simply already there.
   */
  reveal?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const still = prefersReducedMotion();

    /*
     * Resolve the colour once, up front.
     *
     * A canvas `fillStyle` cannot take `var(--color-brand)` — it is not a CSS
     * colour, it is a substitution the cascade performs — and an unparseable
     * value leaves `fillStyle` at its previous setting, which is opaque black.
     * On the near-black panel this component was written for, that failure is
     * completely silent: a grid of black squares on black. So a token is read
     * off the document first, and only the resolved value reaches the canvas.
     */
    let resolved = color.trim();
    const token = /^var\(\s*(--[\w-]+)\s*\)$/.exec(resolved);
    if (token) {
      resolved = getComputedStyle(document.documentElement)
        .getPropertyValue(token[1])
        .trim();
    }

    // `fillStyle` normalises whatever survives that to "#rrggbb", and refuses
    // to change at all if it is not a colour — so compare, and fall back to the
    // brand orange rather than painting an invisible grid.
    context.fillStyle = "#000000";
    context.fillStyle = resolved;
    const hex =
      context.fillStyle === "#000000" && resolved !== "#000000"
        ? "#f26f21"
        : (context.fillStyle as string);
    const rgb = `${parseInt(hex.slice(1, 3), 16)},${parseInt(
      hex.slice(3, 5),
      16,
    )},${parseInt(hex.slice(5, 7), 16)}`;

    let cols = 0;
    let rows = 0;
    let squares = new Float32Array(0);
    let dpr = 1;

    /*
     * Per-cell switch-on time in seconds, and how far `progress` has to travel
     * before the last of them is lit. `progress` only advances inside `tick`,
     * which only runs while the band is on screen — so the arrival plays when
     * the visitor reaches the section, not while it is still below the fold.
     *
     * `Infinity` means "already arrived": no reveal requested, or reduced
     * motion, where the settled state is the whole state.
     */
    let revealAt = new Float32Array(0);
    let revealEnd = 0;
    let progress = reveal && !still ? 0 : Number.POSITIVE_INFINITY;
    /** Seconds of travel per cell of distance from the centre. */
    const REVEAL_SPREAD = 0.016;
    /** Random spray, so the front edge is ragged rather than a clean ring. */
    const REVEAL_JITTER = 0.32;
    /** How long a cell burns brighter than its resting value after landing. */
    const REVEAL_FLARE_S = 0.14;

    function resize() {
      const { width, height } = parent!.getBoundingClientRect();
      if (width === 0 || height === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.ceil(width * dpr);
      canvas!.height = Math.ceil(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;

      const step = squareSize + gridGap;
      cols = Math.ceil(width / step);
      rows = Math.ceil(height / step);

      squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        // Reduced motion gets a flat, quiet field rather than a random one:
        // a frozen random pattern reads as an artefact, an even one reads as
        // texture.
        squares[i] = still ? maxOpacity * 0.55 : Math.random() * maxOpacity;
      }

      revealAt = new Float32Array(cols * rows);
      revealEnd = 0;
      if (reveal) {
        const cx = cols / 2;
        const cy = rows / 2;
        for (let x = 0; x < cols; x++) {
          for (let y = 0; y < rows; y++) {
            const at =
              Math.hypot(x - cx, y - cy) * REVEAL_SPREAD +
              Math.random() * REVEAL_JITTER;
            revealAt[x * rows + y] = at;
            if (at > revealEnd) revealEnd = at;
          }
        }
      }

      draw();
    }

    function draw() {
      const step = (squareSize + gridGap) * dpr;
      const size = squareSize * dpr;
      context!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const i = x * rows + y;
          let opacity = squares[i];

          if (progress !== Number.POSITIVE_INFINITY) {
            const at = revealAt[i];
            // Not lit yet.
            if (progress < at) continue;
            // Just landed: burn a little brighter, then settle. This is the
            // shader's 1.25x clamp, which is what stops the arrival reading as
            // cells merely fading up.
            if (progress < at + REVEAL_FLARE_S) opacity = Math.min(1, opacity * 1.3);
          }

          if (opacity <= 0.01) continue;
          context!.fillStyle = `rgba(${rgb},${opacity})`;
          context!.fillRect(x * step, y * step, size, size);
        }
      }
    }

    if (still) {
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(parent);
      return () => observer.disconnect();
    }

    let frame = 0;
    let last = 0;
    let visible = false;

    function tick(now: number) {
      frame = requestAnimationFrame(tick);
      // Seconds since the previous frame, clamped so a backgrounded tab does
      // not come back and reroll the entire field at once.
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;

      const chance = flickerChance * delta;
      let changed = false;
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < chance) {
          squares[i] = Math.random() * maxOpacity;
          changed = true;
        }
      }

      // While the field is still arriving every frame changes something, even
      // when no cell happened to reroll. Past the last switch-on the gate is
      // retired outright, so the steady state costs exactly what it did before.
      if (progress !== Number.POSITIVE_INFINITY) {
        progress += delta;
        changed = true;
        if (progress > revealEnd + REVEAL_FLARE_S) {
          progress = Number.POSITIVE_INFINITY;
        }
      }

      if (changed) draw();
    }

    const seen = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting === visible) return;
        visible = entry.isIntersecting;
        if (visible) {
          last = performance.now();
          frame = requestAnimationFrame(tick);
        } else if (frame) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "120px" },
    );

    const sized = new ResizeObserver(resize);
    resize();
    sized.observe(parent);
    seen.observe(parent);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      sized.disconnect();
      seen.disconnect();
    };
  }, [squareSize, gridGap, flickerChance, color, maxOpacity, reveal]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
