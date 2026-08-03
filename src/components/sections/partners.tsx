import { Reveal } from "@/components/reveal";
import { Container, SectionHeading } from "@/components/ui";
import { PartnerCarousel } from "@/components/partner-carousel";

export function Partners() {
  return (
    <section className="border-t border-rule bg-paper-warm py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Business partners"
            title="Authorised by the principals we support"
            lede="Warranty fulfilment and managed security only work when the vendor relationship is real. These are the principals and distributors whose products we are authorised to carry, deploy and repair."
          />
        </Reveal>

      </Container>

      {/*
       * Full-bleed card strip, and deliberately NOT wrapped in `Reveal`: the
       * carousel has to be on screen even if IntersectionObserver never fires
       * or the reveal script is slow to boot on a low-powered machine.
       */}
      <PartnerCarousel variant="card" />
    </section>
  );
}
