import { MapPin } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ParallaxBand, Container, SectionHeading } from "@/components/ui";
import { regions } from "@/lib/site";

const totalCentres = regions.reduce((n, r) => n + r.centres.length, 0);

export function Coverage() {
  return (
    <ParallaxBand
      image="/media/coverage-kl.jpg"
      alt="Aerial view of the Kuala Lumpur skyline at night"
      // Measures as the LCP element on slower machines, where the sections
      // above it paint as text almost immediately.
      eager
      overlay="linear-gradient(180deg, rgb(16 21 27 / 0.93), rgb(16 21 27 / 0.88))"
    >
      <Container className="py-24 sm:py-32">
        <Reveal>
          <SectionHeading
            tone="light"
            eyebrow="Service centres"
            title={`${totalCentres} support centres nationwide`}
            lede="Coverage is what turns a four-hour SLA from a number into a commitment. Every centre carries loaner and replacement stock, and every ticket escalates through the same route regardless of which one takes it."
          />
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
          {regions.map((region, ri) => (
            <Reveal key={region.name} delay={ri * 120}>
              <h3 className="flex items-baseline gap-3 border-b border-white/20 pb-4 font-display text-sm font-semibold uppercase tracking-[0.14em] text-white">
                {region.name}
                <span className="tabular text-white/40">
                  {region.centres.length}
                </span>
              </h3>
              <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
                {region.centres.map((centre) => (
                  <li
                    key={centre}
                    className="flex items-center gap-3 border-b border-white/8 py-3.5 text-[0.95rem] text-white/75"
                  >
                    <MapPin
                      size={15}
                      strokeWidth={1.75}
                      className="shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    {centre}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Container>
    </ParallaxBand>
  );
}
