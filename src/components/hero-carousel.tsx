"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Media } from "@/components/media";
import { registerScrollLayer } from "@/components/parallax";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion";
import type { HeroSlide } from "@/lib/site";

/* ---------------------------------------------------------------------------
   The home hero's background: `heroSlides` played one at a time behind the
   masthead tint.

   Three things advance it, and they are three rather than one because they
   answer three different visitors:

     · time    — someone reading the hero and not scrolling
     · scroll  — someone moving down through it
     · reload  — someone arriving at the site again

   Every clip is muted, looping and `playsInline`, which is what a browser
   requires before it will autoplay anything at all. Autoplay can still be
   refused — iOS Low Power Mode refuses all of it — so `poster` is load-bearing
   here rather than a placeholder: it is the frame that stands in when the clip
   does not arrive, and the frame shown outright when motion is off.
--------------------------------------------------------------------------- */

/**
 * How long a clip holds before the timer advances it.
 *
 * Long, deliberately. This is a background behind a headline someone is
 * reading, and a change arriving while their eye is still on the second line
 * reads as a fault in the page rather than as a change of picture.
 */
const HOLD_MS = 10_000;

/**
 * Scrolling advances the carousel once per this much of the viewport.
 *
 * Distance travelled, not position within the hero: position would tie the
 * number of changes to how tall the hero happens to be at a given breakpoint,
 * and on a phone it is several times the window. At 0.6 the picture changes
 * about twice on the way down to the stat strip — often enough to be legible
 * as a response to scrolling, rare enough not to read as flicker.
 */
const SCROLL_STEP = 0.6;

/**
 * The cross-fade. Long enough to read as a dissolve between two photographs
 * rather than a cut, short enough that the two are never both legible — a hero
 * that is visibly two pictures at once is a mess to put white type on.
 */
const FADE_MS = 1400;

/* --- Where a page view starts -------------------------------------------- */

/*
 * The rotation carries across page views inside one browsing session, so a
 * reload opens on the next clip instead of replaying the first. `sessionStorage`
 * and not `localStorage`, matching the splash screen: this is a property of a
 * visit, not a preference worth keeping for months. A new session starts at the
 * top of the list, which keeps the first frame anyone ever sees deterministic.
 *
 * Read once and cached, because `useSyncExternalStore` calls `getSnapshot` on
 * every render and a value that changed underneath it would spin. The write
 * that moves the session on is a mount effect below, not part of the read.
 */
const SESSION_KEY = "hpe:hero-slide";
let sessionStart: number | null = null;

function readSessionStart() {
  if (sessionStart === null) {
    let value = 0;
    try {
      const stored = Number(sessionStorage.getItem(SESSION_KEY));
      if (Number.isInteger(stored) && stored > 0) value = stored;
    } catch {
      /* Private mode, or storage disabled. Every visit starts at the first. */
    }
    sessionStart = value;
  }
  return sessionStart;
}

/** No external source to watch: the starting slide is fixed for this page view. */
const noSubscribe = () => () => {};

