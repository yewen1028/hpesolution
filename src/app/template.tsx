"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Page transition.
 *
 * `template.tsx` re-mounts on every navigation (unlike `layout.tsx`, which
 * persists), so it gives a reliable enter animation without AnimatePresence
 * having to hold a tree the App Router has already discarded.
 *
 * The animation is applied in an effect and never during render. That is not a
 * style preference — this module's scope is shared across page renders on the
 * server, so a render that reads it bakes one page's answer into every other
 * page's HTML and hydration fails. Render stays deterministic; the attribute is
 * a client-only decision.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Client-only. Resets on a full page load, which is exactly the distinction
 * needed: the first mount after a hard load is the initial paint — the splash
 * screen owns that moment — and every mount after it is a navigation.
 */
let clientMountedOnce = false;

export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!clientMountedOnce) {
      clientMountedOnce = true;
      return;
    }

    // Layout effect, so this lands before the browser paints the new page and
    // the animation starts from its `from` keyframe rather than mid-flight.
    ref.current?.setAttribute("data-page-enter", "");

    /*
     * Land the new page at the top, instantly.
     *
     * `html { scroll-behavior: smooth }` is set for the in-page section
     * anchors, but the App Router's scroll reset obeys it as well. Navigating
     * from deep inside a long page therefore swapped the content immediately
     * and then *animated* the viewport back up over thousands of pixels, which
     * reads as the link having done nothing at all — the header is fixed, so
     * for most of that scroll the screen looks unchanged.
     *
     * Smooth is suppressed for this one frame only, so anchor links keep it.
     */
    if (window.location.hash) return; // A hash target owns the scroll instead.

    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);

    // Restored after the frame in which the router does its own scrolling, so
    // that call is instant too rather than re-animating what we just undid.
    const frame = requestAnimationFrame(() => {
      root.style.scrollBehavior = previous;
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return <div ref={ref}>{children}</div>;
}
