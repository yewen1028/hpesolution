"use client";

import { useEffect, useRef } from "react";
import { onceInView, prefersReducedMotion, tween } from "@/lib/scroll-motion";

const DURATION = 1400;

/**
 * A hairline share bar: `value` of `total`, drawn as a scaled fill.
 *
 * Follows the network map's rule — the static state is the complete state.
 * The server renders the bar already filled; script rewinds it to zero and
 * replays the arrival, and reduced motion simply leaves it drawn.
 *
 * `scaleX` rather than `width` so the whole animation stays on the compositor.
 */
export function MeterBar({
  value,
  total,
  label,
  duration = DURATION,
  className = "",
  tone = "dark",
}: {
  value: number;
  total: number;
  label: string;
  duration?: number;
  className?: string;
  tone?: "dark" | "light";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const fill = total > 0 ? Math.min(Math.max(value / total, 0), 1) : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const write = (p: number) => {
      el.style.setProperty("--meter-fill", String(fill * p));
    };

    write(0);

    let cancel = () => {};

    const stop = onceInView(el, () => {
      cancel = tween({ duration, onFrame: write });
    });

    return () => {
      stop();
      cancel();
      write(1);
    };
  }, [fill, duration]);

  return (
    <div
      ref={ref}
      className={`meter ${tone === "light" ? "meter--light" : ""} ${className}`}
      style={{ "--meter-fill": fill } as React.CSSProperties}
      role="img"
      aria-label={label}
    >
      <span className="meter__fill" />
    </div>
  );
}

/**
 * The same figure as a ring, for places that need a badge rather than a rule.
 * Geometry is plain SVG; only `stroke-dashoffset` is touched at runtime.
 */
export function MeterRing({
  value,
  total,
  label,
  size = 64,
  stroke = 4,
  duration = DURATION,
  children,
}: {
  value: number;
  total: number;
  label: string;
  size?: number;
  stroke?: number;
  duration?: number;
  children?: React.ReactNode;
}) {
  const ref = useRef<SVGCircleElement>(null);
  const fill = total > 0 ? Math.min(Math.max(value / total, 0), 1) : 0;

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const write = (p: number) => {
      el.style.strokeDashoffset = String(circumference * (1 - fill * p));
    };

    write(0);

    let cancel = () => {};

    const stop = onceInView(el, () => {
      cancel = tween({ duration, onFrame: write });
    });

    return () => {
      stop();
      cancel();
      write(1);
    };
  }, [fill, circumference, duration]);

  return (
    <span className="meter-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={label}>
        <circle
          className="meter-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          ref={ref}
          className="meter-ring__fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fill)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {children && <span className="meter-ring__label">{children}</span>}
    </span>
  );
}
