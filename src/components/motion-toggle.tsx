"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Monitor, Zap, ZapOff } from "lucide-react";
import {
  applyMotion,
  motionChoice,
  prefersReducedMotion,
  subscribeMotion,
  type MotionChoice,
} from "@/lib/motion";

/**
 * Segmented System / Motion on / Motion off control, built on the same
 * `useSyncExternalStore` pattern as `ThemeToggle` — the selection lives on a
 * DOM attribute written before React booted and tracks a media query, so it is
 * external state, not React state.
 *
 * Why this control exists at all is in `src/lib/motion.ts`: Windows reports
 * reduced motion whenever its "Animation effects" switch is off, which is the
 * factory or technician default on a lot of low-powered machines, and their
 * owner has no way to tell the site otherwise.
 */

const CHOICES: { value: MotionChoice; label: string; Icon: typeof Zap }[] = [
  { value: "system", label: "Motion: system setting", Icon: Monitor },
  { value: "full", label: "Motion: on", Icon: Zap },
  { value: "reduced", label: "Motion: off", Icon: ZapOff },
];

function getSnapshot(): MotionChoice {
  return motionChoice();
}

/** Unknowable on the server, so the control renders as a reserved space. */
function getServerSnapshot(): MotionChoice | null {
  return null;
}

export function MotionToggle({ className = "" }: { className?: string }) {
  const choice = useSyncExternalStore(
    subscribeMotion,
    getSnapshot,
    getServerSnapshot,
  );

  if (choice === null) {
    // Reserve the footprint so the header does not shift when it appears.
    return <div className={`theme-toggle theme-toggle--idle ${className}`} />;
  }

  return (
    <div
      className={`theme-toggle ${className}`}
      role="radiogroup"
      aria-label="Animation"
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
          onClick={() => applyMotion(value)}
          data-press="toggle"
          data-ripple=""
          className="theme-toggle__option"
        >
          <Icon size={15} strokeWidth={2} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

/*
 * A counter, not the resolved state, so the key is identical on the server and
 * at hydration: a reduced-motion visitor must not pay a whole-page remount just
 * for arriving. It only advances on an actual switch.
 */
let switchCount = 0;
let lastState = "";

function subscribeGeneration(onChange: () => void) {
  lastState = prefersReducedMotion() ? "reduced" : "full";
  return subscribeMotion(() => {
    const next = prefersReducedMotion() ? "reduced" : "full";
    if (next === lastState) return;
    lastState = next;
    switchCount += 1;
    onChange();
  });
}

/**
 * Remounts the page when the motion preference changes.
 *
 * The attribute reaches CSS instantly, but every scroll-linked and
 * observer-driven component decides once, in a mount effect — `Parallax`,
 * `ScrollStage`, `Counter`, `DrawIcon` and the rest all return early when
 * motion is off and never look again. Keying the subtree on the resolved state
 * makes those effects re-run, so the switch takes effect on the page the
 * visitor is already looking at rather than on the next navigation.
 *
 * The cost is that page-level component state resets on a switch. That is
 * acceptable for a deliberate, rare preference change, and it is what a reload
 * would do anyway — without the network round trip or the lost scroll position.
 */
export function MotionScope({ children }: { children: ReactNode }) {
  const generation = useSyncExternalStore(
    subscribeGeneration,
    () => switchCount,
    () => 0,
  );

  /*
   * `display: contents` — the wrapper is a remount handle, not a box. It must
   * not introduce a block into layouts whose children are grid or flex items.
   */
  return (
    <div key={generation} className="contents">
      {children}
    </div>
  );
}
