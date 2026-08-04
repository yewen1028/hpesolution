"use client";

import { useEffect, useState } from "react";
import { Odometer } from "@/components/odometer";
import { Container } from "@/components/ui";
import { stats } from "@/lib/site";

/**
 * Demonstration harness for `Odometer`, not part of any route.
 *
 * It exists because nothing on this site actually changes at runtime — every
 * figure in `site.ts` is a build-time constant — so there is no live value to
 * point the component at. This drives a real one, "Customer nodes managed"
 * (50,000), with a mock feed so the digit roll can be seen doing the thing it
 * is for.
 *
 * To view it, drop `<OdometerDemo />` into any page temporarily. If a real feed
 * is ever added, replace `useMockNodeCount` with it and delete this file.
 */

/** The real stat this is standing in for. */
const nodeStat = stats.find((s) => s.label === "Customer nodes managed");
const BASE = nodeStat?.value ?? 50000;

/** Mock feed: nudges the count every 2.2s the way a live figure would. */
function useMockNodeCount() {
  const [count, setCount] = useState(BASE);

  useEffect(() => {
    const id = setInterval(() => {
      // A spread wide enough to roll several columns, including the carry that
      // happens when the hundreds tick over into the thousands.
      setCount((n) => {
        const drift = Math.floor(Math.random() * 1800) - 700;
        return Math.max(0, n + drift);
      });
    }, 2200);

    return () => clearInterval(id);
  }, []);

  return count;
}

export function OdometerDemo() {
  const nodes = useMockNodeCount();
  const [manual, setManual] = useState(999);

  return (
    <section className="border-t border-rule py-24">
      <Container>
        <p className="eyebrow">Odometer demo</p>

        <div className="mt-10 grid gap-14 lg:grid-cols-2">
          {/* 1. The real stat, on a mock live feed. */}
          <div>
            <span className="display-2 block font-display font-semibold text-ink">
              <Odometer value={nodes} suffix="+" />
            </span>
            <span className="mt-2.5 block text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-brand">
              {nodeStat?.label ?? "Customer nodes managed"}
            </span>
            <p className="mt-2 max-w-[32ch] text-[0.85rem] leading-relaxed text-ink-muted">
              Updating every 2.2s from a mock feed. Watch the hundreds column
              carry into the thousands — the wheels to its left roll with it.
            </p>
          </div>

          {/* 2. Column-count change, the case that usually breaks odometers. */}
          <div>
            <span className="display-2 block font-display font-semibold text-ink">
              <Odometer value={manual} />
            </span>
            <span className="mt-2.5 block text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-brand">
              Digit-count change
            </span>
            <div className="mt-5 flex flex-wrap gap-3">
              {[7, 42, 999, 1000, 12345].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setManual(n)}
                  data-press="cta"
                  className="border border-rule-strong px-4 py-2 text-[0.85rem] font-semibold text-ink transition-colors hover:border-ink hover:bg-paper-warm"
                >
                  {n.toLocaleString("en-MY")}
                </button>
              ))}
            </div>
            <p className="mt-4 max-w-[36ch] text-[0.85rem] leading-relaxed text-ink-muted">
              999 → 1,000 gains a column and a separator. Keying by position
              from the right is what keeps the existing wheels animating rather
              than remounting.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
