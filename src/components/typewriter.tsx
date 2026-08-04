"use client";

import { useEffect, useRef } from "react";
import { onceInView, prefersReducedMotion } from "@/lib/scroll-motion";

/** Milliseconds per character while typing. */
const TYPE_MS = 58;
/**
 * Deleting is deliberately faster than typing. Matched speeds read as a machine
 * reversing; a quicker delete reads as clearing the line to write the next one.
 */
const DELETE_MS = 26;
/** Hold on a finished phrase before deleting it. */
const HOLD_MS = 1900;
/** Beat after a phrase is cleared, before the next one starts. */
const BETWEEN_MS = 320;
/** Delay after scrolling into view, so it does not start mid-scroll. */
const START_MS = 400;

/**
 * Types through a list of phrases, deleting and retyping between them.
 *
 * ## Rendering
 *
 * The first phrase is server-rendered in full. That is what a crawler indexes,
 * what a no-JS visitor reads, and what stays on screen under reduced motion —
 * the heading is never a fragment of a word. JavaScript rewinds it and takes
 * over only once the element scrolls into view.
 *
 * Text is written straight to the DOM rather than held in state. A phrase of 24
 * characters would otherwise be 24 React renders of an element inside an <h2>,
 * repeating forever; this is the same imperative approach `counter.tsx` uses
 * and for the same reason.
 *
 * ## Accessibility
 *
 * The animated span is `aria-hidden` and a complete, static sentence sits
 * beside it in `sr-only` text. A screen reader must not be handed a string that
 * mutates every 58ms — and it is emphatically not a live region, which would
 * announce every single keystroke forever.
 */
export function Typewriter({
  phrases,
  className = "",
  /** Read out in place of the animation. Defaults to the phrase list joined. */
  screenReaderText,
}: {
  phrases: string[];
  className?: string;
  screenReaderText?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (phrases.length === 0) return;

    // Reduced motion keeps the server-rendered phrase exactly as it is.
    if (prefersReducedMotion()) return;

    let timer = 0;
    let cancelled = false;

    const at = (ms: number, fn: () => void) => {
      timer = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const write = (text: string) => {
      el.textContent = text;
    };

    const run = () => {
      let index = 0;

      const typePhrase = () => {
        const phrase = phrases[index];
        let cursor = 0;

        const typeNext = () => {
          cursor += 1;
          write(phrase.slice(0, cursor));

          if (cursor < phrase.length) {
            at(TYPE_MS, typeNext);
            return;
          }

          // Single phrase: type it once and stop rather than loop a deletion
          // of the only thing there is to say.
          if (phrases.length === 1) {
            el.removeAttribute("data-typing");
            return;
          }

          at(HOLD_MS, deletePhrase);
        };

        const deletePhrase = () => {
          if (cursor <= 0) {
            index = (index + 1) % phrases.length;
            at(BETWEEN_MS, typePhrase);
            return;
          }

          cursor -= 1;
          write(phrase.slice(0, cursor));
          at(DELETE_MS, deletePhrase);
        };

        at(TYPE_MS, typeNext);
      };

      el.setAttribute("data-typing", "");
      write("");
      at(START_MS, typePhrase);
    };

    const stop = onceInView(el, run, { threshold: 0.5, safetyMs: 3000 });

    return () => {
      cancelled = true;
      stop();
      window.clearTimeout(timer);
      el.removeAttribute("data-typing");
      // Leave the finished sentence behind, never a half-typed word.
      write(phrases[0]);
    };
  }, [phrases]);

  return (
    <>
      <span className={`typewriter ${className}`} ref={ref} aria-hidden="true">
        {phrases[0]}
      </span>
      <span className="sr-only">{screenReaderText ?? phrases.join(", ")}</span>
    </>
  );
}
