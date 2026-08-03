import { Reveal } from "@/components/reveal";
import { Container, SectionHeading } from "@/components/ui";
import { partners } from "@/lib/site";

export function Partners() {
  return (
    <section className="border-t border-rule bg-paper-warm py-24 sm:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Business partners"
            title="Accredited on the platforms we support"
            lede="Warranty fulfilment and managed security only work when the vendor relationship is real. These are the principals and distributors whose products we are authorised to carry, deploy and repair."
          />
        </Reveal>

        {/* Typographic wordmarks: a partner list, not a logo soup. */}
        <Reveal delay={100}>
          <ul className="mt-16 grid grid-cols-2 border-l border-t border-rule sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {partners.map((partner) => (
              <li
                key={partner}
                className="flex min-h-24 items-center justify-center border-b border-r border-rule bg-paper px-4 py-6 text-center font-display text-[0.95rem] font-semibold tracking-tight text-ink-soft transition-colors duration-300 hover:bg-brand-tint hover:text-brand"
              >
                {partner}
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
