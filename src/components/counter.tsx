"use client";

import { useEffect, useRef } from "react";

const format = new Intl.NumberFormat("en-MY");

/**
 * Counts up to `value` the first time it scrolls into view.
 *
 * The figure is written straight to the DOM rather than held in state: the
 * server renders the final number (so it is in the HTML for crawlers and for
 * scripting-off visitors), and the animation mutates the text node in place.
 * There is no re-render, so React never fights the imperative writes.
 */
export function Counter({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const write = (n: number) => {
      el.textContent = `${prefix}${format.format(n)}${suffix}`;
    };

    // Rewind now so the final figure is not visible before the count runs.
    write(0);

    let frame = 0;

    const run = () => {
      const startedAt = performance.now();
      const duration = 1400;

      const step = (now: number) => {
        const t = Math.min((now - startedAt) / duration, 1);
        // easeOutExpo: quick off the line, settles exactly on the figure.
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        write(Math.round(value * eased));
        if (t < 1) frame = requestAnimationFrame(step);
      };

      frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(el);

    // Safety net: never leave a zero on screen if the observer never fires.
    const net = window.setTimeout(() => {
      observer.disconnect();
      write(value);
    }, 4000);

    return () => {
      observer.disconnect();
      window.clearTimeout(net);
      cancelAnimationFrame(frame);
    };
  }, [value, prefix, suffix]);

  return (
    <span ref={ref} className="tabular">
      {prefix}
      {format.format(value)}
      {suffix}
    </span>
  );
}
