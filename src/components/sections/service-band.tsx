import { GridPattern } from "@/components/grid-pattern";
import { Reveal } from "@/components/reveal";
import { Container, ParallaxBand } from "@/components/ui";
import type { Service } from "@/lib/site";

/**
 * The single parallax figure each service page carries below its hero.
 *
 * Which figure, which photograph and what it says are all decided per service
 * in `site.ts` — see the `band` field there for why a given page gets the
 * aperture rather than the drift. This component only draws it, so the seven
 * pages stay one template and the differentiation stays in the data.
 *
 * Sits between the last content section and Benefits on every page: a breath
 * at the same point in the rhythm, so the pages differ in what they show
 * without differing in how they are built.
 */
export function ServiceBand({ band }: { band: NonNullable<Service["band"]> }) {
  return (
    <ParallaxBand
      image={band.image}
      alt={band.alt}
      variant={band.variant}
      speed={90}
      className="border-t border-rule"
    >
      {/* Ruled backdrop over the tint, under the copy. Faint enough to read as
          texture on the photograph rather than as a chart. */}
      <div className="absolute inset-0 -z-10 text-white/[0.07]" aria-hidden="true">
        <GridPattern size={56} />
      </div>

      <Container className="py-28 sm:py-36">
        <Reveal>
          <div className="max-w-3xl">
            <span className="eyebrow eyebrow-light">{band.eyebrow}</span>
            <p className="mt-6 font-display text-2xl font-semibold leading-snug tracking-[-0.02em] text-white sm:text-[2rem]">
              {band.line}
            </p>
          </div>
        </Reveal>
      </Container>
    </ParallaxBand>
  );
}
