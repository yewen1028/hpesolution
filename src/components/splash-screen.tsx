"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export const SPLASH_FLAG = "hpe:splash-seen";

/**
 * Runs before first paint, so a returning visitor never sees the overlay flash.
 * Marks the document as splash-pending; CSS in `splash.css` does the hiding,
 * and the component below clears the flag once the intro has played.
 */
export const splashBootScript = `
try {
  if (!sessionStorage.getItem(${JSON.stringify(SPLASH_FLAG)})) {
    document.documentElement.classList.add('splash-pending');
    sessionStorage.setItem(${JSON.stringify(SPLASH_FLAG)}, '1');
  }
} catch (e) {
  /* Private mode or storage disabled: skip the splash rather than trap the page. */
}
`;

const HOLD_MS = 1250;

/**
 * The exit, and it is a **reveal rather than a fade**: the rule that has just
 * finished filling runs out to both edges of the window, and the overlay parts
 * along it to show the page underneath. The site is drawn with hairlines, so
 * the intro ends by handing the page one.
 *
 * Long enough to be read as a movement — the whole figure is 980ms against the
 * old 550ms of opacity — and the wait before it is unchanged, so nobody is kept
 * on the overlay any longer than they were. The timings themselves live in
 * `splash.css`; this constant only has to outlast them, because it is when the
 * overlay is unmounted and the page gets its scrolling back.
 */
const EXIT_MS = 980;

export function SplashScreen() {
  const [phase, setPhase] = useState<"idle" | "leaving" | "done">("idle");
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    // Not a first entry: leave the markup mounted but inert. `splash.css` keeps
    // it `display:none` without the flag, so there is nothing to tear down and
    // nothing to set state about.
    if (!root.classList.contains("splash-pending")) return;

    const leave = window.setTimeout(() => {
      /*
       * Where the overlay splits. The seam has to land on the loading rule
       * exactly or the figure falls apart — an orange line appearing a few
       * pixels off the bar reads as a second, unrelated element — and the bar
       * sits below the optical centre, under the logo, so 50% is the wrong
       * answer. One measurement, taken once, before anything has moved.
       */
      const bar = barRef.current;
      const el = rootRef.current;
      if (bar && el) {
        const rect = bar.getBoundingClientRect();
        el.style.setProperty(
          "--splash-seam",
          `${Math.round(rect.top + rect.height / 2)}px`,
        );
      }
      setPhase("leaving");
    }, HOLD_MS);

    const clear = window.setTimeout(() => {
      root.classList.remove("splash-pending");
      setPhase("done");
    }, HOLD_MS + EXIT_MS);

    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(clear);
      root.classList.remove("splash-pending");
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      ref={rootRef}
      className="splash"
      data-leaving={phase === "leaving" ? "" : undefined}
      role="status"
      aria-label="Loading HPE Solutions"
    >
      {/*
       * The overlay's own paint, split in two. It is on these rather than on
       * `.splash` because the two halves have to travel independently — with
       * the background on the container there is nothing to part.
       */}
      <span className="splash__panel splash__panel--top" aria-hidden="true" />
      <span className="splash__panel splash__panel--bottom" aria-hidden="true" />

      {/*
       * The seam. A separate element from `.splash__bar` on purpose: the bar
       * leaves with the logo, and this is what stays to be the line the page
       * opens along. Positioned from the measurement above, so the two are the
       * same line as far as anyone watching is concerned.
       */}
      <span className="splash__seam" aria-hidden="true" />

      <div className="splash__inner">
        <Image
          src="/hpe-logo.png"
          alt=""
          width={390}
          height={120}
          priority
          className="splash__logo"
        />
        <span ref={barRef} className="splash__bar" aria-hidden="true" />
      </div>
    </div>
  );
}
