"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
const FADE_MS = 550;

export function SplashScreen() {
  const [phase, setPhase] = useState<"idle" | "leaving" | "done">("idle");

  useEffect(() => {
    const root = document.documentElement;
    // Not a first entry: leave the markup mounted but inert. `splash.css` keeps
    // it `display:none` without the flag, so there is nothing to tear down and
    // nothing to set state about.
    if (!root.classList.contains("splash-pending")) return;

    const leave = window.setTimeout(() => setPhase("leaving"), HOLD_MS);
    const clear = window.setTimeout(() => {
      root.classList.remove("splash-pending");
      setPhase("done");
    }, HOLD_MS + FADE_MS);

    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(clear);
      root.classList.remove("splash-pending");
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div
      className="splash"
      data-leaving={phase === "leaving" ? "" : undefined}
      role="status"
      aria-label="Loading HPE Solutions"
    >
      <div className="splash__inner">
        <Image
          src="/hpe-logo.png"
          alt=""
          width={390}
          height={120}
          priority
          className="splash__logo"
        />
        <span className="splash__bar" aria-hidden="true" />
      </div>
    </div>
  );
}
