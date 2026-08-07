import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ScrollDrift } from "@/components/scroll-drift";
import { DrawIcon } from "@/components/draw-icon";
import { FlickeringGrid } from "@/components/flickering-grid";
import { Container, SectionHeading, ServiceIcon } from "@/components/ui";
import { services, type Service } from "@/lib/site";

/*
 * The services list, read as a contract schedule rather than as seven summary
 * lines.
 *
 * What fills the cells is `features[].title`: the actual line items of each
 * service, in the trade's own vocabulary — "Fault ticketing and escalation",
 * "Backfill staffing", "SD-WAN". They were already written and were only ever
 * shown one level down. A visitor choosing between seven services could not
 * tell any of them apart from a single summary line, and every cell carried a
 * hollow gap under that line, because grid rows equalise to the tallest title
 * and the content did not reach the bottom.
 *
 * Deliberately NOT here:
 *
 *   - **01/02/03 markers.** These are seven parallel services, not a sequence.
 *     Numbering them would assert an order that does not exist.
 *   - **The SLA tier table.** A good fit for the contracted service, except
 *     that the Service Level Assurance band further down this same page
 *     already carries it, and nothing should say the same thing twice.
 *   - **A double-height cell for the contracted service.** Tried, measured,
 *     cut. The section's lede does claim a hierarchy — "one contract and add
 *     scope as it proves itself" — and spanning two rows states it. But the
 *     row heights are set by the *other* cells, so the tall cell came out
 *     1013px against ~470px of content: a bigger void than the one this was
 *     fixing. Filling it with the 10-point recurring scope very nearly worked
 *     at one viewport width, which is a pixel coincidence rather than a
 *     layout. The schedule below is the idea; the span was an accessory.
 *
 * Grid rules are unchanged: the list supplies the top and left hairlines,
 * every cell supplies its own right and bottom. No nth-child arithmetic, so
 * the frame stays correct at any column count, and the fill stays exact —
 * seven services plus the closing panel, one column each at sm, two columns
 * for the panel at lg.
 */

/** Line items per cell before the remainder is counted. */
const SCOPE_ROWS = 3;

/** The schedule under each summary: what the service actually covers. */
function ScopeList({ service }: { service: Service }) {
  const shown = service.features.slice(0, SCOPE_ROWS);
  const rest = service.features.length - shown.length;

  return (
    <div className="mt-7">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-muted">
        {service.featureHeading}
      </p>

      {/*
        Ruled rows, because a schedule is a ruled document and this site draws
        with hairlines. `divide-y` rather than a border per row so the list
        cannot end on a stray rule under its last item.

        The rows are ruled at 55% of `--color-rule` while the list's own top
        edge is at full strength. At equal weight the schedule's rules read as
        the same order of structure as the grid's own hairlines, and a cell
        stopped being one thing containing a list and became a stack of eight
        bands. The frame is the structure; these are inside it.
      */}
      <ul className="mt-3 divide-y divide-rule/55 border-t border-rule">
        {shown.map((feature) => (
          <li
            key={feature.title}
            className="py-2 text-[0.85rem] leading-snug text-ink-soft"
          >
            {feature.title}
          </li>
        ))}

        {rest > 0 && (
          /*
            The count is the one orange mark inside a cell, and it earns it: it
            is the only thing on the card that says how much more there is, so
            it is also the reason to open the page. `tabular` keeps the digits
            aligned down the column of cards.
          */
          <li className="py-2 text-[0.85rem] leading-snug text-ink-muted">
            <span className="tabular font-semibold text-brand">+{rest}</span>{" "}
            more
          </li>
        )}
      </ul>
    </div>
  );
}

export function ServicesGrid({
  // No default eyebrow. "Our services" over "Seven service lines" is the
  // headline said twice; the caller can still pass one where it earns itself.
  eyebrow,
  title = "Seven service lines, one support partner",
  lede = "Most clients start with one contract and add scope as it proves itself. Each service stands alone, and each is measured against the same service level commitment.",
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
        */}
        <ScrollDrift className="mt-16">
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
                      `wght-hover` ramps the variable axis 600 → 780 on hover of
                      the surrounding `group` link. The weight is the hover
                      state — the type thickens rather than something being
                      added to it.
                    */}
                    <h3 className="display-3 wght-hover mt-7">
                      {service.title}
                    </h3>

                    <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft">
                      {service.short}
                    </p>

                    {/*
                      `flex-1` moved off the summary and onto the schedule, so
                      the slack in a cell falls *below* the content rather than
                      opening a gap in the middle of it. That gap was the whole
                      reason these cells read as empty.
                    */}
                    <div className="flex-1">
                      <ScopeList service={service} />
                    </div>

                    <span className="mt-8 inline-flex items-center gap-1.5 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-ink-muted transition-colors group-hover:text-brand">
                      Read more
                      <ArrowUpRight
                        size={14}
                        strokeWidth={2.5}
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
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
                <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-white/65">
                  Send us the estate and we will tell you which of these
                  actually applies, and which you can leave alone.
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
