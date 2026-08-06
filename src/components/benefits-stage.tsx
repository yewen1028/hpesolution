"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { reducedMotion, registerScrollLayer } from "@/components/parallax";

/**
 * The `<section>` element for a service page's Benefits block, plus the one
 * scalar every moving part inside it is derived from.
 *
 * `--ben-p` runs -1 → 0 → +1 as the section's centre travels from half a
 * viewport below the fold, through the middle of the window, to half a viewport
 * above it. So the drift is already underway before the section arrives and
 * carries on after it has gone, rather than starting and stopping at the
 * section's own edges — the approach and the departure are the effect.
 *
 * One property, written once per frame on one element; the ruled backdrop and
 * the row titles read it in CSS at different rates and in opposite directions.
 * Adding another layer is a rule in `globals.css`, not another listener.
 *
 * Unset — no script, reduced motion — every `var(--ben-p, 0)` downstream
 * resolves to 0 and the section is simply a section.
 */
const clamp1 = (n: number) => (n < -1 ? -1 : n > 1 ? 1 : n);

export function BenefitsStage({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotion()) return;

    let progress = 0;

    const unregister = registerScrollLayer({
      // Safe to measure the same element we write to: nothing here transforms
      // the section itself, only its descendants, so the next read is not
      // displaced by the last write.
      el,
      read(rect, viewportH) {
        const centre = rect.top + rect.height / 2;
        progress = clamp1((viewportH / 2 - centre) / viewportH);
      },
      write() {
        el.style.setProperty("--ben-p", progress.toFixed(4));
      },
    });

    return () => {
      unregister();
      el.style.removeProperty("--ben-p");
    };
  }, []);

  return (
    <section ref={ref} id={id} className={className}>
      {children}
    </section>
  );
}
