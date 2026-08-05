"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { reducedMotion, registerScrollLayer } from "@/components/parallax";

/* ---------------------------------------------------------------------------
   Section-scale scroll choreography.

   This replaces the earlier single-figure `ScrollFold`, which was applied to
   four sections of the home page and made half the page move in exactly the
   same way. One gesture repeated four times does not read as rhythm, it reads
   as a template. So the component now carries a small vocabulary and each
   section is given a different word from it.

   Every variant is driven by the same two scalars and the same rAF loop in
   `parallax.tsx`; only the CSS in `globals.css` differs. Adding a figure means
   adding one `[data-stage="..."]` rule, not another scroll listener.

   Shared rules, which every variant must keep:

   - **The settled state is the default state.** `--stage-enter` and
     `--stage-exit` are unset until this mounts and stamps `data-stage`, and
     the CSS only reads them under that attribute. Scripting off, or before
     hydration, a section is just a section.
   - **Nothing may become unreadable.** Entry fades from 0.35, never 0, and the
     exit fade stops well short of transparent, so a stalled loop cannot leave
     a section invisible. Reduced motion switches all of it off.

   Do not wrap a section whose subtree uses `position: sticky` or `fixed`.
   `perspective()` and `clip-path` both make this element the containing block,
   and a sticky child would then stick inside a moving frame. That rules out
   the home page's `Positioning` band, whose photo column is sticky.
--------------------------------------------------------------------------- */

export type StageVariant =
  /** Hinges at its own top edge and tips away as it leaves. */
  | "fold"
  /** Settles forward out of the page and recedes again. No rotation. */
  | "zoom"
  /** Wipes open downward, then closes from the top. The section is an aperture. */
  | "curtain"
  /** Travels up into place and dims on the way out. The calm one. */
  | "rise"
  /**
   * Crosses the page sideways: arrives from the right, settles, carries on to
   * the left as it leaves. The only figure that moves on the horizontal axis,
   * which is what keeps it distinct from the other four.
   *
   * It is only safe on a section with **no background and no border of its
   * own** — anything with a fill would drag its edge across and leave a strip
   * of the page showing down one side. `CasePreview` is `py-24` and nothing
   * else, so only its contents travel.
   */
  | "pan";

/** Viewport fraction the entry takes to resolve, measured from the fold. */
const ENTER_SPAN = 0.3;
/** Fraction of the section's own height the exit plays out over. */
const EXIT_SPAN = 0.9;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export function ScrollStage({
  variant,
  className = "",
  children,
}: {
  variant: StageVariant;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;

    let enter = 1;
    let exit = 0;

    el.setAttribute("data-stage", variant);

    const unregister = registerScrollLayer({
      el,
      read(rect, viewportH) {
        // 0 while the section is still below the fold, 1 once it has travelled
        // ENTER_SPAN of a viewport past it.
        enter = clamp01((viewportH - rect.top) / (viewportH * ENTER_SPAN));

        // 0 until the section's top edge crosses the top of the window, 1 once
        // it has gone far enough past that the section is spent. Capped at a
        // viewport so a very tall section does not leave in slow motion.
        exit = clamp01(
          -rect.top / (Math.min(rect.height, viewportH) * EXIT_SPAN),
        );
      },
      write() {
        el.style.setProperty("--stage-enter", enter.toFixed(4));
        el.style.setProperty("--stage-exit", exit.toFixed(4));
      },
    });

    return () => {
      unregister();
      el.removeAttribute("data-stage");
      el.style.removeProperty("--stage-enter");
      el.style.removeProperty("--stage-exit");
    };
  }, [variant]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
