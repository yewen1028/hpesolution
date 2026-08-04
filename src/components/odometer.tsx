"use client";

import { type CSSProperties } from "react";

const format = new Intl.NumberFormat("en-MY");

/** Per-digit roll time. */
const DURATION_MS = 700;
/**
 * Delay between adjacent digits, applied right to left, so the units column
 * leads and the thousands column settles last. A real odometer's right-hand
 * wheel drives the ones to its left, and reversing this reads backwards.
 */
const STAGGER_MS = 55;

type Cell =
  | { kind: "digit"; value: number; place: number }
  | { kind: "static"; char: string; place: number };

/**
 * Splits a formatted number into cells, tagging each with its distance from the
 * right-hand end. `place` is what drives both the stagger and the React key: a
 * value going 999 → 1000 gains a column on the left, and keying by position
 * from the right keeps the existing wheels' identity so they animate instead of
 * remounting.
 */
function toCells(text: string): Cell[] {
  const chars = Array.from(text);
  return chars.map((char, i) => {
    const place = chars.length - 1 - i;
    return /\d/.test(char)
      ? { kind: "digit" as const, value: Number(char), place }
      : { kind: "static" as const, char, place };
  });
}

/**
 * Odometer readout: each digit is a vertical strip of 0–9 that translates to
 * bring the right numeral into a one-digit window. Changing `value` re-renders
 * with new offsets and CSS rolls each wheel to its new position.
 *
 * ## Why this is not `counter.tsx`
 *
 * `Counter` animates once, from zero, when a figure scrolls into view — right
 * for a fixed statistic. This animates *between* two values however often they
 * change, which is only worth its cost for a number that actually updates.
 *
 * ## Rendering
 *
 * The offsets are inline custom properties, so the correct number is in the
 * server HTML and shows without JavaScript — the roll is the enhancement, the
 * value is not. The wheels are `aria-hidden` and the formatted number sits
 * beside them in `sr-only` text, because a strip reading "0123456789" ten times
 * over is not a number to a screen reader.
 *
 * `live` opts into announcing changes. It is off by default: a value that
 * updates every few hundred milliseconds inside a live region produces a
 * continuous stream of speech.
 */
export function Odometer({
  value,
  prefix = "",
  suffix = "",
  duration = DURATION_MS,
  stagger = STAGGER_MS,
  grouped = true,
  live = false,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  stagger?: number;
  /** Thousands separators. Static cells, so they never roll. */
  grouped?: boolean;
  /** Announce changes politely. Only for values that update slowly. */
  live?: boolean;
  className?: string;
}) {
  const rounded = Math.round(value);
  const text = grouped ? format.format(rounded) : String(rounded);
  const cells = toCells(text);
  const readout = `${prefix}${text}${suffix}`;

  return (
    <span
      className={`odometer ${className}`}
      style={
        {
          "--odo-duration": `${duration}ms`,
          "--odo-stagger": `${stagger}ms`,
        } as CSSProperties
      }
    >
      <span className="odometer__visual" aria-hidden="true">
        {prefix && <span className="odometer__fixed">{prefix}</span>}

        {cells.map((cell) =>
          cell.kind === "static" ? (
            <span key={`s${cell.place}`} className="odometer__fixed">
              {cell.char}
            </span>
          ) : (
            <span key={`d${cell.place}`} className="odometer__wheel">
              <span
                className="odometer__strip"
                style={
                  {
                    "--d": cell.value,
                    "--place": cell.place,
                  } as CSSProperties
                }
              >
                {/*
                  Ten cells, one per numeral. The strip is exactly ten digits
                  tall, so translating by -10% per unit lands digit `d` in the
                  window with no measurement.
                */}
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <span key={n} className="odometer__num">
                    {n}
                  </span>
                ))}
              </span>
            </span>
          ),
        )}

        {suffix && <span className="odometer__fixed">{suffix}</span>}
      </span>

      <span className="sr-only" aria-live={live ? "polite" : "off"}>
        {readout}
      </span>
    </span>
  );
}
