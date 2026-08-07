import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ScrollDrift } from "@/components/scroll-drift";
import { READING_DRIFT } from "@/components/scroll-stage";
import { DrawIcon } from "@/components/draw-icon";
import { FlickeringGrid } from "@/components/flickering-grid";
import { Container, SectionHeading, ServiceIcon } from "@/components/ui";
import { services } from "@/lib/site";

/*
 * The services list: seven cells, each an icon, a name, one line of what it is,
 * and a way in.
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
        <ScrollDrift className="mt-16" phasing={READING_DRIFT}>
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
                    `data-spotlight` is the hover target, so it goes on the link
                    rather than the cell: the wash should follow the pointer
                    across the surface the visitor is actually pointing at, and
                    the cell also owns the shared hairlines.
                  */}
                  <Link
                    href={`/services/${service.slug}`}
                    data-press="card"
                    data-spotlight=""
                    className="group flex h-full flex-col p-8 transition-colors duration-300 hover:bg-paper-warm lg:p-10"
                  >
                    <span className="flex h-12 w-12 items-center justify-center border border-rule text-brand transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                      {/*
                        Offset per column so a row of three does not draw in
                        lockstep. `i % 3` matches the `Reveal` delay above, so
                        the stroke starts as the cell finishes arriving.
                      */}
                      <DrawIcon delay={(i % 3) * 90}>
                        <ServiceIcon name={service.icon} />
                      </DrawIcon>
                    </span>

                    {/*
                      **No hover effect on this heading, and that is the fix
                      rather than an omission.**

                      It used to carry `wght-hover`, which ramped the variable
                      weight axis 600 → 780. A heavier axis means wider glyphs,
                      and "Authorised Warranty Provider" sits exactly on its
                      wrap boundary: at 600 it is one line, at 780 it is two.
                      Pointing at that one card grew its title by 33px, which
                      grew its row, which grew the grid — measured at 1440px as
                      +33px on three cells and on the list. Every other card
                      was stable, so the fault only showed on the one title
                      whose length happened to straddle the break.

                      Any weight ramp on wrapping text has this failure mode
                      waiting in it: it is not a bug in the value, it is what
                      changing font metrics on hover does. A future title one
                      word longer would reintroduce it at some viewport width.

                      The card still answers the pointer four ways — the cell
                      warms, the cursor wash follows, the icon fills brand, and
                      the action turns and steps. None of them touch layout.
                    */}
                    <h3 className="display-3 mt-7">{service.title}</h3>

                    <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
                      {service.short}
                    </p>

                    {/*
                      The arrow alone, pinned to the floor of the cell.

                      It replaced a "Read more" label, which was the same
                      instruction printed seven times under seven headings that
                      already said what they were. The whole cell is the link
                      and answers the pointer four ways — the surface warms, the
                      cursor wash follows, the icon fills brand, this turns —
                      so the label was telling a visitor something the card was
                      already demonstrating.

                      `mt-auto` is what gives the cell a floor, and it is the
                      reason the summary can stand on its own line without the
                      slack reading as an unfinished cell.
                    */}
                    {/*
                      The wrapper carries the spacing, not the icon. An `svg`
                      inherits `box-sizing: border-box` from preflight and
                      carries its size as `width`/`height` attributes, so
                      padding on it eats the glyph rather than sitting above it.
                    */}
                    <span className="mt-auto pt-10">
                      <ArrowUpRight
                        size={20}
                        strokeWidth={1.75}
                        aria-hidden="true"
                        className="text-ink-muted transition-[color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                      />
                    </span>
                  </Link>
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
                className="group relative flex h-full flex-col justify-center p-8 lg:p-10"
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
