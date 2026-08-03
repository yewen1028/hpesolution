"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

/** Fired by `applyTheme` so the store re-reads after a switch. */
const THEME_EVENT = "hpe:themechange";

export const THEME_KEY = "hpe:theme";

export type ThemeChoice = "system" | "light" | "dark";

const CHOICES: { value: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
];

/**
 * Runs before first paint. Without this the document renders light, then
 * hydration swaps it — a white flash on every load for anyone using dark.
 * Same before-paint pattern as `splashBootScript`.
 *
 * Three states, not two. "Dark" and "light" are explicit choices that must
 * survive the OS changing; "system" is the default and must keep tracking it.
 * A two-state toggle cannot express "follow my OS", which is what a first-time
 * visitor actually wants.
 *
 * `color-scheme` is set alongside the attribute so form controls, scrollbars
 * and the canvas behind the page come from the right palette — CSS variables
 * alone do not reach those.
 */
export const themeBootScript = `
(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_KEY)});
    var choice = stored === 'light' || stored === 'dark' ? stored : 'system';
    var dark = choice === 'dark' ||
      (choice === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.dataset.theme = dark ? 'dark' : 'light';
    root.dataset.themeChoice = choice;
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {
    /* Storage blocked: fall through to the light default in CSS. */
  }
})();
`;

/** Applies a choice to the document and remembers it. */
function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  const dark =
    choice === "dark" ||
    (choice === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  /*
   * The transition class is added only for the duration of a deliberate
   * switch. If the transition lived permanently on `*`, every page load would
   * animate from the browser's default colours, and every hover that changes a
   * background would inherit a 300ms colour fade.
   */
  root.classList.add("theme-transition");
  window.setTimeout(() => root.classList.remove("theme-transition"), 320);

  root.dataset.theme = dark ? "dark" : "light";
  root.dataset.themeChoice = choice;
  root.style.colorScheme = dark ? "dark" : "light";

  try {
    if (choice === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, choice);
  } catch {
    /* Private mode: the choice holds for this page only. */
  }

  window.dispatchEvent(new Event(THEME_EVENT));
}

/*
 * The selection is external state — it lives on a DOM attribute written before
 * React booted, and it tracks a media query. `useSyncExternalStore` is the
 * supported way to read that: it renders `getServerSnapshot` during SSR and
 * hydration, then re-renders from `getSnapshot`, so there is no mismatch and no
 * synchronous setState in an effect.
 */
function subscribe(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", onChange);
  window.addEventListener(THEME_EVENT, onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener(THEME_EVENT, onChange);
  };
}

function getSnapshot(): ThemeChoice {
  const value = document.documentElement.dataset.themeChoice;
  return value === "light" || value === "dark" ? value : "system";
}

/** Unknowable on the server, so the control renders as a reserved space. */
function getServerSnapshot(): ThemeChoice | null {
  return null;
}

/**
 * Segmented System / Light / Dark control.
 *
 * Renders nothing until mounted. The correct state is only knowable on the
 * client — it lives in localStorage and a media query — and rendering a guess
 * on the server would either flash the wrong selection or fail hydration.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const choice = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // While on "system", keep following the OS if it changes mid-session. This
  // only re-applies the theme to the document; the store above is what tells
  // React about it.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (document.documentElement.dataset.themeChoice === "system") {
        applyTheme("system");
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  if (choice === null) {
    // Reserve the footprint so the header does not shift when it appears.
    return <div className={`theme-toggle theme-toggle--idle ${className}`} />;
  }

  return (
    <div
      className={`theme-toggle ${className}`}
      role="radiogroup"
      aria-label="Colour theme"
    >
      {CHOICES.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={choice === value}
          aria-label={label}
          title={label}
          data-active={choice === value ? "" : undefined}
          onClick={() => applyTheme(value)}
          data-press="toggle"
          className="theme-toggle__option"
        >
          <Icon size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
