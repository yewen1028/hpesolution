"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ProgressBar } from "@/components/ui/progress-bar";

/**
 * Layout effects run after commit but before paint, which is what keeps a
 * client-side navigation from flashing the finished map. On the server there
 * is no paint to get ahead of, so `useEffect` stands in and React stays quiet.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export const MAP_INTRO_FLAG = "hpe:map-intro-seen";
export const MAP_INTRO_ROUTE = "/service-centre/map";

/**
 * Claims the one intro this session is allowed, returning whether the caller
 * won it. Shared by the boot script's logic and the client-navigation path so
 * the two can never both decide to play.
 *
 * Three ways this deliberately declines, each leaving the map visible:
 *   - the flag is already set (second visit in this session),
 *   - reduced motion is requested,
 *   - storage throws (private mode).
 */
function claimIntro() {
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return false;
    }
    if (sessionStorage.getItem(MAP_INTRO_FLAG)) return false;
    sessionStorage.setItem(MAP_INTRO_FLAG, "1");
    return true;
  } catch {
    /* Storage disabled: show the map rather than trap it behind an intro. */
    return false;
  }
}

/**
 * Runs before first paint on a full page load, so the map is already hidden
 * when the document renders and there is no flash of the finished map. Mirrors
 * `splashBootScript` in splash-screen.tsx: the script only sets a flag, and
 * CSS does the hiding.
 *
 * This must be rendered in the <head> of layout.tsx, not in the map page. A
 * <script> inside a page component is never executed on a client-side
 * navigation — React warns about exactly that — so it guards on the pathname
 * itself and `MapStage` handles the client-navigation case separately.
 */
export const mapIntroBootScript = `
try {
  if (
    location.pathname.replace(/\\/+$/, '') === ${JSON.stringify(MAP_INTRO_ROUTE)} &&
    !sessionStorage.getItem(${JSON.stringify(MAP_INTRO_FLAG)}) &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    document.documentElement.classList.add('map-intro-pending');
    sessionStorage.setItem(${JSON.stringify(MAP_INTRO_FLAG)}, '1');
  }
} catch (e) {
  /* Storage disabled: show the map rather than trap the page behind an intro. */
}
`;

/** Indeterminate phase, before the first real figure. */
const SIZING_MS = 850;
/** Gap between determinate steps. */
const STEP_MS = 150;
const STEP_SIZE = 16;
/** Beat on 100% before the map is handed over. */
const SETTLE_MS = 420;
/** Bar fade-out, kept in step with `.map-stage__intro` in globals.css. */
const FADE_MS = 420;
/**
 * Hard ceiling. However the sequence above goes, the map is on screen by now —
 * the same rule the reveal and splash safety nets follow.
 */
const SAFETY_MS = 6000;

/**
 * Wraps the coverage map so it arrives behind a progress bar on first entry.
 *
 * The map itself is passed in as `children` and is server-rendered — the
 * network map's SVG is still in the initial HTML, exactly as before. This
 * component only owns the flag and the overlay, so nothing about the map's
 * prerendering changes.
 */
export function MapStage({
  children,
  label = "Coverage map",
  pendingLabel = "Locating centres",
  completeLabel = "Map ready",
}: {
  children: ReactNode;
  label?: string;
  pendingLabel?: string;
  completeLabel?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);

  /*
   * The overlay is always in the markup and CSS decides whether it is shown —
   * the same arrangement splash-screen.tsx uses, and the reason the bar is
   * already on screen at first paint rather than waiting for hydration.
   *
   * `value` is the only React state here. Whether the intro runs at all is a
   * DOM fact set before React existed, so it is read and written as an
   * attribute; mirroring it into state would mean a synchronous setState in an
   * effect and a render pass that changes nothing React owns.
   */
  const [value, setValue] = useState<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;

    /*
     * Two ways in. On a full page load the boot script has already claimed the
     * intro and set the class before paint. On a client-side navigation no
     * script ran for this route, so the claim happens here instead — in a
     * layout effect, which still lands before the browser paints the new page.
     */
    let pending = root.classList.contains("map-intro-pending");
    if (!pending && claimIntro()) {
      root.classList.add("map-intro-pending");
      pending = true;
    }
    if (!pending) return;

    const stage = stageRef.current;
    // Keeps the overlay displayed once the html flag is dropped, so it can
    // fade out over the arriving map instead of being cut.
    stage?.setAttribute("data-intro", "playing");

    const timers: number[] = [];
    const at = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, ms));

    /** Drops the flag, which lets the map transition in. */
    const handOff = () => root.classList.remove("map-intro-pending");
    const finish = () => {
      handOff();
      stage?.removeAttribute("data-intro");
    };

    let elapsed = SIZING_MS;
    at(elapsed, () => setValue(0));

    for (let n = STEP_SIZE; n <= 100; n += STEP_SIZE) {
      elapsed += STEP_MS;
      const next = Math.min(100, n);
      at(elapsed, () => setValue(next));
    }

    // 100% → map in → bar out. The map leads by a beat so the two movements
    // read as a handover rather than a swap.
    elapsed += SETTLE_MS;
    at(elapsed, () => {
      handOff();
      stage?.setAttribute("data-intro", "leaving");
    });
    at(elapsed + FADE_MS, finish);

    // Safety net.
    at(SAFETY_MS, finish);

    return () => {
      for (const t of timers) window.clearTimeout(t);
      // Navigating away mid-intro must never leave the map hidden.
      finish();
    };
  }, []);

  return (
    <div className="map-stage" ref={stageRef}>
      <div className="map-stage__map">{children}</div>

      <div
        className="map-stage__intro"
        // The bar carries its own live region; this only positions it.
        role="status"
      >
        <div className="map-intro-progress w-full max-w-[360px]">
          <ProgressBar
            value={value}
            label={label}
            pendingLabel={pendingLabel}
            completeLabel={completeLabel}
          />
        </div>
      </div>
    </div>
  );
}
