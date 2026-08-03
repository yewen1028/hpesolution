"use client";

import { useEffect, useRef } from "react";
import { onceInView, prefersReducedMotion, tween } from "@/lib/scroll-motion";

const format = new Intl.NumberFormat("en-MY");

const DURATION = 1400;

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
  duration = DURATION,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const write = (n: number) => {
      el.textContent = `${prefix}${format.format(n)}${suffix}`;
    };

    // Rewind now so the final figure is not visible before the count runs.
    write(0);

    let cancel = () => {};

    const stop = onceInView(el, () => {
      cancel = tween({
        duration,
        onFrame: (p) => write(Math.round(value * p)),
      });
    });

    return () => {
      stop();
      cancel();
      write(value);
    };
  }, [value, prefix, suffix, duration]);

  return (
    <span ref={ref} className="tabular">
      {prefix}
      {format.format(value)}
      {suffix}
    </span>
  );
}

/* --- Mixed-format figures ------------------------------------------------ */

type Token =
  | { kind: "lit"; text: string }
  | { kind: "num"; value: number; decimals: number; grouped: boolean };

const NUMBER_RUN = /\d[\d,]*(?:\.\d+)?/g;

/**
 * Splits "24×7×4h" into [24, "×", 7, "×", 4, "h"], and "25,000+" into
 * [25000, "+"] while remembering that it was written with grouping.
 */
function parse(text: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;

  for (const match of text.matchAll(NUMBER_RUN)) {
    const raw = match[0];
    const at = match.index;

    if (at > cursor) tokens.push({ kind: "lit", text: text.slice(cursor, at) });

    const dot = raw.indexOf(".");
    tokens.push({
      kind: "num",
      value: Number(raw.replace(/,/g, "")),
      decimals: dot === -1 ? 0 : raw.length - dot - 1,
      grouped: raw.includes(","),
    });

    cursor = at + raw.length;
  }

  if (cursor < text.length) tokens.push({ kind: "lit", text: text.slice(cursor) });

  return tokens;
}

function render(tokens: Token[], progress: number) {
  let out = "";

  for (const token of tokens) {
    if (token.kind === "lit") {
      out += token.text;
      continue;
    }

    const n = token.value * progress;

    if (token.decimals > 0) {
      out += n.toFixed(token.decimals);
    } else if (token.grouped) {
      out += format.format(Math.round(n));
    } else {
      out += String(Math.round(n));
    }
  }

  return out;
}

/**
 * Counts up every numeric run inside a free-text figure, so the site's mixed
 * metrics animate the same way the plain ones do: "8×5×2h", "25,000+",
 * "6 months". All runs share one eased progress, so they land together rather
 * than racing each other.
 *
 * Strings with no digits in them — "Nationwide", "Broadcast" — render as
 * plain text and never mount an observer.
 */
export function CounterText({
  children,
  duration = DURATION,
  className = "",
}: {
  children: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const tokens = parse(children);
    if (!tokens.some((t) => t.kind === "num")) return;

    const write = (p: number) => {
      el.textContent = render(tokens, p);
    };

    write(0);

    let cancel = () => {};

    const stop = onceInView(el, () => {
      cancel = tween({ duration, onFrame: write });
    });

    return () => {
      stop();
      cancel();
      el.textContent = children;
    };
  }, [children, duration]);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}