/** The server has no session and no motion state; both resolve after hydration. */
const serverZero = () => 0;
const serverFalse = () => false;

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const count = slides.length;

  /*
   * Both of these are external state read through `useSyncExternalStore` rather
   * than copied into `useState` inside a mount effect. That is what keeps the
   * server render and the first client render agreeing — the server has
   * neither a session nor a resolved motion preference, so both start at their
   * server value and settle on hydration.
   */
  const start = useSyncExternalStore(noSubscribe, readSessionStart, serverZero);
  const motion = useSyncExternalStore(
    subscribeMotion,
    () => !prefersReducedMotion(),
    serverFalse,
  );

  /*
   * The only state here is how many times the carousel has advanced. The slide
   * on screen is derived from it, and so is the set of slides that have ever
   * been on screen — which means neither can drift out of step with the other,
   * and there is no second setState to keep in order.
   */
  const [steps, setSteps] = useState(0);

  const index = motion ? (start + steps) % count : 0;

  /*
   * Only slides that have been shown get a poster in the DOM and a `src` on
   * their video, so the hero costs one image and one clip on arrival rather
   * than four of each. Derived, not tracked: slide i has been shown if some
   * step so far landed on it.
   */
  const shown = new Set<number>();
  if (motion) {
    for (let s = 0; s <= Math.min(steps, count - 1); s++) {
      shown.add((start + s) % count);
    }
  } else {
    shown.add(0);
  }

  const rootRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<(HTMLVideoElement | null)[]>([]);

  // Stable for the life of the component, so the effects below register their
  // timer and their scroll layer once rather than on every advance.
  const advance = useCallback(() => setSteps((s) => s + 1), []);

  /* --- Reload ----------------------------------------------------------- */

  /*
   * Hand the next page view in this session the next clip. Written once, on
   * mount, rather than on each advance: the read above is cached for the life
   * of the page, so a later write would have no reader, and one reload should
   * move the hero on by one picture regardless of how long it was left open.
   */
  useEffect(() => {
    if (!motion) return;
    try {
      sessionStorage.setItem(SESSION_KEY, String((start + 1) % count));
    } catch {
      /* Nothing to carry across. The carousel still rotates on this page. */
    }
  }, [motion, start, count]);

  /* --- Time ------------------------------------------------------------- */

  /*
   * The timer runs only while the hero is on screen and the tab is in front of
   * someone. A carousel cutting away in a background tab spends bandwidth on
   * clips nobody sees, and hands the visitor back a hero several slides from
   * where they left it.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !motion || count < 2) return;

    let timer = 0;
    let onScreen = false;

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = 0;
    };

    const sync = () => {
      const shouldRun = onScreen && document.visibilityState === "visible";
      if (shouldRun === Boolean(timer)) return;
      if (shouldRun) timer = window.setInterval(advance, HOLD_MS);
      else stop();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0.15 },
    );

    observer.observe(root);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      stop();
    };
  }, [motion, count, advance]);

  /* --- Scroll ----------------------------------------------------------- */

  /*
   * Registered on the shared rAF loop in `parallax.tsx` rather than as its own
   * scroll listener — that loop already measures this element's rect for the
   * drift, and a second listener here is exactly what its comment forbids.
   * `read` measures and accumulates; the advance goes in `write`, because
   * nothing in the read pass may touch anything that could invalidate layout
   * for the layers measured after it.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !motion || count < 2) return;

    let last = window.scrollY;
    let travelled = 0;
    let due = false;

    return registerScrollLayer({
      el: root,
      read(rect, viewportH) {
        const y = window.scrollY;
        const delta = Math.abs(y - last);
        last = y;

        // Count only scrolling that happens while the hero is on screen, and
        // ignore jumps — a hash link or a restored scroll position would
        // otherwise bank a whole step of distance in a single frame.
        if (rect.bottom <= 0 || rect.top >= viewportH || delta > viewportH) {
          return;
        }

        travelled += delta;
        if (travelled >= viewportH * SCROLL_STEP) {
          travelled = 0;
          due = true;
        }
      },
      write() {
        if (!due) return;
        due = false;
        advance();
      },
    });
  }, [motion, count, advance]);

  /* --- Playback --------------------------------------------------------- */

  /*
   * One clip plays at a time. The others are paused rather than unmounted, so
   * the fade has something to fade, and rewound, so a slide that comes back
   * around opens on its first frame instead of resuming mid-shot.
   */
  useEffect(() => {
    if (!motion) return;

    for (const [i, video] of videosRef.current.entries()) {
      if (!video) continue;

      if (i === index) {
        void video.play().catch(() => {
          /* Autoplay refused — the poster is already underneath. */
        });
      } else if (!video.paused) {
        video.pause();
        video.currentTime = 0;
      }
    }
  }, [index, motion]);

  return (
    <div ref={rootRef} className="absolute inset-0" aria-hidden="true">
      {slides.map((slide, i) => {
        const active = i === index;
        // A slide that has never been shown renders as an empty layer: no
        // image request, no clip, nothing to decode.
        const ready = shown.has(i);

        return (
          <div
            key={slide.video}
            className="absolute inset-0 transition-opacity ease-out"
            style={{
              opacity: active ? 1 : 0,
              transitionDuration: motion ? `${FADE_MS}ms` : "0ms",
            }}
          >
            {ready ? (
              <Media
                src={slide.poster}
                alt=""
                fill
                // Only the first slide can be the LCP candidate; the rest
                // arrive under a fade that is already covering for them.
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            ) : null}

            {motion && ready ? (
              <video
                ref={(el) => {
                  videosRef.current[i] = el;
                }}
                src={slide.video}
                poster={slide.poster}
                muted
                loop
                playsInline
                preload={active ? "auto" : "none"}
                tabIndex={-1}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
