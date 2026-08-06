import { GridPattern } from "@/components/grid-pattern";
import { Reveal } from "@/components/reveal";
import { Container, ParallaxBand } from "@/components/ui";
import type { Service } from "@/lib/site";

/**
 * The single parallax figure each service page carries below its hero, and the
 * one implementation all seven use. Only the photograph and the words are per
 * service; the movement is not, and there is deliberately no prop by which a
 * page could vary it.
 *
 * This used to take `band.variant` from `site.ts` and render either a drift or
 * an aperture — three of the seven pinned their photograph and four lagged it.
 * As a set that read as an inconsistency rather than as rhythm: the same slot,
 * at the same point on the same template, moving in two different directions
 * depending on which service you had clicked. One figure everywhere.
 *
 * Drift is the one kept because it is the figure that can be made exact. The
 * layer is oversized by its own peak travel and the travel is clamped to it
 * (see `Parallax`), so no scroll position at any viewport can uncover the
 * frame — a guarantee the aperture, which is pinned against the window and
 * clamps into a seam at the ends of a tall band, cannot give.
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
      speed={90}
      // Phones and tablets hold the photograph still: scroll there arrives in
      // flings rather than continuously, which is where a drifting layer reads
      // as stutter. Reduced motion is handled inside `Parallax` on every device.
      flattenOnCoarsePointer
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
