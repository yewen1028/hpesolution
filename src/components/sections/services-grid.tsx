import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { DrawIcon } from "@/components/draw-icon";
import { FlickeringGrid } from "@/components/flickering-grid";
import { Container, SectionHeading, ServiceIcon } from "@/components/ui";
import { services } from "@/lib/site";

/*
 * Grid rules: the list supplies the top and left hairlines, every cell supplies
 * its own right and bottom. No nth-child arithmetic, so the frame is correct at
 * any column count. Seven services plus the closing panel fill the last row
 * exactly — one column each at sm, two columns for the panel at lg.
 */
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

        <ul className="mt-16 grid border-l border-t border-rule sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <Reveal
              as="li"
              key={service.slug}
              delay={(i % 3) * 90}
              className="border-b border-r border-rule"
            >
              <Link
                href={`/services/${service.slug}`}
                data-press="card"
                className="group flex h-full flex-col p-8 transition-colors duration-300 hover:bg-paper-warm lg:p-10"
              >
                <span className="flex h-12 w-12 items-center justify-center border border-rule text-brand transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                  {/*
                    Offset per column so a row of three does not draw in
                    lockstep. `i % 3` matches the Reveal delay above it, so the
                    stroke starts as the card finishes arriving.
                  */}
                  <DrawIcon delay={(i % 3) * 90}>
                    <ServiceIcon name={service.icon} />
                  </DrawIcon>
                </span>

                {/*
                  `wght-hover` ramps the variable axis 600 → 780 on hover of
                  the surrounding `group` link. The weight is the hover state —
                  the type thickens rather than something being added to it.
                */}
                <h3 className="display-3 wght-hover mt-7">{service.title}</h3>

                <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">
                  {service.short}
                </p>

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
          ))}

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
              className="group relative flex h-full flex-col justify-center p-8 lg:p-10"
            >
              <h3 className="display-3 max-w-md text-white">
                Not sure which scope you need?
              </h3>
              <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-white/65">
                Send us the estate and we will tell you which of these actually
                applies, and which you can leave alone.
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
      </Container>
    </section>
  );
}
