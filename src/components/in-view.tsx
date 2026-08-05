"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { onceInView } from "@/lib/scroll-motion";

/**
 * Marks its wrapper `data-armed` the first time it scrolls into view, and never
 * again. CSS does the rest.
 *
 * This exists for animations that live entirely in CSS. A CSS animation starts
 * when its element is rendered, not when it is looked at — so anything below
 * the fold has already played, and finished, by the time the visitor arrives at
 * it. They scroll down to the end state and never see the thing happen.
 *
 * Deliberately not `Reveal`. Reveal fades and lifts its own wrapper, which
 * would be a second animation competing with whatever the armed CSS is doing.
 * This component paints nothing and moves nothing; it only says "now".
 *
 * The children stay exactly what they were — pass a server component through
 * and it is still server-rendered, which is the whole reason the network map
 * can use this without shipping its 31 KB of dot markup to the client twice.
 *
 * Under reduced motion it never arms, so the CSS resting state is what shows.
 * That is the correct fallback everywhere this is used, because the rule on
 * this site is that the static state is already the complete state.
 */
export function InView({
  children,
  className = "",
  /** Fraction of the element that must be visible before it arms. */
  threshold = 0.25,
}: {
  children: ReactNode;
  className?: string;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    // `onceInView` carries the safety-net timer every observer on this site
    // has: if it somehow never fires, the animation is armed anyway rather
    // than leaving a rewound state on screen forever.
    return onceInView(el, () => el.setAttribute("data-armed", ""), {
      threshold,
    });
  }, [threshold]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
