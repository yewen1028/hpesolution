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
  }, []);

  return <div ref={ref}>{children}</div>;
}
