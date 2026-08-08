import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ScrollDrift } from "@/components/scroll-drift";
import { READING_DRIFT } from "@/components/scroll-stage";
import { ServiceCard } from "@/components/service-card";
import { FlickeringGrid } from "@/components/flickering-grid";
import { Container, SectionHeading } from "@/components/ui";
import { services } from "@/lib/site";

/*
 * The services list: seven cells, each an icon, a name, one line of what it is,
 * and a way in.
 *
 * **The inside of a cell is `components/service-card.tsx`, not this file.** The
 * related-services row at the foot of every service page renders the same
 * element, so a visitor who arrives there from this grid meets the same card
 * rather than a smaller imitation of it. This file owns the frame: the
 * hairlines, the reveal order, the drift, and the panel that closes the row.
 *
 * The cells are deliberately roomy — `p-9` rising to `p-12`, a 56px icon frame,
 * and the summary capped to a 34-character measure rather than the column
 * width. Seven items on a page that is mostly hairlines and warm white can
 * afford the space, and at three columns on a wide screen an uncapped summary
 * sets as one long line hugging both edges of a cell that is otherwise padded:
 * the cell reads as full while the type reads as cramped.
 *
 * **The cells used to carry a schedule** — `featureHeading` plus the first three
 * `features[].title` on ruled rows, plus a "+4 more" count. It was put there
 * because a summary-only cell left a hollow gap under its one line, grid rows
 * being equalised to the tallest title. That fixed the gap by filling it, which
 * is the wrong move twice over: it made the visitor read roughly sixty words per
 * cell to choose between seven services, and it duplicated the service page's
 * own contents list one click before you got to it.
 *
 * The gap is now closed at the bottom instead. The affordance is pinned there
 * with `mt-auto`, so every cell has a defined floor and the slack falls as
 * deliberate space between the summary and the arrow rather than as a void in
 * the middle of the content. Nothing needs padding out to fill a cell.
 *
 * `short` in `site.ts` is doing the work, and it is already written for it —
 * every one is between 56 and 67 characters, concrete, in the trade's own
 * vocabulary. If a cell ever looks thin, shorten the neighbouring one; do not
 * add a second paragraph.
 *
 * Deliberately NOT here:
 *
 *   - **01/02/03 markers.** These are seven parallel services, not a sequence.
 *     Numbering them would assert an order that does not exist.
 *   - **The SLA tier table.** A good fit for the contracted service, except
 *     that the Service Level Assurance band further down this same page
 *     already carries it, and nothing should say the same thing twice.
 *   - **A double-height cell for the contracted service.** Tried, measured,
 *     cut. The row heights are set by the *other* cells, so the tall cell came
 *     out 1013px against ~470px of content: a bigger void than the one it was
 *     fixing.
 *
 * Grid rules are unchanged: the list supplies the top and left hairlines,
 * every cell supplies its own right and bottom. No nth-child arithmetic, so
 * the frame stays correct at any column count, and the fill stays exact —
 * seven services plus the closing panel, one column each at sm, two columns
 * for the panel at lg.
 */

export function ServicesGrid({
  // No default eyebrow. "Our services" over "Seven service lines" is the
  // headline said twice; the caller can still pass one where it earns itself.
  eyebrow,
  title = "Seven service lines, one support partner",
  // Two clauses, both load-bearing: each service can be bought alone, and all
  // of them carry the same SLA. The sentence about clients starting with one
  // contract and adding scope was setting up a hierarchy the grid does not
  // draw — seven equal cells — so it argued against what it introduced.
  lede = "Each service stands alone, and every one is measured against the same service level commitment.",
}: {
  eyebrow?: string;
  title?: string;
  lede?: string;
}) {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} lede={lede} />
        </Reveal>

        {/*
          The grid lags the heading above it as it arrives, and again as it
          leaves — and does nothing at all in between, which is the point.
          `ScrollDrift` measures the list and publishes the phase; `.svc-list`
          decides how far it travels.

          The transform is on the list, not on the cells. Each cell draws its
          own right and bottom hairline, so staggering them individually pulls
          the grid's rules apart into a jagged step — the frame has to travel
          as one piece.

          The wrapper is the ruler and the `<ul>` is what moves. They cannot be
          the same element: measuring the thing you are moving reads back your
          own last frame. See `scroll-drift.tsx`.

          `READING_DRIFT` is what puts the movement where it can be seen. The
          default spans resolve both phases while the grid is all but off
          screen — the arithmetic is written out where that constant is
          declared — so the grid held its settled state for every frame a
          visitor actually had in front of them.
        */}
        {/* The heading and the grid are two things, not one block: the list is
            wide and quiet, and it wants more air above it than a paragraph
            would. */}
        <ScrollDrift className="mt-20" phasing={READING_DRIFT}>
          <ul className="svc-list grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              return (
                <Reveal
                  as="li"
                  key={service.slug}
                  delay={(i % 3) * 90}
                  className="border-b border-r border-rule"
                >
                  {/*
                    The cell owns the hairlines; `ServiceCard` owns everything
                    inside it, and is the same element the related-services row
                    on each service page renders. `i % 3` offsets the icon draw
                    per column so a row does not stroke in lockstep, and matches
                    the `Reveal` delay above so the stroke starts as the cell
                    finishes arriving.
                  */}
                  <ServiceCard service={service} drawDelay={(i % 3) * 90} />
                </Reveal>
              );
            })}

            {/* Closes the grid and gives the row a destination. */}
            <Reveal
              as="li"
              delay={180}
              className="relative isolate overflow-hidden border-b border-r border-rule bg-paper-deep lg:col-span-2"
            >
              {/*
                The one place on the page a moving background belongs: a
                near-black panel, where an orange field reads as the accent the
                design system allows rather than a wash. The mask keeps it off
                the copy — it resolves out of nothing on the left and only ever
                reaches strength in the empty right half of the panel.
              */}
              <FlickeringGrid
                className="-z-10 [mask-image:linear-gradient(to_right,transparent_35%,black)]"
                squareSize={3}
                gridGap={7}
                flickerChance={0.24}
                color="var(--color-brand)"
                maxOpacity={0.34}
              />

              <Link
                href="/contact"
                data-press="card"
                data-tone="dark"
                data-spotlight=""
                className="group relative flex h-full flex-col justify-center p-9 lg:p-12"
              >
                <h3 className="display-3 max-w-md text-white">
                  Not sure which scope you need?
                </h3>
                {/* Kept short and kept the second half: telling a prospect what
                    they can leave alone is the line that makes the offer read
                    as advice rather than as a pitch. */}
                <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-white/65">
                  Send us the estate. We will tell you what applies, and what
                  you can leave alone.
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-brand">
                  Talk to our team
                  <ArrowRight
                    size={15}
                    strokeWidth={2.5}
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </Link>
            </Reveal>
          </ul>
        </ScrollDrift>
      </Container>
    </section>
  );
}
