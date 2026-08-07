import { PartnerCarousel } from "@/components/partner-carousel";
import { Reveal } from "@/components/reveal";
import { Container, SectionHeading } from "@/components/ui";

/*
 * The home page's partner band: an ordinary straight card strip travelling
 * left to right, rendered by `PartnerCarousel` in its `card` variant — the same
 * engine `/business-partner` uses for the bubble strip, so there is one loop,
 * one wrap point and one reduced-motion story between them.
 *
 * This replaces the curved `MarqueeAlongSvgPath` ribbon. Nothing else on the
 * page reads on a curve, and a straight strip presents seventeen marks at one
 * size, upright, with the name under each — which is what a list of principals
 * is for. The component that drew the curve is still in `components/ui/` if
 * that judgement is ever reversed.
 *
 * No client boundary here any more: the band is plain markup and the only
 * script is inside the carousel itself.
 */
export function Partners() {
  return (
    /*
      The band stays near-black, and that is for the logos rather than for
      decoration.

      Every one of these marks is drawn for a light background — Riverbed is
      brand orange, Ruckus is black, TM is blue and orange, and the four favicon
      marks are darker still. Cards that are permanently white on a dark band
      give every mark the background it was designed for, in both themes, and
      the band supplies the contrast that makes them read.

      It is also the only arrangement the design system allows the gradient to
      take: an orange field belongs on a near-black panel, where it is an accent
      — on light paper it would be the colour wash the first rule forbids.
    */
    <section className="relative isolate overflow-hidden border-t border-rule bg-paper-deep py-20 sm:py-24">
      <div className="partner-aurora" aria-hidden="true" />

      <Container>
        <Reveal>
          <SectionHeading
            tone="light"
            title="Authorised by the principals we support"
            lede="Warranty fulfilment and managed security only work when the vendor relationship is real. These are the principals and distributors whose products we are authorised to carry, deploy and repair."
          />
        </Reveal>
      </Container>

      {/*
       * Full-bleed, and deliberately NOT wrapped in `Reveal` — the strip has to
       * be on screen even if IntersectionObserver never fires or the reveal
       * script is slow to boot on a low-powered machine.
       */}
      {/*
       * `parallax` drifts the band vertically against the page as the section
       * arrives and as it leaves — one axis, on the strip's frame, so the
       * approach and the exit read as depth. It runs on the site's shared
       * scroll loop and switches off with the motion preference; see the effect
       * in `partner-carousel`.
       *
       * Nothing scroll-driven reaches the cards. Their only response is to the
       * pointer — the tilt, the lift and the brand rule, all on hover.
       */}
      <PartnerCarousel variant="card" tone="dark" parallax />
    </section>
  );
}
