import type { Metadata } from "next";
import { Clock, Headset, MapPin, Package, Wrench } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Container, SectionHeading } from "@/components/ui";
import { ContactCta } from "@/components/sections/contact-cta";
import { contact, regions } from "@/lib/site";

export const metadata: Metadata = {
  title: "Service Centre",
  description:
    "Eighteen HPE Solutions service centres across Peninsular Malaysia, Sabah, Sarawak and Labuan, backed by a 24 × 7 phone helpdesk.",
};

const totalCentres = regions.reduce((n, r) => n + r.centres.length, 0);

const capabilities = [
  {
    icon: Headset,
    title: "24 × 7 phone helpdesk",
    body: "A single number to call, staffed around the clock, that logs and routes the ticket wherever the fault sits.",
  },
  {
    icon: Wrench,
    title: "Walk-in repair",
    body: "Warranty claims and repairs handled over the counter at any centre, for corporate accounts and consumer customers alike.",
  },
  {
    icon: Package,
    title: "Local parts inventory",
    body: "Loaner and replacement stock held on site, which is what makes a same-day swap possible rather than aspirational.",
  },
  {
    icon: Clock,
    title: "On-site dispatch",
    body: "Engineers deployed from the nearest centre, so travel time is not quietly eating the response window.",
  },
];

export default function ServiceCentrePage() {
  return (
    <>
      <PageHero
        eyebrow="Service centre"
        title="18 support centres nationwide."
        lede="Nationwide coverage is not a marketing line for a maintenance contract — it is the difference between a four-hour response and a four-hour flight."
        image="/media/coverage-kl.jpg"
        imageAlt="Aerial view of the Kuala Lumpur skyline at night"
        crumbs={[{ label: "Service Centre" }]}
      />

      {/* Centre directory */}
      <section className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Coverage"
              title={`${totalCentres} locations, one standard of service`}
              lede="Every centre works to the same ticketing, escalation and reporting procedure, so which one takes your call changes nothing about how it is handled."
            />
          </Reveal>

          <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
            {regions.map((region, ri) => (
              <Reveal key={region.name} delay={ri * 120}>
                <h3 className="flex items-baseline gap-3 border-b border-rule-strong pb-4 font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink">
                  {region.name}
                  <span className="tabular text-ink-muted">
                    {region.centres.length}
                  </span>
                </h3>
                <ul className="grid gap-x-10 sm:grid-cols-2">
                  {region.centres.map((centre) => (
                    <li
                      key={centre.name}
                      className="flex items-center gap-3 border-b border-rule py-4 text-[0.975rem] text-ink-soft"
                    >
                      <MapPin
                        size={16}
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

          <Reveal delay={160}>
            <div className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-rule pt-10">
              <ButtonLink href="/service-centre/map">
                Open the coverage map
              </ButtonLink>
              <p className="text-[0.9rem] text-ink-muted">
                Prefer to see it geographically? Every centre is plotted on an
                interactive map.
              </p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* What each centre does */}
      <section className="border-t border-rule bg-paper-warm py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="At every centre"
              title="What every service centre delivers"
            />
          </Reveal>
          <ul className="mt-14 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((item, i) => (
              <Reveal
                as="li"
                key={item.title}
                delay={i * 90}
                className="bg-paper p-8"
              >
                <span className="flex h-12 w-12 items-center justify-center border border-rule text-brand">
                  <item.icon size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3 className="mt-6 font-display text-lg font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.925rem] leading-relaxed text-ink-soft">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Head office */}
      <section className="border-t border-rule py-24 sm:py-32">
        <Container>
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
            <Reveal>
              <SectionHeading
                eyebrow="Head office"
                title="Puchong, Selangor"
                lede="Contract administration, the helpdesk and central parts coordination all run from here."
              />
            </Reveal>
            <Reveal delay={100}>
              <div className="border-t border-rule pt-8">
                <address className="not-italic text-lg leading-relaxed text-ink">
                  {contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <a
                  href={`tel:${contact.phoneDial}`}
                  className="mt-6 inline-block font-display text-2xl font-semibold text-ink transition-colors hover:text-brand"
                >
                  {contact.phoneDisplay}
                </a>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <ContactCta />
    </>
  );
}
