import { Reveal } from "@/components/reveal";
import { Container, SectionHeading } from "@/components/ui";
import { PartnerCarousel } from "@/components/partner-carousel";

/*
 * The moving counterpart to `sections/partners.tsx`. Both render the same list;
 * a page picks one, never both. The strip itself is `PartnerCarousel` — see
 * there for why it carries its own animation engine.
 */
export function PartnerMarquee() {
  return (
    <section className="border-t border-rule bg-paper-warm py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Accreditations"
            title="The principals we are authorised to carry"
            lede="Parts, warranty claims and managed security all depend on a real vendor relationship. These are the manufacturers and distributors whose products we deploy, support and repair under appointment."
          />
        </Reveal>
      </Container>

      {/*
       * Full-bleed, and deliberately NOT wrapped in `Reveal`: the strip has to
       * be on screen even if IntersectionObserver never fires or the reveal
       * script is slow to boot on a low-powered machine.
       */}
      <PartnerCarousel />
    </section>
  );
}
