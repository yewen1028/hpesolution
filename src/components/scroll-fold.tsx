"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { reducedMotion, registerScrollLayer } from "@/components/parallax";

/* ---------------------------------------------------------------------------
   Section-scale scroll choreography: a section rises and resolves as it comes
   up from the fold, then hinges away at its top edge as it leaves through the
   top of the window — the "page folding shut behind you" figure the parallax
   sites on awwwards.com/websites/parallax use to separate one full-height
   section from the next.

   It rides the shared rAF loop in `parallax.tsx`; there is no scroll listener
   here. Two custom properties carry the whole effect, and the CSS in
   `globals.css` composes them into one transform.

   Two rules this has to respect:

   - **The settled state is the default state.** `--fold-enter` and
     `--fold-exit` are unset until this component mounts and stamps
     `data-fold="on"`, and the CSS only reads them under that attribute. With
     scripting off, or before hydration, the section is simply a section.
   - **Nothing may become unreadable.** Entry fades from 0.35, not from 0, and
     the exit fade stops well short of transparent, so a stalled rAF loop can
     never leave a section invisible. Reduced motion switches all of it off.

   Do not wrap a section whose subtree uses `position: sticky` or `fixed`: the
   `perspective()` in the composed transform makes this element the containing
   block, and a sticky child would then stick inside a moving frame. That rules
   out the home page's `Positioning` band, whose photo column is sticky.
--------------------------------------------------------------------------- */

/** Viewport fraction the entry takes to resolve, measured from the fold. */
const ENTER_SPAN = 0.3;
/** How far the section travels up into place, in px. */
const ENTER_RISE = 48;
/** Fraction of the section's own height the fold plays out over. */
const EXIT_SPAN = 0.9;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export function ScrollFold({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;

    let enter = 1;
    let exit = 0;

    el.setAttribute("data-fold", "on");

    const unregister = registerScrollLayer({
      el,
      read(rect, viewportH) {
        // 0 while the section is still below the fold, 1 once it has travelled
        // ENTER_SPAN of a viewport past it.
        enter = clamp01((viewportH - rect.top) / (viewportH * ENTER_SPAN));

        // 0 until the section's top edge crosses the top of the window, 1 once
        // it has gone far enough past that the section is spent. Capped at a
        // viewport so a very tall section does not fold in slow motion.
        exit = clamp01(
          -rect.top / (Math.min(rect.height, viewportH) * EXIT_SPAN),
        );
      },
      write() {
        el.style.setProperty("--fold-enter", enter.toFixed(4));
        el.style.setProperty("--fold-exit", exit.toFixed(4));
      },
    });

    return () => {
      unregister();
      el.removeAttribute("data-fold");
      el.style.removeProperty("--fold-enter");
      el.style.removeProperty("--fold-exit");
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={
        {
          "--fold-rise": `${ENTER_RISE}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
