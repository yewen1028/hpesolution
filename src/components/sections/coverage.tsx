import { MapPin } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { MeterBar } from "@/components/meter";
import { DisplayWatermark } from "@/components/display-watermark";
import { TextMarquee } from "@/components/text-marquee";
import {
  ButtonLink,
  ParallaxBand,
  Container,
  SectionHeading,
} from "@/components/ui";
import { regions } from "@/lib/site";

const totalCentres = regions.reduce((n, r) => n + r.centres.length, 0);
const centreNames = regions.flatMap((r) => r.centres.map((c) => c.name));

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
      {/*
        The section's own figure, set as a shape. It restates the number in the
        heading, so it is decorative and hidden from assistive tech.
      */}
      <DisplayWatermark tone="light">{totalCentres}</DisplayWatermark>

      <Container className="relative z-10 py-24 sm:py-32">
        {/* `animate` reveals the eyebrow and lede itself — no <Reveal> here. */}
        <SectionHeading
          tone="light"
          animate
          underline
          eyebrow="Service centres"
          title={`${totalCentres} support centres nationwide`}
          lede="Coverage is what turns a four-hour SLA from a number into a commitment. Every centre carries loaner and replacement stock, and every ticket escalates through the same route regardless of which one takes it."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
          {regions.map((region, ri) => (
            <Reveal key={region.name} delay={ri * 120}>
              <h3 className="flex items-baseline gap-3 pb-4 font-display text-sm font-semibold uppercase tracking-[0.14em] text-white">
                {region.name}
                <span className="tabular text-white/40">
                  <Counter value={region.centres.length} />
                </span>
                <span className="ml-auto text-[0.7rem] font-normal normal-case tracking-normal text-white/35">
                  <Counter value={region.centres.length} /> of {totalCentres}
                </span>
              </h3>
              {/*
                The share of the network this region carries — the figure was
                already on the page as text; this is the same number drawn.
              */}
              <MeterBar
                tone="light"
                value={region.centres.length}
                total={totalCentres}
                label={`${region.name}: ${region.centres.length} of ${totalCentres} service centres`}
              />
              <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
                {region.centres.map((centre) => (
                  <li
                    key={centre.name}
                    className="flex items-center gap-3 border-b border-white/8 py-3.5 text-[0.95rem] text-white/75"
                  >
                    <MapPin
                      size={15}
                      strokeWidth={1.75}
                      className="shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    {centre.name}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        {/*
          Every town with a centre, on a loop. Real data — the same
          `regions[].centres` the maps read — so the strip says something
          rather than repeating a slogan.
        */}
        <div className="mt-16 border-y border-white/12">
          <TextMarquee items={centreNames} tone="light" duration={64} />
        </div>

        <Reveal delay={160}>
          <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4">
            <ButtonLink href="/service-centre/map" variant="light">
              View the coverage map
            </ButtonLink>
            <p className="text-[0.9rem] text-white/55">
              See every centre plotted, and find the one nearest your sites.
            </p>
          </div>
        </Reveal>
      </Container>
    </ParallaxBand>
  );
}
