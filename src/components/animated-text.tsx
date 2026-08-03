"use client";

import { Fragment, useEffect, useRef, type CSSProperties, type ElementType } from "react";
import { onceInView } from "@/lib/scroll-motion";

/**
 * Scroll-triggered text reveal, split by word or by character.
 *
 * The split happens during render, not at runtime, so the markup is in the
 * server HTML — no flash of unsplit text and no layout shift when script
 * arrives. Each part carries an `--i` index and CSS turns that into a
 * staggered transition delay; the component only flips one attribute.
 *
 * Motion lives entirely in `[data-split]` in globals.css, which is also where
 * the reduced-motion and no-JS overrides sit. Anything that hides text needs
 * that safety net — see the `<noscript>` block in layout.tsx.
 *
 * Accessibility: character splitting makes screen readers spell words out, so
 * in `char` mode the parts are hidden and the whole string is exposed once via
 * `aria-label`. Word mode keeps real spaces between spans and needs no help.
 */
export function AnimatedText({
  text,
  as: Tag = "span",
  mode = "word",
  stagger = mode === "char" ? 22 : 55,
  delay = 0,
  duration = 750,
  className = "",
  underline = false,
}: {
  text: string;
  as?: ElementType;
  /** `word` for headings and ledes; `char` only for short display lines. */
  mode?: "word" | "char";
  /** Per-part delay in ms. */
  stagger?: number;
  /** Delay before the first part, in ms. */
  delay?: number;
  duration?: number;
  className?: string;
  /** Draws the brand rule under the text, wiped in after the last part. */
  underline?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // No reduced-motion check here: the CSS override handles it, and it also
    // covers the no-JS case. Flipping the attribute is harmless either way.
    return onceInView(el, () => el.setAttribute("data-split", "shown"), {
      threshold: 0.15,
      safetyMs: 2500,
    });
  }, []);

  // Blank lines are meaningful: "\n" becomes a hard break in the heading.
  const lines = text.split("\n");
  let index = 0;

  return (
    <Tag
      ref={ref}
      data-split=""
      data-underline={underline ? "" : undefined}
      className={className}
      aria-label={mode === "char" ? text : undefined}
      style={
        {
          "--split-stagger": `${stagger}ms`,
          "--split-delay": `${delay}ms`,
          "--split-duration": `${duration}ms`,
        } as CSSProperties
      }
    >
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(" ").map((word, wi, words) => (
            <Fragment key={wi}>
              <span className="split-word">
                {mode === "char"
                  ? Array.from(word).map((char, ci) => (
                      <span
                        key={ci}
                        className="split-part"
                        aria-hidden="true"
                        style={{ "--i": index++ } as CSSProperties}
                      >
                        {char}
                      </span>
                    ))
                  : (
                      <span
                        className="split-part"
                        style={{ "--i": index++ } as CSSProperties}
                      >
                        {word}
                      </span>
                    )}
              </span>
              {/* A real space, so the line still wraps normally. */}
              {wi < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </Fragment>
      ))}
      {underline && <span className="split-rule" aria-hidden="true" />}
    </Tag>
  );
}
