"use client";

import { useEffect, useRef, useState } from "react";

export type SectionLink = { id: string; label: string };

/**
 * In-page section nav with scroll-spy highlighting.
 *
 * The site header is route-based — its links go to other pages — so scroll-spy
 * has nothing to track there. This is the nav that does have in-page targets:
 * the service detail pages, which run features → scope → tiers → related.
 *
 * Spy logic uses one IntersectionObserver over all sections and picks the
 * *topmost* intersecting one, rather than "last one to fire". Firing order
 * depends on scroll direction, so the naive version highlights the wrong entry
 * when scrolling up. `rootMargin` pulls the detection band below the fixed
 * header and up from the bottom, so a section counts as current while it
 * occupies the upper part of the viewport — and it must be built from resolved
 * numbers, since IntersectionObserver rejects CSS expressions.
 *
 * Renders as a plain anchor list. With no JavaScript it is still a working
 * table of contents — the highlight is the only thing that depends on script.
 */
export function SectionNav({
  links,
  variant = "bar",
}: {
  links: SectionLink[];
  /** `bar` is a sticky strip under the header; `rail` is a vertical sidebar. */
  variant?: "bar" | "rail";
}) {
  const [activeId, setActiveId] = useState<string>(links[0]?.id ?? "");
  const ratios = useRef(new Map<string, number>());

  useEffect(() => {
    const elements = links
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    /*
     * `rootMargin` is parsed by IntersectionObserver, not by the CSS engine, so
     * it takes literal px and % only — `calc()` and `var()` throw
     * "rootMargin must be specified in pixels or percent" and the observer is
     * never constructed. The header height therefore has to be resolved to a
     * number here rather than handed over as a CSS expression.
     */
    const headerH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--header-h",
        ),
      ) || 76;

    // Header height off the top, 55% off the bottom: a section is "current"
    // while it holds the upper portion of the viewport.
    const rootMargin = `-${headerH + 8}px 0px -55% 0px`;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.current.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }

        // Topmost section still inside the band wins, so direction of travel
        // cannot change which entry is highlighted at a given scroll position.
        const current = elements.find(
          (el) => (ratios.current.get(el.id) ?? 0) > 0,
        );

        if (current) setActiveId(current.id);
      },
      { rootMargin, threshold: [0, 0.01, 0.25] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [links]);

  return (
    <nav
      className={`section-nav section-nav--${variant}`}
      aria-label="On this page"
    >
      <ul>
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              className="section-nav__link"
              data-active={activeId === link.id ? "" : undefined}
              aria-current={activeId === link.id ? "true" : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
