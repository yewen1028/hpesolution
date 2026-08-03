/**
 * Shared primitives for scroll-triggered motion.
 *
 * Every animated component on this site follows the same contract, so the
 * trigger, the easing and the bail-outs live here rather than being copied:
 *
 *   1. The server renders the *finished* state. JavaScript rewinds it and
 *      replays the arrival. Nothing depends on script to become readable.
 *   2. `prefers-reduced-motion: reduce` returns before the rewind, so the
 *      finished state simply stays on screen.
 *   3. Every observer carries a safety-net timer. If it never fires — odd
 *      viewport, restored scroll position, bfcache — the finished state is
 *      forced. Nothing on this site may stay mid-animation.
 */

/** Quick off the line, settles exactly on the target. Figures and fills. */
export const easeOutExpo = (t: number) =>
  t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

/** Matches `--ease-out-quint` in globals.css. Type and transforms. */
export const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * A real pointer that can hover — the check every hover effect needs.
 *
 * Deliberately not a touch-capability test: laptops with touchscreens report
 * touch support and still want the effect, while phones report neither hover
 * nor a fine pointer. This asks the question that actually matters.
 */
export function canHover() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

/* --- Shared scroll driver -------------------------------------------------
 * One scroll listener and one rAF for every scroll-linked component, the same
 * arrangement parallax.tsx uses for its layers. Subscribers run inside a single
 * frame, so a page with a pinned section and parallax bands still costs one
 * pass rather than one per component.
 */

const scrollSubscribers = new Set<() => void>();
let scrollFrame = 0;
let scrollListening = false;

function runScrollSubscribers() {
  scrollFrame = 0;
  for (const fn of scrollSubscribers) fn();
}

function scheduleScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(runScrollSubscribers);
}

/**
 * Calls `fn` on scroll and resize, rAF-batched. Returns a cleanup function.
 * `fn` should read layout once and write once — it shares a frame with every
 * other subscriber.
 */
export function onScrollFrame(fn: () => void) {
  scrollSubscribers.add(fn);

  if (!scrollListening) {
    scrollListening = true;
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll, { passive: true });
  }

  scheduleScroll();

  return () => {
    scrollSubscribers.delete(fn);
    if (scrollSubscribers.size === 0) {
      scrollListening = false;
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      scrollFrame = 0;
    }
  };
}

/**
 * Runs `run` the first time `el` scrolls into view, then stops watching.
 * Returns a cleanup function. `run` is called at most once.
 */
export function onceInView(
  el: Element,
  run: () => void,
  { threshold = 0.4, safetyMs = 4000 }: { threshold?: number; safetyMs?: number } = {},
) {
  let done = false;

  const fire = () => {
    if (done) return;
    done = true;
    observer.disconnect();
    window.clearTimeout(net);
    run();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) fire();
    },
    { threshold },
  );

  observer.observe(el);

  // Safety net: never leave the rewound state on screen.
  const net = window.setTimeout(fire, safetyMs);

  return () => {
    done = true;
    observer.disconnect();
    window.clearTimeout(net);
  };
}

/**
 * Drives `onFrame` from 0 to 1 over `duration` ms through `easing`.
 * Returns a cancel function. Always lands exactly on 1.
 */
export function tween({
  duration,
  easing = easeOutExpo,
  onFrame,
}: {
  duration: number;
  easing?: (t: number) => number;
  onFrame: (progress: number) => void;
}) {
  let frame = 0;
  const startedAt = performance.now();

  const step = (now: number) => {
    const t = Math.min((now - startedAt) / duration, 1);
    onFrame(easing(t));
    if (t < 1) frame = requestAnimationFrame(step);
  };

  frame = requestAnimationFrame(step);

  return () => cancelAnimationFrame(frame);
}
