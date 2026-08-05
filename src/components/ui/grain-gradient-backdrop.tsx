"use client";

import { useSyncExternalStore } from "react";
import { GrainGradient } from "@paper-design/shaders-react";
import { prefersReducedMotion, subscribeMotion } from "@/lib/motion";

/**
 * The grain-gradient field from Paper Design's shader set, dressed in the HPE
 * palette and wired to this site's rules.
 *
 * Four things differ from the published usage, all of them house rules:
 *
 *  - **Brand colours, not the demo's.** The reference ships `#FC7819`, which is
 *    within a couple of points of `--color-brand` #F26F21 — near enough that
 *    using the real token costs nothing and keeps the one orange on the site
 *    the same orange. `--color-brand-strong` #D4550C gives the field somewhere
 *    to fall away to.
 *  - **`speed={0}` under reduced motion, not unmounted.** A still frame of this
 *    shader is a perfectly good gradient, so the section keeps its surface and
 *    loses only the movement. Same principle as the network map: the static
 *    state is the complete state, and the animation only replays an arrival.
 *  - **It re-reads the preference.** `subscribeMotion` means the header's
 *    Animation toggle stops and starts this in place.
 *  - **`maxPixelCount` is capped.** This is a full-panel WebGL fragment shader
 *    and the machines this site is read on include the low-powered laptops the
 *    motion preference exists for. The cap renders at a lower internal
 *    resolution and lets the browser scale it up; on a grainy gradient with no
 *    hard edges that is invisible, and it is the difference between a smooth
 *    panel and a hot fan.
 *
 * Decorative: `aria-hidden`, and everything above it carries its own contrast.
 */
export function GrainGradientBackdrop({
  className = "",
}: {
  className?: string;
}) {
  const reduced = useSyncExternalStore(
    subscribeMotion,
    prefersReducedMotion,
    // Server and hydration both assume motion; the effect corrects it on the
    // client, which is one frame and no layout shift.
    () => false,
  );

  return (
    <GrainGradient
      aria-hidden="true"
      className={`absolute inset-0 ${className}`}
      /* Frozen on a frame that reads well as a still, rather than switched off. */
      speed={reduced ? 0 : 1}
      frame={2854.5}
      scale={1}
      rotation={0}
      offsetX={0}
      offsetY={0}
      softness={0.5}
      intensity={0.5}
      noise={0.25}
      shape="corners"
      colors={["#FFFFFF", "#F26F21", "#D4550C", "#FFFFFF"]}
      colorBack="#00000000"
      maxPixelCount={1_200_000}
    />
  );
}

export default GrainGradientBackdrop;
