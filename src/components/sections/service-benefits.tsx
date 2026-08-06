import type { CSSProperties } from "react";
import { BenefitsStage } from "@/components/benefits-stage";
import { DisplayWatermark } from "@/components/display-watermark";
import { GridPattern } from "@/components/grid-pattern";
import { Reveal } from "@/components/reveal";
import { Container, SectionHeading } from "@/components/ui";
import type { Service } from "@/lib/site";

/**
 * The closing argument of a service page: what the customer no longer has to
 * do once this is contracted out.
 *
 * These used to be equal cards in a four-up grid, which had two problems. The
 * services carry three, four and five benefits, so the last row was ragged on
 * five of the seven pages; and a card grid is not the grammar of this site —
 * the rest of the page is drawn in hairlines. So the block is now a ledger:
 * one row per claim, the claim set large in the left column and its
 * qualification opposite. It reads the same at three rows as at five, and
 * nothing has to be padded to fill a cell.
 *
 * Rows rather than a numbered list on purpose. The features block directly
 * above already numbers its items, and a page that indexes two of its sections
 * the same way makes the second one look like a continuation of the first.
 */
export function ServiceBenefits({ benefits }: { benefits: Service["benefits"] }) {
  return (
    <BenefitsStage
      id="benefits"
      className="relative isolate scroll-mt-28 overflow-hidden border-t border-rule bg-paper-warm py-24 sm:py-32"
    >
      {/*
        The ruled field behind the ledger. Faint enough to read as paper stock
        rather than as a chart, and — like every other use of GridPattern on
        this site — it does not move. A regular grid is the one thing parallax
        cannot be applied to: translated, it is congruent with itself, so the
        drift is invisible at every offset but the masked edges.
      */}
      <div className="benefits__field" aria-hidden="true">
        <GridPattern size={72} />
      </div>

      {/*
        The layer that actually carries the parallax, and it has to be a shape
        with a recognisable position for the travel to read at all. The figure
        is the number of outcomes, already stated in the marker beside the
        heading — the same duplicate-as-graphic the coverage band makes of its
        centre count.
      */}
      <div className="benefits__mark" aria-hidden="true">
        <DisplayWatermark tone="dark">
          {String(benefits.length).padStart(2, "0")}
        </DisplayWatermark>
      </div>

      <Container>
        <div className="benefits__head flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <SectionHeading title="What changes once this is contracted out" />
          </Reveal>
          {/*
            Not a label for the section — the heading already is one. It says
            how long the list is, which is the one thing the heading cannot,
            and it lets the reader see the shape of what follows before
            reading it.
          */}
          <Reveal
            as="p"
            delay={140}
            className="shrink-0 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-muted"
          >
            <span className="tabular text-brand">
              {String(benefits.length).padStart(2, "0")}
            </span>{" "}
            outcomes
          </Reveal>
        </div>

        <ul className="benefits__list mt-14 sm:mt-16">
          {benefits.map((benefit, i) => (
            <Reveal
              as="li"
              key={benefit.title}
              delay={i * 70}
              className="benefit-row"
              // Each row's title drifts a little further than the one above it,
              // so the column shears against the bodies instead of sliding as
              // one block. Read by `.benefit-row__title`.
              style={{ "--i": i } as CSSProperties}
            >
              <h3 className="benefit-row__title display-3">{benefit.title}</h3>
              <p className="max-w-[56ch] text-[0.95rem] leading-relaxed text-ink-soft">
                {benefit.body}
              </p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </BenefitsStage>
  );
}
