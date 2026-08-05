/**
 * Motion preference — the single source of truth for whether this site animates.
 *
 * Every bail-out on the site used to ask the browser directly, through
 * `@media (prefers-reduced-motion: reduce)` in CSS and `matchMedia` in script.
 * That question has a bad answer on Windows: `SPI_GETCLIENTAREAANIMATION` is
 * what browsers map the media query to, and it is cleared by
 * **Settings → Accessibility → Visual effects → Animation effects**, by the
 * "Adjust for best performance" preset in System Properties, and by battery
 * saver on some OEM builds. Low-end laptops ship with it off or get it turned
 * off by a technician chasing performance, and their owner has never expressed
 * any preference about motion at all. The site then renders completely static
 * — no reveals, no parallax, no transitions — and reads as broken rather than
 * considerate.
 *
 * So the browser's answer becomes a *default*, not a verdict:
 *
 *   - `motionBootScript` resolves the preference before first paint and writes
 *     `data-motion="full" | "reduced"` on <html>.
 *   - CSS keys every bail-out off `html[data-motion="reduced"]` instead of the
 *     media query, and script reads the same attribute.
 *   - `MotionToggle` lets a visitor override the OS in either direction, and
 *     the choice persists in localStorage.
 *
 * The OS default is still honoured for anyone who has not chosen: someone with
 * a vestibular disorder who set the system preference deliberately gets the
 * still site on first load, exactly as before. This only makes the setting
 * recoverable from inside the page.
 */

export const MOTION_KEY = "hpe:motion";

/** Fired by `applyMotion` so subscribers re-read after a switch. */
export const MOTION_EVENT = "hpe:motionchange";

/** "system" follows the OS; the other two override it. */
export type MotionChoice = "system" | "full" | "reduced";

export type MotionState = "full" | "reduced";

/**
 * Runs before first paint, alongside `themeBootScript`. It has to be this
 * early: the attribute gates the reveal and splash CSS, so a value arriving at
 * hydration would flash the wrong state.
 *
 * Storage blocked (private mode, locked-down browser) falls through to the OS
 * reading, which is the same behaviour the site had before the toggle existed.
 */
export const motionBootScript = `
(function () {
  var root = document.documentElement;
  var choice = 'system';
  try {
    var stored = localStorage.getItem(${JSON.stringify(MOTION_KEY)});
    if (stored === 'full' || stored === 'reduced') choice = stored;
  } catch (e) {
    /* Storage blocked: follow the OS. */
  }
  var reduced = choice === 'reduced' ||
    (choice === 'system' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  root.dataset.motion = reduced ? 'reduced' : 'full';
  root.dataset.motionChoice = choice;
})();
`;

/**
 * The one question every animation on this site asks.
 *
 * Reads the resolved attribute rather than the media query, so a visitor's
 * override reaches script as well as CSS. Before the boot script has run — and
 * on the server — this reports false, which matches the server-rendered
 * finished state that every animated component starts from.
 */
export function prefersReducedMotion() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.dataset.motion === "reduced"
  );
}

/** The stored choice, for the toggle's own state. */
export function motionChoice(): MotionChoice {
  const value =
    typeof document === "undefined"
      ? undefined
      : document.documentElement.dataset.motionChoice;
  return value === "full" || value === "reduced" ? value : "system";
}

/** Applies a choice to the document and remembers it. Mirrors `applyTheme`. */
export function applyMotion(choice: MotionChoice) {
  const root = document.documentElement;
  const reduced =
    choice === "reduced" ||
    (choice === "system" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  root.dataset.motion = reduced ? "reduced" : "full";
  root.dataset.motionChoice = choice;

  try {
    if (choice === "system") localStorage.removeItem(MOTION_KEY);
    else localStorage.setItem(MOTION_KEY, choice);
  } catch {
    /* Private mode: the choice holds for this page only. */
  }

  window.dispatchEvent(new Event(MOTION_EVENT));
}

/**
 * Subscribe to the resolved state. The OS query is included so a visitor on
 * "system" keeps tracking it mid-session.
 */
export function subscribeMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onMedia = () => {
    if (motionChoice() === "system") applyMotion("system");
    onChange();
  };
  media.addEventListener("change", onMedia);
  window.addEventListener(MOTION_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onMedia);
    window.removeEventListener(MOTION_EVENT, onChange);
  };
}
