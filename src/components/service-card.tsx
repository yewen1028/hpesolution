import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { DrawIcon } from "@/components/draw-icon";
import { ServiceIcon } from "@/components/service-icon";
import type { Service } from "@/lib/site";

/* ---------------------------------------------------------------------------
   One service, as a cell of a hairline grid.

   **There is one of these, and every list of services on the site renders it.**
   It was written twice — the home and `/services` grid in
   `sections/services-grid.tsx`, and "Related services" at the foot of each
   service page — and the two had drifted apart in every respect that a visitor
   would notice: the sibling cards had no icon frame, a `text-lg` title against
   the grid's `display-3`, a right-pointing arrow against the grid's diagonal
   one, tighter padding, and none of the grid's four hover responses. Landing on
   a service page from the grid meant meeting the same seven services again in a
   different, smaller costume, which reads as two different sites.

   This element owns only the inside of the cell. The **hairlines belong to the
   list**, per the house grid rule — the container draws left and top, each cell
   draws right and bottom — so the caller supplies the `<li>` and its borders and
   this fills it. That is also what lets the home grid close its trailing row
   with a CTA panel that is not a service.

   The card answers the pointer five ways, none of which touch layout: the
   surface warms, the cursor wash follows (`data-spotlight`), the icon fills
   brand, the title lifts word by word (`.svc-word`), and the arrow turns and
   steps. On the layout constraint that governs the title, see the note in
   `services-grid.tsx` — anything here that animates font metrics rather than a
   transform rewraps a heading and grows the whole grid.
--------------------------------------------------------------------------- */

export function ServiceCard({
  service,
  /**
   * The card's position in its row, used to offset the icon draw so a row does
   * not stroke in lockstep. Match it to the `Reveal` delay the caller gives the
   * cell, so the stroke starts as the cell finishes arriving.
   */
  drawDelay = 0,
}: {
  service: Service;
  drawDelay?: number;
}) {
  return (
    /*
      `data-spotlight` is the hover target, so it goes on the link rather than
      the cell: the wash should follow the pointer across the surface the
      visitor is actually pointing at, and the cell owns the shared hairlines.
    */
    <Link
      href={`/services/${service.slug}`}
      data-press="card"
      data-spotlight=""
      className="svc-card group flex h-full flex-col p-9 transition-colors duration-300 hover:bg-paper-warm lg:p-12"
    >
      <span className="flex h-14 w-14 items-center justify-center border border-rule text-brand transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
        <DrawIcon delay={drawDelay}>
          <ServiceIcon name={service.icon} size={24} />
        </DrawIcon>
      </span>

      {/*
        The title lifts word by word on hover. `--w` is the word's index and
        `--wn` the count, which is what lets the return unwind in reverse;
        `.svc-word` in globals.css carries the rest.

        Splitting on spaces keeps the spaces outside the spans, so the browser
        still breaks the line where it always did and the heading is read as
        one sentence.
      */}
      <h3 className="display-3 mt-9">
        {service.title.split(" ").map((word, w, words) => (
          <Fragment key={`${word}-${w}`}>
            <span
              className="svc-word"
              style={
                {
                  "--w": String(w),
                  "--wn": String(words.length - 1),
                } as CSSProperties
              }
            >
              {word}
            </span>
            {w < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </h3>

      {/*
        Capped at a comfortable measure rather than the column width. `short` is
        56–67 characters, so at three columns on a wide screen it sets as one
        long line hugging both edges of a cell that is otherwise generously
        padded — the cell reads as full while the type reads as cramped.
      */}
      <p className="mt-5 max-w-[34ch] text-[0.95rem] leading-[1.75] text-ink-soft">
        {service.short}
      </p>

      {/*
        The arrow alone, pinned to the floor of the cell — `mt-auto` is what
        gives every cell a defined floor, so the slack in a short one falls as
        deliberate space rather than as a void in the middle of the content.

        The wrapper carries the spacing, not the icon. An `svg` inherits
        `box-sizing: border-box` from preflight and carries its size as
        `width`/`height` attributes, so padding on it eats the glyph rather than
        sitting above it.
      */}
      <span className="mt-auto pt-14">
        <ArrowUpRight
          size={20}
          strokeWidth={1.75}
          aria-hidden="true"
          className="text-ink-muted transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
        />
      </span>
    </Link>
  );
}
