"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

/**
 * Reveals its children once they enter the viewport.
 *
 * Content starts hidden via CSS, so a safety net matters: if the observer
 * never fires (odd viewport, restored scroll position, bfcache), a timer
 * force-reveals after 2.5s. Nothing on this site may stay invisible.
 */
export function Reveal({
  as: Tag = "div",
  delay = 0,
  /**
   * Which edge the content arrives from. `up` is the default and is what the
   * whole site uses; `left` and `right` exist for content laid out in two
   * columns, where having each half arrive from its own outside edge says the
   * row is being assembled rather than simply appearing.
   *
   * Use it in pairs and only where the columns are genuinely side by side. A
   * single element sliding in from an edge for no reason is the kind of motion
   * that reads as decoration.
   */
  from = "up",
  className = "",
  style,
  children,
}: {
  as?: ElementType;
  delay?: number;
  from?: "up" | "left" | "right";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => el.setAttribute("data-reveal", "shown");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(el);
    const safetyNet = window.setTimeout(show, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(safetyNet);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      // Omitted entirely for the default, so the plain `[data-reveal]` rule
      // stays the one that matches on almost every element on the site.
      data-from={from === "up" ? undefined : from}
      className={className}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
