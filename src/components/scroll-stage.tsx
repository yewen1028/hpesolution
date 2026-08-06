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

/*
 * The figure plays on arrival and on departure, and **not in between**.
 *
 * Both scalars used to be measured from the section's top edge: entry from the
 * fold, exit from the moment that edge crossed the top of the window. On a
 * section taller than the viewport that is wrong, and badly. The services grid
 * on the home page is 1509px in a 748px window, and its exit began the instant
 * the heading scrolled off and completed while 558px of cards were still on
 * screen — so the section tipped away and dimmed while it was being read, then
 * sat at its spent end state for the whole lower half. It was neutral for 16%
 * of its passage.
 *
 * Each phase is now keyed to the edge it belongs to: entry to the top edge
 * arriving, exit to the **bottom** edge leaving. Everything between the two is
 * the settled state — no transform, no fade — which is what a reader scrolling
 * through the content should get.
 */

/** Viewport fraction the entry takes to resolve, measured from the fold. */
const ENTER_SPAN = 0.3;
/** Viewport fraction of the tail the exit plays out over. */
const EXIT_SPAN = 0.9;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * The intro / hold / conclude contract, as two 0–1 scalars.
 *
 * Exported because it is a contract rather than an implementation detail:
 * `ScrollDrift` applies the same phasing to an element inside a stage, and the
 * two must agree about when a thing is arriving, settled and leaving. One copy
 * of these four lines, measured against whichever element is being described.
 */
export function stagePhases(rect: DOMRect, viewportH: number) {
  /*
   * Neither span may exceed half the element, which is what keeps the two
   * phases from overlapping on something shorter than the window — there, the
   * bottom edge starts leaving before the top has finished arriving. `|| 1`
   * guards a zero height, which is what a `display: none` ancestor measures as.
   */
  const half = rect.height / 2;
  const enterSpan = Math.min(viewportH * ENTER_SPAN, half) || 1;
  const exitSpan = Math.min(viewportH * EXIT_SPAN, half) || 1;

  return {
    // 0 while the element is still below the fold, 1 once its top edge has
    // travelled enterSpan past it.
    enter: clamp01((viewportH - rect.top) / enterSpan),
    // 0 until the element's **bottom** edge is within exitSpan of the top of
    // the window, 1 as that edge reaches it. On something tall this is the
    // last screenful and nothing before it.
    exit: clamp01((exitSpan - rect.bottom) / exitSpan),
  };
}

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
        ({ enter, exit } = stagePhases(rect, viewportH));
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
