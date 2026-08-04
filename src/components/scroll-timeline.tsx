"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { onScrollFrame, prefersReducedMotion } from "@/lib/scroll-motion";

/**
 * Where in the viewport the timeline "reads". 0.55 puts the reference line
 * slightly below centre, so a step lights up as you arrive at it rather than
 * after it has already passed the middle of the screen.
 */
const ANCHOR = 0.55;

export type TimelineStep = {
  title: string;
  body: string;
};

/**
 * Vertical timeline whose connecting line grows continuously with scroll.
 *
 * Not a one-shot reveal: `--timeline-progress` is recomputed every frame from
 * the track's position against a fixed line in the viewport, so scrolling back
 * up shortens the line again. That is the difference between a scroll-*linked*
 * animation and a scroll-*triggered* one.
 *
 * ## Progress
 *
 * Measured from the track element's own rect rather than from window offsets,
 * so it stays correct inside a sticky or transformed ancestor and needs no
 * document-height bookkeeping.
 *
 * ## Node activation
 *
 * Each step's fraction along the track is measured once (and on resize), and a
 * step is "reached" when `progress` passes it. Deriving activation from the
 * same number that drives the line is what keeps the dot lighting up exactly as
 * the line arrives — checking each node's own rect separately drifts by a frame
 * and reads as sloppy.
 *
 * ## Static state
 *
 * The complete timeline is what the server renders: full line, every step
 * active. `data-armed` is added by this component and is what CSS keys the
 * dimming off, so no JavaScript, reduced motion, or a failed measurement all
 * leave the section fully legible.
 */
export function ScrollTimeline({
  steps,
  className = "",
  children,
}: {
  steps: TimelineStep[];
  className?: string;
  /** Optional trailing content inside the track, e.g. a closing note. */
  children?: ReactNode;
}) {
  const trackRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Reduced motion keeps the server-rendered complete state.
    if (prefersReducedMotion()) return;

    const nodes = Array.from(
      track.querySelectorAll<HTMLElement>("[data-timeline-step]"),
    );
    if (nodes.length === 0) return;

    /** Fraction along the track at which each step sits. */
    let marks: number[] = [];

    const measure = () => {
      const height = track.offsetHeight;
      if (height <= 0) {
        marks = [];
        return;
      }
      marks = nodes.map((node) => {
        // Centre of the node's dot, relative to the track.
        const centre = node.offsetTop + node.offsetHeight / 2;
        return Math.min(1, Math.max(0, centre / height));
      });
    };

    const update = () => {
      const rect = track.getBoundingClientRect();
      if (rect.height <= 0) return;

      const anchor = window.innerHeight * ANCHOR;
      const progress = Math.min(
        1,
        Math.max(0, (anchor - rect.top) / rect.height),
      );

      track.style.setProperty("--timeline-progress", progress.toFixed(4));

      for (let i = 0; i < nodes.length; i += 1) {
        const reached = progress >= (marks[i] ?? 1);
        // toggleAttribute is a no-op when the state already matches, so this
        // does not dirty the DOM on every frame.
        nodes[i].toggleAttribute("data-reached", reached);
      }
    };

    track.setAttribute("data-armed", "");
    measure();
    update();

    const observer = new ResizeObserver(() => {
      measure();
      update();
    });
    observer.observe(track);

    const offScroll = onScrollFrame(update);

    return () => {
      offScroll();
      observer.disconnect();
      track.removeAttribute("data-armed");
      track.style.removeProperty("--timeline-progress");
      for (const node of nodes) node.removeAttribute("data-reached");
    };
  }, [steps.length]);

  return (
    <ol ref={trackRef} className={`timeline ${className}`}>
      {/* The rail sits behind the steps and spans the whole track. */}
      <span className="timeline__rail" aria-hidden="true">
        <span className="timeline__rail-fill" />
      </span>

      {steps.map((step, i) => (
        <li key={step.title} data-timeline-step className="timeline__step">
          <span className="timeline__node" aria-hidden="true" />

          <span className="timeline__index tabular">
            {String(i + 1).padStart(2, "0")}
          </span>

          <div className="timeline__body">
            <h3 className="font-display text-lg font-semibold text-ink">
              {step.title}
            </h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
              {step.body}
            </p>
          </div>
        </li>
      ))}

      {children}
    </ol>
  );
}
